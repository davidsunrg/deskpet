export const PET_MAKER_PHOTO_MARKER = 'pet_maker_photo';

export type PetMakerPhotoDescription = {
  purpose: typeof PET_MAKER_PHOTO_MARKER;
  localId: string;
  width?: number;
  height?: number;
  capturedAt?: string;
};

export function buildPetMakerPhotoDescription(
  meta: Omit<PetMakerPhotoDescription, 'purpose'>
): string {
  return JSON.stringify({
    purpose: PET_MAKER_PHOTO_MARKER,
    ...meta,
  } satisfies PetMakerPhotoDescription);
}

export function parsePetMakerPhotoDescription(
  description: string | null | undefined
): PetMakerPhotoDescription | null {
  if (!description) return null;
  try {
    const parsed = JSON.parse(description) as Partial<PetMakerPhotoDescription>;
    if (parsed.purpose !== PET_MAKER_PHOTO_MARKER || !parsed.localId) {
      return null;
    }
    return parsed as PetMakerPhotoDescription;
  } catch {
    return null;
  }
}

export function isPetMakerPhotoDescription(
  description: string | null | undefined
): boolean {
  return parsePetMakerPhotoDescription(description) !== null;
}
