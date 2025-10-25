import { Buffer } from 'node:buffer';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { labFiles, labs } from '@/db';
import { nanoid } from 'nanoid';
import { eq, and } from 'drizzle-orm';
import { getSupabaseServerClient } from '@/utils/supabaseServer';

const uploadSchema = z.object({
  labId: z.string().min(1, 'Lab ID is required'),
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().min(1, 'File type is required'),
  fileSize: z.number().min(1, 'File size must be greater than 0'),
  description: z.string().optional(),
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'application/zip',
  'application/x-zip-compressed',
  'text/plain',
  'application/octet-stream', // For .pkt files
  'text/x-log',
  'text/x-config',
];

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const labId = formData.get('labId') as string;
    const description = formData.get('description') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed types: PNG, JPG, GIF, ZIP, TXT, PKT' },
        { status: 400 }
      );
    }

    // Validate other fields
    const validatedData = uploadSchema.parse({
      labId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      description: description || null,
    });

    // Verify the lab exists and belongs to the authenticated user
    const [ownedLab] = await db
      .select({ id: labs.id, userId: labs.userId })
      .from(labs)
      .where(and(eq(labs.id, validatedData.labId), eq(labs.userId, session.user.id)));

    if (!ownedLab) {
      return NextResponse.json(
        { error: 'Lab not found or access denied' },
        { status: 403 }
      );
    }

    // Upload to Supabase Storage
    const bucket = 'labs-topologies';
    const path = `topologies/${Date.now()}-${file.name}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const supabaseServer = getSupabaseServerClient();

    const { error: uploadError } = await supabaseServer.storage
      .from(bucket)
      .upload(path, buffer, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
    }

    const { data: urlData } = supabaseServer.storage
      .from(bucket)
      .getPublicUrl(path);
    const fileUrl = urlData.publicUrl;

    // Store file metadata in database
    const newFile = {
      id: nanoid(),
      labId: validatedData.labId,
      fileName: validatedData.fileName,
      fileUrl,
      fileType: validatedData.fileType,
      fileSize: validatedData.fileSize,
      description: validatedData.description,
      createdAt: new Date(),
    };

    const [createdFile] = await db
      .insert(labFiles)
      .values(newFile)
      .returning();

    return NextResponse.json(
      { file: createdFile },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading file:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : 'Failed to upload file';

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    // Verify file exists
    const [file] = await db
      .select({ id: labFiles.id, labId: labFiles.labId })
      .from(labFiles)
      .where(eq(labFiles.id, fileId));

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Verify the authenticated user owns the parent lab
    const [ownedLab] = await db
      .select({ id: labs.id })
      .from(labs)
      .where(and(eq(labs.id, file.labId), eq(labs.userId, session.user.id)));

    if (!ownedLab) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Delete the file record (and optionally from storage if tracking path)
    await db.delete(labFiles).where(eq(labFiles.id, fileId));

    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
