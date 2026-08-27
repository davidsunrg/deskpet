/**
 * Creator pet photo recognition result and durable draft cache shape.
 * Species/breed use catalog IDs so Details prefill is predictable.
 */

export type CreatorRecognitionSpecies = 'cat' | 'dog' | 'character' | 'unknown';

export type CreatorPetRecognitionData = {
  species: CreatorRecognitionSpecies;
  /** Catalog breed id for the selected species, or `any`. */
  breed: string;
  confidence: number;
  colors: string[];
  markings: string[];
  visiblePose: string;
  notes: string;
  /**
   * Legacy free-text breed from older cached rows.
   * New recognition results leave this unset.
   */
  likelyBreed?: string;
};

/**
 * Cached on `pet.creator_recognition` so Photos → Basics can skip Ark when
 * the uploaded media set (and model) have not changed.
 */
export type CreatorRecognitionCache = {
  mediaIds: string[];
  result: CreatorPetRecognitionData;
  model: string;
  modelLabel: string;
  llmLogId: string | null;
  recognizedAt: string;
};
