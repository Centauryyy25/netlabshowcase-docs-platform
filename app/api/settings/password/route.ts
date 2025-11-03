import { NextResponse } from 'next/server';
import { z } from 'zod';
import { defineRoute } from '@/types/route';
import { auth } from '@/lib/auth';

const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(8, 'Current password must be at least 8 characters long'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters long'),
  revokeOtherSessions: z.boolean().optional(),
});

export const POST = defineRoute(async (request) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword, revokeOtherSessions } =
      changePasswordSchema.parse(body);

    await auth.api.changePassword({
      headers: request.headers,
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: revokeOtherSessions ?? false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to change password', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid password payload', details: error.flatten() },
        { status: 400 },
      );
    }

    const message =
      error instanceof Error && error.message
        ? error.message
        : 'Failed to change password';

    return NextResponse.json({ error: message }, { status: 400 });
  }
});
