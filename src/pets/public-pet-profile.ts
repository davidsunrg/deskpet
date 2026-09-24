export type PublicPetProfileStatKind =
  | 'loved'
  | 'photos'
  | 'stories'
  | 'memories';

export type PublicPetProfileStat = {
  kind: PublicPetProfileStatKind;
  value: number;
  label: string;
};

export type PublicPetProfileGalleryItem = {
  id: string;
  label: string;
  tone: 'cream' | 'meadow' | 'blossom' | 'autumn';
};

export type PublicPetProfile = {
  handle: string;
  name: string;
  breed: string;
  age: string;
  eyebrow: string;
  note: string;
  sideNote: string;
  footerNote: string;
  stats: PublicPetProfileStat[];
  gallery: PublicPetProfileGalleryItem[];
  remainingGalleryCount: number;
};

const HANDLE_PATTERN = /^[a-z0-9](?:[a-z0-9._-]{1,28}[a-z0-9])$/;

const publicPetProfiles: Record<string, PublicPetProfile> = {
  copper: {
    handle: 'copper',
    name: 'Copper',
    breed: 'Golden Retriever',
    age: '3 years old',
    eyebrow: 'A little page for a big love',
    note: 'Home is brighter with you.',
    sideNote: 'Good dogs make a brighter world.',
    footerNote: 'Same adventures. A brighter tomorrow.',
    stats: [
      { kind: 'loved', value: 128, label: 'Loved by' },
      { kind: 'photos', value: 342, label: 'Photos' },
      { kind: 'stories', value: 24, label: 'Stories' },
      { kind: 'memories', value: 12, label: 'Memories' },
    ],
    gallery: [
      { id: 'portrait', label: 'Copper portrait', tone: 'cream' },
      { id: 'meadow', label: 'Running through the meadow', tone: 'meadow' },
      { id: 'flowers', label: 'A spring afternoon', tone: 'blossom' },
      { id: 'leaves', label: 'Autumn walk', tone: 'autumn' },
    ],
    remainingGalleryCount: 56,
  },
};

export function normalizePublicPetHandle(handle: string): string | null {
  let normalized: string;
  try {
    normalized = decodeURIComponent(handle).trim().toLowerCase();
  } catch {
    return null;
  }

  return HANDLE_PATTERN.test(normalized) ? normalized : null;
}

export function getPublicPetProfile(handle: string): PublicPetProfile | null {
  const normalized = normalizePublicPetHandle(handle);
  if (!normalized) return null;
  return publicPetProfiles[normalized] ?? null;
}
