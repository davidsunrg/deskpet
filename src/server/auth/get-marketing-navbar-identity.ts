import { auth } from '@/auth/auth';
import { isRealSignedInUser } from '@/lib/auth/session-identity';
import type { MarketingNavbarIdentity } from '@/lib/auth/marketing-identity';

export async function getMarketingNavbarIdentity(
  headers: Headers
): Promise<MarketingNavbarIdentity> {
  const session = await auth.api.getSession({ headers });

  if (!session?.user || !isRealSignedInUser(session.user)) {
    return { user: null, pet: null };
  }

  return { user: session.user, pet: null };
}
