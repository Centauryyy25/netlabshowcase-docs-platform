import { NextResponse } from 'next/server';
import { db, labs } from '@/db';
import { nanoid } from 'nanoid';

type CreateLabBody = {
  title: string;
  description: string;
  labNotes?: string | null;
  category: string;
  difficulty: string;
  user_id: string;
  topology_image_url?: string | null;
  status?: 'draft' | 'published';
  tags?: string[];
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateLabBody;

    const newLab = {
      id: nanoid(),
      title: body.title,
      description: body.description,
      labNotes: body.labNotes ?? null,
      category: body.category,
      difficulty: body.difficulty,
      userId: body.user_id,
      topologyImageUrl: body.topology_image_url ?? null,
      status: body.status ?? 'published',
      tags: body.tags ?? [],
    };

    const [created] = await db.insert(labs).values(newLab).returning();
    return NextResponse.json({ success: true, data: created });
  } catch (error) {
    console.error('Error creating lab:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
