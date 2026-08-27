import { DEFAULT_AVATARS_FOLDER } from '@/storage/constants';
import { isPetMakerStagingKey } from '@/utils/pets/pet-maker-storage-keys';

/** Keys the same-origin upload proxy may write (local dev without R2 S3 API creds). */
export function isProxyUploadKey(key: string): boolean {
  if (!key || key.includes('..')) return false;
  if (isPetMakerStagingKey(key)) return true;
  return key.startsWith(`${DEFAULT_AVATARS_FOLDER}/`);
}
