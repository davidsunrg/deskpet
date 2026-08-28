import type { PetBreed, PetSex, PetSpecies } from '@/utils/pet-catalog';
import {
  isMarketingPetMakerStep,
  type MarketingPetMakerStep,
} from '@/utils/pets/marketing-pet-maker-steps';

export const PET_MAKER_DRAFT_STORAGE_KEY = 'deskpet:pet-maker-draft';

const PENDING_PET_MAKER_CREATE_AFTER_AUTH_KEY =
  'deskpet:pet-maker-create-after-auth';

export type PetMakerLocalDraftPhoto = {
  localId: string;
  name: string;
  r2Key: string;
  previewUrl: string;
  width?: number;
  height?: number;
  capturedAt?: string;
};

export type PetMakerLocalDraft = {
  draftId: string;
  step?: MarketingPetMakerStep;
  petName: string;
  species: PetSpecies | '';
  breed: PetBreed | '';
  sex: PetSex | '';
  avatarKey: string | null;
  photos: PetMakerLocalDraftPhoto[];
};

function newDraftId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

export function createEmptyDraft(): PetMakerLocalDraft {
  return {
    draftId: newDraftId(),
    petName: '',
    species: '',
    breed: '',
    sex: '',
    avatarKey: null,
    photos: [],
  };
}

export function readDraft(): PetMakerLocalDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PET_MAKER_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PetMakerLocalDraft>;
    if (!parsed.draftId || !Array.isArray(parsed.photos)) return null;
    return {
      draftId: parsed.draftId,
      step: isMarketingPetMakerStep(parsed.step) ? parsed.step : undefined,
      petName: parsed.petName ?? '',
      species: parsed.species ?? '',
      breed: parsed.breed ?? '',
      sex: parsed.sex ?? '',
      avatarKey: parsed.avatarKey ?? null,
      photos: parsed.photos.filter(
        (photo): photo is PetMakerLocalDraftPhoto =>
          !!photo &&
          typeof photo.localId === 'string' &&
          typeof photo.r2Key === 'string' &&
          typeof photo.previewUrl === 'string'
      ),
    };
  } catch {
    return null;
  }
}

export function writeDraft(draft: PetMakerLocalDraft): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(
    PET_MAKER_DRAFT_STORAGE_KEY,
    JSON.stringify(draft)
  );
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(PET_MAKER_DRAFT_STORAGE_KEY);
}

export function ensureDraftId(draft: PetMakerLocalDraft): PetMakerLocalDraft {
  if (draft.draftId) return draft;
  return { ...draft, draftId: newDraftId() };
}

/** Set before OAuth redirect so create resumes after sign-in on the maker page. */
export function writePendingPetMakerCreateAfterAuth(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(PENDING_PET_MAKER_CREATE_AFTER_AUTH_KEY, '1');
}

export function readPendingPetMakerCreateAfterAuth(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.sessionStorage.getItem(PENDING_PET_MAKER_CREATE_AFTER_AUTH_KEY) ===
    '1'
  );
}

export function clearPendingPetMakerCreateAfterAuth(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(PENDING_PET_MAKER_CREATE_AFTER_AUTH_KEY);
}
