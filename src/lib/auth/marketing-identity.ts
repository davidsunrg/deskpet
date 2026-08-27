import type { SessionUser } from '@/auth/types';

export type MarketingNavbarPet = {
  name: string;
  avatar: string | null;
};

export type MarketingNavbarIdentity = {
  user: SessionUser | null;
  pet: MarketingNavbarPet | null;
};
