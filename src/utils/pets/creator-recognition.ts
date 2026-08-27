import type {
  CreatorPetRecognitionData,
  CreatorRecognitionCache,
  CreatorRecognitionSpecies,
} from '@/types/creator-recognition';
import {
  getPetBreedLabel,
  listPetBreedsForSpecies,
  PetBreed,
  type PetSpecies,
} from '@/utils/pet-catalog';
import { z } from 'zod';

const MAX_STRING_ITEMS = 12;
const MAX_STRING_LENGTH = 80;

/** Stable fingerprint for media-id cache comparison. */
export function fingerprintMediaIds(mediaIds: string[]): string {
  return [...mediaIds].sort().join(',');
}

export function mediaIdsMatch(
  a: string[] | null | undefined,
  b: string[] | null | undefined
): boolean {
  if (!a?.length || !b?.length) return false;
  return fingerprintMediaIds(a) === fingerprintMediaIds(b);
}

/** Narrow unknown JSON from `pet.creator_recognition`. */
export function asCreatorRecognitionCache(
  value: unknown
): CreatorRecognitionCache | null {
  if (!value || typeof value !== 'object') return null;
  const cache = value as CreatorRecognitionCache;
  if (!Array.isArray(cache.mediaIds) || !cache.result || !cache.model) {
    return null;
  }
  return {
    ...cache,
    result: normalizeCreatorPetRecognitionData(cache.result),
  };
}

const rawRecognitionSchema = z
  .object({
    species: z.string().optional(),
    breed: z.string().optional(),
    likelyBreed: z.string().optional(),
    confidence: z.number().optional(),
    colors: z.array(z.unknown()).optional(),
    markings: z.array(z.unknown()).optional(),
    visiblePose: z.string().optional(),
    notes: z.string().optional(),
  })
  .passthrough();

function clampConfidence(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const items: string[] = [];
  for (const entry of value) {
    if (typeof entry !== 'string') continue;
    const trimmed = entry.trim().slice(0, MAX_STRING_LENGTH);
    if (!trimmed) continue;
    items.push(trimmed);
    if (items.length >= MAX_STRING_ITEMS) break;
  }
  return items;
}

function normalizeSpecies(value: unknown): CreatorRecognitionSpecies {
  if (typeof value !== 'string') return 'unknown';
  const normalized = value.trim().toLowerCase();
  if (
    normalized === 'cat' ||
    normalized === 'dog' ||
    normalized === 'character' ||
    normalized === 'unknown'
  ) {
    return normalized;
  }
  return 'unknown';
}

function normalizeMatchKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ');
}

function normalizeBreedForSpecies(
  species: CreatorRecognitionSpecies,
  breed: unknown,
  likelyBreed?: unknown
): string {
  // Detection-only species are not in the product catalog — never look up breeds.
  if (species === 'unknown' || species === 'character') return PetBreed.Any;

  const candidates = [breed, likelyBreed]
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);

  const options = listPetBreedsForSpecies(species as PetSpecies);

  for (const candidate of candidates) {
    const lower = candidate.toLowerCase();
    if (options.includes(lower as (typeof options)[number])) {
      return lower;
    }
  }

  for (const candidate of candidates) {
    const likelyKey = normalizeMatchKey(candidate);
    const likelyCompact = likelyKey.replace(/\s+/g, '');
    for (const option of options) {
      const idKey = normalizeMatchKey(option);
      const labelKey = normalizeMatchKey(getPetBreedLabel(option));
      if (
        likelyKey === idKey ||
        likelyKey === labelKey ||
        likelyCompact === idKey.replace(/\s+/g, '') ||
        likelyCompact === labelKey.replace(/\s+/g, '')
      ) {
        return option;
      }
    }
  }

  return PetBreed.Any;
}

/**
 * Validate and coerce raw Ark JSON into a catalog-constrained recognition result.
 */
export function normalizeCreatorPetRecognitionData(
  input: unknown
): CreatorPetRecognitionData {
  const parsed = rawRecognitionSchema.safeParse(input);
  const raw = parsed.success ? parsed.data : {};

  const species = normalizeSpecies(raw.species);
  const breed = normalizeBreedForSpecies(species, raw.breed, raw.likelyBreed);

  return {
    species,
    breed,
    confidence: clampConfidence(raw.confidence),
    colors: normalizeStringList(raw.colors),
    markings: normalizeStringList(raw.markings),
    visiblePose:
      typeof raw.visiblePose === 'string'
        ? raw.visiblePose.trim().slice(0, MAX_STRING_LENGTH)
        : '',
    notes:
      typeof raw.notes === 'string'
        ? raw.notes.trim().slice(0, MAX_STRING_LENGTH)
        : '',
  };
}
