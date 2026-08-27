import type { CreatorPetRecognitionData } from '@/types/creator-recognition';
import type { PetBreed, PetSex, PetSpecies } from '@/utils/pet-catalog';
import type { PetCreationStatus } from '@/utils/pets/pet-creation-status';

export type CreatorWizardInitialPhoto = {
  id: string;
  name: string;
  url: string;
  mediaId: string;
};

/** Serializable draft payload for SSR → CreatePetWizard. */
export type CreatorWizardInitialDraft = {
  petId: string;
  userPetId: string;
  petName: string;
  species: PetSpecies | '';
  breed: PetBreed | '';
  sex: PetSex | '';
  avatarUrl: string | null;
  creationStatus: PetCreationStatus;
  photos: CreatorWizardInitialPhoto[];
  recognitionData: CreatorPetRecognitionData | null;
  recognitionMediaFingerprint: string | null;
};
