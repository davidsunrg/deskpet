import { authClient } from '@/lib/auth/auth-client';

export async function ensureAnonymousSession(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const session = await authClient.getSession();
  if (session.data?.user) {
    return { ok: true };
  }

  const result = await authClient.signIn.anonymous();
  if (result.error) {
    return {
      ok: false,
      error: result.error.message ?? 'Please sign in to continue.',
    };
  }

  return { ok: true };
}
