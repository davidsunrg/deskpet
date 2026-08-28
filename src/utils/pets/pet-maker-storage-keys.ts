const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const PET_MAKER_STAGING_PREFIX = 'pet-maker-staging';
export const PET_MAKER_PREFIX = 'pet-maker';

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export function buildPetMakerStagingKey(input: {
  draftId: string;
  fileId: string;
  extension: string;
}): string {
  const ext = input.extension.replace(/^\./, '').toLowerCase() || 'bin';
  return `${PET_MAKER_STAGING_PREFIX}/${input.draftId}/${input.fileId}.${ext}`;
}

/** Staging thumbnail beside the primary photo (`…/{fileId}.thumbnail.webp`). */
export function buildPetMakerStagingThumbnailKey(input: {
  draftId: string;
  fileId: string;
}): string {
  return `${PET_MAKER_STAGING_PREFIX}/${input.draftId}/${input.fileId}.thumbnail.webp`;
}

export function buildPetMakerFinalKey(input: {
  userId: string;
  petId: string;
  fileId: string;
  extension: string;
}): string {
  const ext = input.extension.replace(/^\./, '').toLowerCase() || 'bin';
  return `${PET_MAKER_PREFIX}/${input.userId}/${input.petId}/${input.fileId}.${ext}`;
}

/** Final thumbnail beside the primary photo (`…/{fileId}.thumbnail.webp`). */
export function buildPetMakerFinalThumbnailKey(input: {
  userId: string;
  petId: string;
  fileId: string;
}): string {
  return `${PET_MAKER_PREFIX}/${input.userId}/${input.petId}/${input.fileId}.thumbnail.webp`;
}

export function isPetMakerStagingThumbnailKey(key: string): boolean {
  return (
    isPetMakerStagingKey(key) &&
    key.toLowerCase().endsWith('.thumbnail.webp') &&
    !key.includes('..')
  );
}

export function isPetMakerStagingKey(key: string): boolean {
  return key.startsWith(`${PET_MAKER_STAGING_PREFIX}/`);
}

export function isPetMakerFinalKey(key: string): boolean {
  return key.startsWith(`${PET_MAKER_PREFIX}/`);
}

export function isPetMakerStagingKeyForDraft(
  key: string,
  draftId: string
): boolean {
  if (!isUuid(draftId)) return false;
  const prefix = `${PET_MAKER_STAGING_PREFIX}/${draftId}/`;
  return key.startsWith(prefix) && !key.includes('..');
}

export function extensionFromKey(key: string): string {
  const dot = key.lastIndexOf('.');
  if (dot === -1) return 'bin';
  return key.slice(dot + 1).toLowerCase() || 'bin';
}

export function fileIdFromKey(key: string): string {
  const slash = key.lastIndexOf('/');
  const filename = slash === -1 ? key : key.slice(slash + 1);
  const withoutThumb = filename.replace(/\.thumbnail\.webp$/i, '');
  if (withoutThumb !== filename) return withoutThumb;
  const dot = filename.lastIndexOf('.');
  return dot === -1 ? filename : filename.slice(0, dot);
}
