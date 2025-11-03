import { NextResponse } from 'next/server';
import { z } from 'zod';
import { defineRoute } from '@/types/route';
import { auth } from '@/lib/auth';
import { db, userPreferences } from '@/db';
import { eq } from 'drizzle-orm';

const updatePreferencesSchema = z.object({
  theme: z.enum(['system', 'light', 'dark']).optional(),
  labUpdates: z.boolean().optional(),
  digestEmails: z.boolean().optional(),
  supabaseConnected: z.boolean().optional(),
  betterAuthConnected: z.boolean().optional(),
});

export const PATCH = defineRoute(async (request) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updates = updatePreferencesSchema.parse(body);

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: true });
    }

    const patch = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined),
    );

    const hasUpdates = Object.keys(patch).length > 0;

    if (!hasUpdates) {
      return NextResponse.json({ success: true });
    }

    const [existingPreferences] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, session.user.id))
      .limit(1);

    if (existingPreferences) {
      await db
        .update(userPreferences)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(userPreferences.userId, session.user.id));
    } else {
      await db
        .insert(userPreferences)
        .values({
          userId: session.user.id,
          ...patch,
        })
        .onConflictDoUpdate({
          target: userPreferences.userId,
          set: { ...patch, updatedAt: new Date() },
        });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update preferences', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid preference data', details: error.flatten() },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 },
    );
  }
});
