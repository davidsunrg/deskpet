import type { PetBreed, PetSex, PetSpecies } from '@/utils/pet-catalog';

export const PET_MAKER_DRAFT_STORAGE_KEY = 'deskpet:pet-maker-draft';

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
