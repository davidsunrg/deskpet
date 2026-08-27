import { auth } from '@/auth/auth';
import { getDb } from '@/db';
import { user } from '@/db/auth.schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

function displayNameFromEmail(email: string): string {
  const local = email.split('@')[0]?.trim() ?? '';
  return local || email;
}

export async function signupWithOtp(input: {
  email: string;
  headers: Headers;
}): Promise<{ success: true }> {
  const email = input.email.trim().toLowerCase();
  const name = displayNameFromEmail(email);
  const db = getDb();

  const [existing] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (existing) {
    throw new Error(
      'An account with this email already exists. Sign in instead.'
    );
  }

  const signUpResult = await auth.api.signUpEmail({
    body: {
      email,
      password: nanoid(32),
      name,
    },
    headers: input.headers,
    asResponse: true,
  });

  if (!signUpResult.ok) {
    const body = (await signUpResult.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(body?.message ?? 'Unable to create account.');
  }

  await auth.api.sendVerificationOTP({
    body: {
      email,
      type: 'email-verification',
    },
    headers: input.headers,
  });

  return { success: true };
}
