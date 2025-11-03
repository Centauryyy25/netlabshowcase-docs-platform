import { NextResponse } from 'next/server';
import { z } from 'zod';
import { defineRoute } from '@/types/route';
import { auth } from '@/lib/auth';

const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Display name must be at least 2 characters long')
    .max(80, 'Display name must be 80 characters or fewer'),
  image: z
    .string()
    .url('Image must be a valid URL')
    .max(2048)
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

export const PATCH = defineRoute(async (request) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, image } = updateProfileSchema.parse(body);

    await auth.api.updateUser({
      headers: request.headers,
      body: image ? { name, image } : { name },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update profile', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid profile data', details: error.flatten() },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 },
    );
  }
});
