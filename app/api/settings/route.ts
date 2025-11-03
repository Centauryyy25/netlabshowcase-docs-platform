import { NextResponse } from 'next/server';
import { defineRoute } from '@/types/route';
import { auth } from '@/lib/auth';
import { db, userPreferences } from '@/db';
import { eq } from 'drizzle-orm';

const DEFAULT_PREFERENCES = {
  theme: 'system' as const,
  labUpdates: true,
  digestEmails: false,
  supabaseConnected: true,
  betterAuthConnected: true,
};

export const GET = defineRoute(async (request) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [existingPreferences] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, session.user.id))
      .limit(1);

    let resolvedPreferences = existingPreferences;

    if (!resolvedPreferences) {
      const [createdPreferences] = await db
        .insert(userPreferences)
        .values({ userId: session.user.id })
        .onConflictDoNothing({ target: userPreferences.userId })
        .returning();

      resolvedPreferences = createdPreferences ?? {
        userId: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...DEFAULT_PREFERENCES,
      };
    }

    return NextResponse.json({
      profile: {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
      },
      preferences: {
        theme: resolvedPreferences.theme ?? DEFAULT_PREFERENCES.theme,
        labUpdates: resolvedPreferences.labUpdates ?? DEFAULT_PREFERENCES.labUpdates,
        digestEmails: resolvedPreferences.digestEmails ?? DEFAULT_PREFERENCES.digestEmails,
        supabaseConnected: resolvedPreferences.supabaseConnected ?? DEFAULT_PREFERENCES.supabaseConnected,
        betterAuthConnected: resolvedPreferences.betterAuthConnected ?? DEFAULT_PREFERENCES.betterAuthConnected,
      },
    });
  } catch (error) {
    console.error('Failed to load user settings', error);
    return NextResponse.json(
      { error: 'Failed to load user settings' },
      { status: 500 },
    );
  }
});
