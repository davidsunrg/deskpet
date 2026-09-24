import { PetActionClip } from '@/enums/pet-action-clip';
import { resolvePetMediaUrl } from '@/lib/pet-media';
import { goldenRetrieverResources } from '@/pets/dog/golden-retriever';

/** Showcase clips for public profile Desktop Pet section (Copper / golden retriever). */
const GOLDEN_RETRIEVER_PROFILE_CLIP_KEYS = [
  PetActionClip.SitIdle,
  PetActionClip.Tease,
  PetActionClip.Lick,
] as const;

function goldenRetrieverClipUrl(key: PetActionClip): string {
  const action = goldenRetrieverResources.actions.find(
    (entry) => entry.key === key
  );
  if (!action) {
    throw new Error(`Golden Retriever clip not found: ${key}`);
  }
  return resolvePetMediaUrl(action.r2Key);
}

export const GOLDEN_RETRIEVER_PUBLIC_PLAY_CLIP_SRCS = [
  goldenRetrieverClipUrl(GOLDEN_RETRIEVER_PROFILE_CLIP_KEYS[0]),
  goldenRetrieverClipUrl(GOLDEN_RETRIEVER_PROFILE_CLIP_KEYS[1]),
  goldenRetrieverClipUrl(GOLDEN_RETRIEVER_PROFILE_CLIP_KEYS[2]),
] as const;

export const GOLDEN_RETRIEVER_PUBLIC_PLAY_CLIP_LABELS = [
  'Sit idle',
  'Playful tease',
  'Friendly lick',
] as const;
