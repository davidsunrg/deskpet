import { getUserInProgressCreatorPet } from '@/server/pets/get-user-in-progress-creator-pet';
import { listPetMedia } from '@/server/pets/list-pet-media';
import {
  PetSex,
  type PetBreed as PetBreedId,
  type PetSpecies as PetSpeciesId,
} from '@/utils/pet-catalog';
import type {
  CreatorWizardInitialDraft,
  CreatorWizardInitialPhoto,
} from '@/utils/pets/creator-wizard-initial-draft';
import {
  fingerprintMediaIds,
  mediaIdsMatch,
} from '@/utils/pets/creator-recognition';
import {
  PetCreationStatus,
  PROVISIONAL_CREATOR_PET_NAME,
} from '@/utils/pets/pet-creation-status';

export type {
  CreatorWizardInitialDraft,
  CreatorWizardInitialPhoto,
} from '@/utils/pets/creator-wizard-initial-draft';

/** Load the session user's in-progress creator draft for the pet maker. */
export async function loadCreatorWizardDraft(
  userId: string
): Promise<CreatorWizardInitialDraft | null> {
  const draft = await getUserInProgressCreatorPet({ userId });
  if (!draft) return null;
  if (draft.creationStatus !== PetCreationStatus.PhotosUploaded) {
    return null;
  }

  const media = await listPetMedia({
    userId,
    petId: draft.petId,
    kind: 'photo',
  });

  const photos: CreatorWizardInitialPhoto[] = media.map((item) => ({
    id: item.id,
    name: item.filename?.trim() || 'Reference photo',
    url: item.thumbnailUrl || item.originalUrl,
    mediaId: item.id,
  }));

  const listedMediaIds = photos.map((photo) => photo.mediaId);
  const cached = draft.creatorRecognition;
  const recognitionMatches =
    !!cached && mediaIdsMatch(cached.mediaIds, listedMediaIds);

  const isProvisionalName = draft.name.trim() === PROVISIONAL_CREATOR_PET_NAME;

  const species: PetSpeciesId | '' = '';
  const breed: PetBreedId | '' = '';

  const sex =
    draft.sex === PetSex.Male || draft.sex === PetSex.Female ? draft.sex : '';

  return {
    petId: draft.petId,
    userPetId: draft.userPetId,
    petName: isProvisionalName ? '' : draft.name,
    species,
    breed,
    sex,
    avatarUrl: draft.avatar,
    creationStatus: draft.creationStatus,
    photos,
    recognitionData: recognitionMatches ? cached.result : null,
    recognitionMediaFingerprint: recognitionMatches
      ? fingerprintMediaIds(cached.mediaIds)
      : null,
  };
}
