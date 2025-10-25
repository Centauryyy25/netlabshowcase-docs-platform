import { Buffer } from 'node:buffer';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { labs } from '@/db';
import { and, eq } from 'drizzle-orm';
import { getSupabaseServerClient } from '@/utils/supabaseServer';
import { defineRoute } from '@/types/route';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];

type LabRouteParams = { id: string };

export const POST = defineRoute<LabRouteParams>(async (request: NextRequest, { params }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: labId } = params;
    if (!labId) {
      return NextResponse.json({ error: 'Lab ID is required' }, { status: 400 });
    }

    // Verify ownership
    const [ownedLab] = await db
      .select({ id: labs.id, userId: labs.userId, topologyImageUrl: labs.topologyImageUrl })
      .from(labs)
      .where(and(eq(labs.id, labId), eq(labs.userId, session.user.id)));

    if (!ownedLab) {
      return NextResponse.json({ error: 'Lab not found or access denied' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid image type. Allowed: PNG, JPG, GIF' }, { status: 400 });
    }

    // Upload to Supabase Storage
    const supabaseServer = getSupabaseServerClient();
    const bucket = 'labs-topologies';
    const filePath = `topologies/${Date.now()}-${file.name}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseServer.storage
      .from(bucket)
      .upload(filePath, buffer, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
    }

    const { data: urlData } = supabaseServer.storage
      .from(bucket)
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    const [updatedLab] = await db
      .update(labs)
      .set({ topologyImageUrl: publicUrl, updatedAt: new Date() })
      .where(eq(labs.id, labId))
      .returning();

    return NextResponse.json({ lab: updatedLab }, { status: 200 });
  } catch (error) {
    console.error('Error updating topology image:', error);
    const message = error instanceof Error ? error.message : 'Failed to update topology image';
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
