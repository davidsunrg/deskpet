import type { User } from 'better-auth';
import { auth } from '@/auth/auth';
import { getDb } from '@/db';
import { user } from '@/db/auth.schema';
import { runOnCreateUserSideEffects } from '@/server/auth/on-create-user';
import { eq, or } from 'drizzle-orm';
import normalizeEmail from 'validator/lib/normalizeEmail';

function displayNameFromEmail(email: string): string {
  const local = email.split('@')[0]?.trim() ?? '';
  return local || email;
}

/**
 * Creates an unverified user (no password / credential account), then sends
 * an email-verification OTP via Better Auth — same flow as deskpet-next.
 */
export async function signupWithOtp(input: {
  email: string;
  headers: Headers;
}): Promise<{ success: true }> {
  const email = input.email.trim().toLowerCase();
  const normalized = normalizeEmail(email);
  if (!normalized) {
    throw new Error('Enter a valid email');
  }

  const name = displayNameFromEmail(email);
  const db = getDb();

  const [existing] = await db
    .select({ id: user.id })
    .from(user)
    .where(or(eq(user.email, email), eq(user.normalizedEmail, normalized)))
    .limit(1);

  if (existing) {
    throw new Error(
      'An account with this email already exists. Sign in instead.'
    );
  }

  const id = crypto.randomUUID();
  const now = new Date();

  await db.insert(user).values({
    id,
    name,
    email,
    normalizedEmail: normalized,
    emailVerified: false,
    isAnonymous: false,
    createdAt: now,
    updatedAt: now,
  });

  // databaseHooks.user.create.after only runs through Better Auth adapters.
  await runOnCreateUserSideEffects({
    id,
    name,
    email,
    emailVerified: false,
    createdAt: now,
    updatedAt: now,
    image: null,
  } as User);

  await auth.api.sendVerificationOTP({
    body: {
      email,
      type: 'email-verification',
    },
    headers: input.headers,
  });

  return { success: true };
}
