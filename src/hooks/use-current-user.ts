import { authClient } from '@/auth/client';

export function useCurrentUser() {
  const { data: session, error } = authClient.useSession();
  if (error) {
    console.error('useCurrentUser, error:', error);
    return null;
  }
  return session?.user ?? null;
}
