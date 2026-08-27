import type { CreatorPetRecognitionData } from '@/types/creator-recognition';
import type { PetBreed, PetSex, PetSpecies } from '@/utils/pet-catalog';

export type CreatorWizardInitialPhoto = {
  id: string;
  name: string;
  url: string;
  userFileId: string;
};

/** Serializable draft payload for SSR → CreatePetWizard. */
export type CreatorWizardInitialDraft = {
  petName: string;
  species: PetSpecies | '';
  breed: PetBreed | '';
  sex: PetSex | '';
  avatarUrl: string | null;
  photos: CreatorWizardInitialPhoto[];
  recognitionData: CreatorPetRecognitionData | null;
  recognitionMediaFingerprint: string | null;
};
