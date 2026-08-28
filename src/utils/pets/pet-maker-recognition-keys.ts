import { isPetMakerStagingKeyForDraft } from '@/utils/pets/pet-maker-storage-keys';

export const MAX_PET_MAKER_RECOGNITION_PHOTOS = 8;

/** Validate staging keys belong to the draft and stay within the photo cap. */
export function assertPetMakerRecognitionPhotoKeys(input: {
  draftId: string;
  photoKeys: string[];
}): string | null {
  if (input.photoKeys.length === 0) {
    return 'No uploaded photos found for recognition.';
  }
  if (input.photoKeys.length > MAX_PET_MAKER_RECOGNITION_PHOTOS) {
    return `You can recognize at most ${MAX_PET_MAKER_RECOGNITION_PHOTOS} photos.`;
  }
  for (const key of input.photoKeys) {
    if (!isPetMakerStagingKeyForDraft(key, input.draftId)) {
      return 'Invalid staging key.';
    }
  }
  return null;
}
