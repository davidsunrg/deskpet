import { auth } from '@/auth/auth';
import { isRealSignedInUser } from '@/lib/auth/session-identity';
import type { MarketingNavbarIdentity } from '@/lib/auth/marketing-identity';
import { listUserPets } from '@/server/pets/list-user-pets';

export async function getMarketingNavbarIdentity(
  headers: Headers
): Promise<MarketingNavbarIdentity> {
  const session = await auth.api.getSession({ headers });

  if (!session?.user || !isRealSignedInUser(session.user)) {
    return { user: null, pet: null };
  }

  try {
    const pets = await listUserPets(session.user.id);
    const activePet = pets.find((pet) => pet.enabled) ?? pets[0] ?? null;

    return {
      user: session.user,
      pet: activePet
        ? {
            name: activePet.displayName,
            avatar: activePet.avatar,
          }
        : null,
    };
  } catch (error) {
    console.error('getMarketingNavbarIdentity failed to load pets:', error);
    return { user: session.user, pet: null };
  }
}
