import { Buffer } from 'node:buffer';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseServerClient } from '@/utils/supabaseServer';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
const BUCKET_NAME = 'labs-topologies';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folderParam = (formData.get('folder') as string | null) ?? 'topologies';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid image type. Allowed: PNG, JPG, GIF' }, { status: 400 });
    }

    const sanitizedFolder = folderParam
      .split('/')
      .map((segment) => segment.trim())
      .filter(Boolean)
      .map((segment) => segment.replace(/[^a-zA-Z0-9_-]/g, '_'))
      .join('/');

    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const folderPath = sanitizedFolder.length > 0 ? sanitizedFolder : 'topologies';
    const filePath = `${folderPath}/${Date.now()}-${sanitizedFileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const supabase = getSupabaseServerClient();
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      data: {
        bucket: BUCKET_NAME,
        path: filePath,
        publicUrl: urlData.publicUrl,
      },
    });
  } catch (error) {
    console.error('Storage upload failed:', error);
    const message = error instanceof Error ? error.message : 'Storage upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { error: removeError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (removeError) {
      return NextResponse.json({ error: removeError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Storage delete failed:', error);
    const message = error instanceof Error ? error.message : 'Storage delete failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
