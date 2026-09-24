import { GOLDEN_RETRIEVER_PUBLIC_PLAY_CLIP_SRCS } from '@/pets/public-pet-profile-play-clips';

export type PublicPetProfile = {
  handle: string;
  name: string;
  breed: string;
  age: string;
  description: string;
  bannerSrc: string;
  /** Hero `object-position` Tailwind classes (focal point per artwork). */
  bannerObjectClass?: string;
  /** Three animated clips (WebM/video or image) for the play section. */
  playClipSrcs?: readonly [string, string, string];
  /** `?pet=` key for Open Playground. */
  playgroundPetKey?: string;
  traits: readonly string[];
  about: string;
  stats: readonly {
    label: string;
    value: string;
  }[];
};

const PUBLIC_PET_PROFILES: Record<string, PublicPetProfile> = {
  copper: {
    handle: 'copper',
    name: 'Copper',
    breed: 'Golden Retriever',
    age: '3 years old',
    description: 'My little adventure buddy.',
    bannerSrc: '/sites/copper/banner.png',
    playClipSrcs: GOLDEN_RETRIEVER_PUBLIC_PLAY_CLIP_SRCS,
    playgroundPetKey: 'golden-retriever',
    traits: ['Playful', 'Smart', 'Affectionate', 'Adventurous'],
    about:
      'Copper is happiest close to the people he loves. Whether he is exploring outside, settling in for a quiet afternoon, or keeping you company on the desktop, he brings warm and playful energy everywhere he goes.',
    stats: [
      { label: 'Breed', value: 'Golden Retriever' },
      { label: 'Age', value: '3 years old' },
      { label: 'Temperament', value: 'Friendly & affectionate' },
      { label: 'Activity', value: 'Medium to high' },
      { label: 'Best for', value: 'Families & adventures' },
      { label: 'Availability', value: 'Playable online' },
    ],
  },
  laika: {
    handle: 'laika',
    name: 'Laika',
    breed: 'Golden Retriever',
    age: '3 years old',
    description: 'My little adventure buddy.',
    bannerSrc: '/sites/laika/banner.png',
    playClipSrcs: GOLDEN_RETRIEVER_PUBLIC_PLAY_CLIP_SRCS,
    playgroundPetKey: 'golden-retriever',
    traits: ['Playful', 'Smart', 'Affectionate', 'Adventurous'],
    about:
      'Laika is happiest close to the people she loves. Whether she is exploring outside, settling in for a quiet afternoon, or keeping you company on the desktop, she brings warm and playful energy everywhere she goes.',
    stats: [
      { label: 'Breed', value: 'Golden Retriever' },
      { label: 'Age', value: '3 years old' },
      { label: 'Temperament', value: 'Friendly & affectionate' },
      { label: 'Activity', value: 'Medium to high' },
      { label: 'Best for', value: 'Families & adventures' },
      { label: 'Availability', value: 'Playable online' },
    ],
  },
};

const HANDLE_PATTERN = /^[a-z0-9](?:[a-z0-9._-]{1,28}[a-z0-9])$/;

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
  return PUBLIC_PET_PROFILES[normalized] ?? null;
}
