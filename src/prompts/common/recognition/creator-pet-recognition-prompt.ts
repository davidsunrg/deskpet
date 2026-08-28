import {
  getPetBreedLabel,
  listPetBreedsForSpecies,
  PET_SPECIES_VALUES,
} from '@/utils/pet-catalog';

const RECOGNITION_SPECIES = ['cat', 'dog', 'character', 'unknown'] as const;

export type RecognitionCatalogSnapshot = {
  species: string[];
  breedsBySpecies: Record<string, string[]>;
  promptOptionsText: string;
};

/** System prompt for creator pet photo recognition. */
export const PET_RECOGNITION_SYSTEM =
  'You are a careful companion photo analyst. Respond with a single compact JSON object only. No markdown, no prose.';

/**
 * Build allowed species/breed IDs from the app catalog for the Ark prompt.
 */
export function buildRecognitionCatalogSnapshot(): RecognitionCatalogSnapshot {
  const breedsBySpecies: Record<string, string[]> = {};
  const lines: string[] = [
    'Allowed species IDs: cat | dog | character | unknown',
    'Allowed breed IDs by species (return IDs, not labels):',
  ];

  for (const species of PET_SPECIES_VALUES) {
    const breeds = listPetBreedsForSpecies(species);
    breedsBySpecies[species] = breeds;
    const labeled = breeds
      .map((id) => `${id} (${getPetBreedLabel(id)})`)
      .join(', ');
    lines.push(`- ${species}: ${labeled}`);
  }

  lines.push(
    'Use species "character" for humans, humanoids, mascots, robots, plushies, fantasy people, anime-style figures, and other non-animal companions (not a real cat or dog).',
    'If unsure about species, return species "unknown" and breed "any".',
    'If species is clear but breed is unsure, return breed "any".',
    'For species "character", always return breed "any".'
  );

  return {
    species: [...RECOGNITION_SPECIES],
    breedsBySpecies,
    promptOptionsText: lines.join('\n'),
  };
}

export function buildCreatorPetRecognitionPrompt(
  catalog: RecognitionCatalogSnapshot = buildRecognitionCatalogSnapshot()
): string {
  return `Look at the attached companion photo(s) and return a single JSON object with exactly these keys:
{
  "species": "cat" | "dog" | "character" | "unknown",
  "breed": string,
  "confidence": number,
  "colors": string[],
  "markings": string[],
  "visiblePose": string,
  "notes": string
}

Rules:
- species and breed MUST be IDs from the allowed lists below (never free-text labels).
- confidence is 0–1.
- Use short values for colors, markings, visiblePose, and notes.
- Prefer "unknown" / "any" when unsure.
- Prefer "character" over "unknown" when the subject is clearly a human-like or non-animal companion.

${catalog.promptOptionsText}`;
}
