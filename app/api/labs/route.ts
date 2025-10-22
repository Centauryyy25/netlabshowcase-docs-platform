import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { labs, user } from '@/db';
import { eq, desc, and, ilike } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { nanoid } from 'nanoid';

const createLabSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description too long'),
  category: z.enum(['Routing', 'Switching', 'Security', 'MPLS', 'Wireless', 'Voice', 'Data Center', 'Other']),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  status: z.enum(['draft', 'published']).default('draft'),
  tags: z.array(z.string()).optional(),
  topologyImageUrl: z.string().url().optional(),
});

const getLabsSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
  category: z.string().optional(),
  difficulty: z.string().optional(),
  search: z.string().optional(),
  status: z.string().optional().default('published'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams);

    const { page, limit, category, difficulty, search, status } = getLabsSchema.parse(queryParams);

    const offset = (page - 1) * limit;

    // Build the query conditions
    const conditions = [];

    if (status) {
      conditions.push(eq(labs.status, status));
    }

    if (category) {
      conditions.push(eq(labs.category, category));
    }

    if (difficulty) {
      conditions.push(eq(labs.difficulty, difficulty));
    }

    if (search) {
      conditions.push(
        ilike(labs.title, `%${search}%`)
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get labs with user information
    const labsData = await db
      .select({
        id: labs.id,
        title: labs.title,
        description: labs.description,
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
      .where(whereClause)
      .orderBy(desc(labs.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCount = await db
      .select({ count: { id: labs.id } })
      .from(labs)
      .where(whereClause)
      .then(result => result.length);

    return NextResponse.json({
      labs: labsData,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching labs:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch labs' },
      { status: 500 }
    );
  }
}

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

    const body = await request.json();
    const validatedData = createLabSchema.parse(body);

    const newLab = {
      id: nanoid(),
      userId: session.user.id,
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const [createdLab] = await db
      .insert(labs)
      .values(newLab)
      .returning();

    return NextResponse.json(
      { lab: createdLab },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating lab:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create lab' },
      { status: 500 }
    );
  }
}