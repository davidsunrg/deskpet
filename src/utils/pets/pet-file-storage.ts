/** Private R2 object keys for centralized `pet_file` storage. */

export type PetFileKind = 'image' | 'video' | 'pdf' | 'document';
export type PetFilePurpose =
  | 'gallery'
  | 'medical_document'
  | 'expense_document'
  | 'inventory_photo'
  | 'action_source_photo'
  | 'action_pose_generated'
  | 'action_pose_source_strip'
  | 'action_generated_video'
  | 'action_generated_raw_video';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function buildPetFileKey(input: {
  petId: string;
  fileId: string;
  extension: string;
}): string {
  const ext = input.extension.replace(/^\./, '').toLowerCase() || 'bin';
  return `pets/${input.petId}/files/${input.fileId}/file.${ext}`;
}

export function buildPetFileThumbnailKey(input: {
  petId: string;
  fileId: string;
}): string {
  return `pets/${input.petId}/files/${input.fileId}/thumbnail.webp`;
}

/** One-level public CDN key for a playable action clip. */
export function buildPublicActionFileKey(input: {
  fileId: string;
  extension: string;
}): string {
  const ext = input.extension.replace(/^\./, '').toLowerCase() || 'bin';
  return `actions/${input.fileId}.${ext}`;
}

/** One-level public CDN key for an action clip thumbnail. */
export function buildPublicActionThumbnailKey(input: {
  fileId: string;
}): string {
  return `action-thumbnails/${input.fileId}.webp`;
}

export function isPublicActionFileKey(
  key: string,
  input: { fileId: string }
): boolean {
  const prefix = `actions/${input.fileId}.`;
  if (!key.startsWith(prefix)) return false;
  const ext = key.slice(prefix.length);
  return /^[a-z0-9]+$/i.test(ext) && UUID_RE.test(input.fileId);
}

export function isPublicActionThumbnailKey(
  key: string,
  input: { fileId: string }
): boolean {
  return key === buildPublicActionThumbnailKey(input);
}

export function isPetFileKey(
  key: string,
  input: { petId: string; fileId: string }
): boolean {
  const prefix = `pets/${input.petId}/files/${input.fileId}/file.`;
  if (!key.startsWith(prefix)) return false;
  return /^[a-z0-9]+$/i.test(key.slice(prefix.length));
}

export function isPetFileThumbnailKey(
  key: string,
  input: { petId: string; fileId: string }
): boolean {
  return key === buildPetFileThumbnailKey(input);
}

export function extensionForMime(contentType: string): string {
  switch (contentType) {
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/jpeg':
      return 'jpg';
    case 'video/webm':
      return 'webm';
    case 'video/quicktime':
      return 'mov';
    case 'video/mp4':
      return 'mp4';
    case 'application/pdf':
      return 'pdf';
    default:
      return 'bin';
  }
}

export function petFileKindFromMime(contentType: string): PetFileKind | null {
  if (
    contentType === 'image/jpeg' ||
    contentType === 'image/png' ||
    contentType === 'image/webp'
  ) {
    return 'image';
  }
  if (
    contentType === 'video/mp4' ||
    contentType === 'video/webm' ||
    contentType === 'video/quicktime'
  ) {
    return 'video';
  }
  if (contentType === 'application/pdf') {
    return 'pdf';
  }
  if (
    contentType.startsWith('text/') ||
    contentType === 'application/msword' ||
    contentType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return 'document';
  }
  return null;
}

/** Gallery UI still uses photo/video labels. */
export function galleryKindFromFileKind(
  kind: string
): 'photo' | 'video' | null {
  if (kind === 'image') return 'photo';
  if (kind === 'video') return 'video';
  return null;
}
