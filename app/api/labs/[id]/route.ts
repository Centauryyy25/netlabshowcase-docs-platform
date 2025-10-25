import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { labs, labFiles, user } from '@/db';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import DOMPurify from 'isomorphic-dompurify';
import { defineRoute } from '@/types/route';

type LabRouteParams = { id: string };

export const GET = defineRoute<LabRouteParams>(async (request: NextRequest, { params }) => {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Lab ID is required' },
        { status: 400 }
      );
    }

    // Get the lab with user information
    const [labData] = await db
      .select({
        id: labs.id,
        title: labs.title,
        description: labs.description,
        labNotes: labs.labNotes,
        category: labs.category,
        difficulty: labs.difficulty,
        status: labs.status,
        tags: labs.tags,
        topologyImageUrl: labs.topologyImageUrl,
        createdAt: labs.createdAt,
        updatedAt: labs.updatedAt,
        author: {
          id: user.id,
          name: user.name,
          image: user.image,
        },
      })
      .from(labs)
      .leftJoin(user, eq(labs.userId, user.id))
      .where(eq(labs.id, id));

    if (!labData) {
      return NextResponse.json(
        { error: 'Lab not found' },
        { status: 404 }
      );
    }

    // Get lab files
    const files = await db
      .select()
      .from(labFiles)
      .where(eq(labFiles.labId, id))
      .orderBy(labFiles.createdAt);

    return NextResponse.json({
      lab: labData,
      files,
    });
  } catch (error) {
    console.error('Error fetching lab:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lab' },
      { status: 500 }
    );
  }
});

export const PUT = defineRoute<LabRouteParams>(async (request: NextRequest, { params }) => {
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

    const { id } = params;
    const body = await request.json();

    // Check if lab exists and belongs to user
    const [existingLab] = await db
      .select()
      .from(labs)
      .where(and(eq(labs.id, id), eq(labs.userId, session.user.id)));

    if (!existingLab) {
      return NextResponse.json(
        { error: 'Lab not found or access denied' },
        { status: 404 }
      );
    }

    // Update the lab
    const [updatedLab] = await db
      .update(labs)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(labs.id, id))
      .returning();

    return NextResponse.json({ lab: updatedLab });
  } catch (error) {
    console.error('Error updating lab:', error);
    return NextResponse.json(
      { error: 'Failed to update lab' },
      { status: 500 }
    );
  }
});

export const PATCH = defineRoute<LabRouteParams>(async (request: NextRequest, { params }) => {
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

    const { id } = params;
    const body = await request.json().catch(() => ({}));
    const rawNotes = typeof body.labNotes === 'string' ? body.labNotes : '';
    const sanitizedNotes = DOMPurify.sanitize(rawNotes);

    const [existingLab] = await db
      .select({ userId: labs.userId })
      .from(labs)
      .where(eq(labs.id, id));

    if (!existingLab) {
      return NextResponse.json(
        { error: 'Lab not found' },
        { status: 404 }
      );
    }

    if (existingLab.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const [updatedLab] = await db
      .update(labs)
      .set({
        labNotes: sanitizedNotes,
        updatedAt: new Date(),
      })
      .where(eq(labs.id, id))
      .returning({
        labNotes: labs.labNotes,
        updatedAt: labs.updatedAt,
      });

    return NextResponse.json({ lab: updatedLab });
  } catch (error) {
    console.error('Error updating lab notes:', error);
    return NextResponse.json(
      { error: 'Failed to update lab notes' },
      { status: 500 }
    );
  }
});

export const DELETE = defineRoute<LabRouteParams>(async (request: NextRequest, { params }) => {
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

    const { id } = params;

    // Check if lab exists and belongs to user
    const [existingLab] = await db
      .select()
      .from(labs)
      .where(and(eq(labs.id, id), eq(labs.userId, session.user.id)));

    if (!existingLab) {
      return NextResponse.json(
        { error: 'Lab not found or access denied' },
        { status: 404 }
      );
    }

    // Delete the lab (this will also delete associated files due to cascade)
    await db.delete(labs).where(eq(labs.id, id));

    return NextResponse.json({ message: 'Lab deleted successfully' });
  } catch (error) {
    console.error('Error deleting lab:', error);
    return NextResponse.json(
      { error: 'Failed to delete lab' },
      { status: 500 }
    );
  }
});
