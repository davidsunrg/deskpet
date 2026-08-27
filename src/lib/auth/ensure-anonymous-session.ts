import { authClient } from '@/auth/client';

export async function ensureAnonymousSession(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const session = await authClient.getSession();
  if (session.data?.user) {
    return { ok: true };
  }
  return {
    ok: false,
    error: 'Please sign in to continue.',
  };
}
