import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { labFiles, labs } from '@/db';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';

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

    // In a production environment, you would upload to a cloud storage service
    // For now, we'll simulate file storage with a placeholder URL
    const fileUrl = `/uploads/${nanoid()}-${file.name}`;

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
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to upload file' },
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

    // In a real implementation, you would:
    // 1. Verify the user owns this file (by joining with labs table)
    // 2. Delete the file from cloud storage
    // 3. Delete the file record from database

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