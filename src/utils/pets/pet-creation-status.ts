/** Creator lifecycle stages for custom pets. */
export const PET_CREATION_STATUS_VALUES = [
  'photos_uploaded',
  'profile_created',
] as const;

export type PetCreationStatus = (typeof PET_CREATION_STATUS_VALUES)[number];

export const PetCreationStatus = {
  PhotosUploaded: 'photos_uploaded',
  ProfileCreated: 'profile_created',
} as const satisfies Record<string, PetCreationStatus>;

/** In-progress creator pets (maker draft only; not yet profile-complete). */
export const PET_CREATOR_IN_PROGRESS_STATUSES = [
  PetCreationStatus.PhotosUploaded,
] as const satisfies readonly PetCreationStatus[];

/** Placeholder display name for provisional drafts created on first photo upload. */
export const PROVISIONAL_CREATOR_PET_NAME = 'New Pet';

export function isPetCreationStatus(value: string): value is PetCreationStatus {
  return (PET_CREATION_STATUS_VALUES as readonly string[]).includes(value);
}

export function isCreatorInProgress(
  value: string
): value is (typeof PET_CREATOR_IN_PROGRESS_STATUSES)[number] {
  return (PET_CREATOR_IN_PROGRESS_STATUSES as readonly string[]).includes(
    value
  );
}
