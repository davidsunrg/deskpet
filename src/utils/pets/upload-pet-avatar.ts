import {
  completePetAvatarUploadAction,
  createPetAvatarUploadAction,
} from '@/actions/pet-avatar';
import { uploadFileWithPresignedUrl } from '@/lib/storage/presigned-upload';
import { assertActionSuccess } from '@/utils/assert-action-success';
import { SQUARE_AVATAR_MIME } from '@/utils/compress-square-avatar';
import { MAX_FILE_SIZE } from '@/utils/constants';

export type UploadPetAvatarInput = {
  file: File;
  /** Defaults to `file.size`. */
  byteSize?: number;
  /** Blob preview URLs are ignored (treated as no previous remote avatar). */
  previousImageUrl?: string | null;
  /** Used for size check and action failure messages. */
  errorMessage: string;
};

/**
 * Upload a square pet avatar via presigned PUT and return the public URL.
 */
export async function uploadPetAvatar(
  input: UploadPetAvatarInput
): Promise<string> {
  const byteSize = input.byteSize ?? input.file.size;
  if (byteSize > MAX_FILE_SIZE) {
    throw new Error(input.errorMessage);
  }

  const contentType = (input.file.type || SQUARE_AVATAR_MIME) as
    | 'image/jpeg'
    | 'image/png'
    | 'image/webp';
  const previousImageUrl =
    input.previousImageUrl && !input.previousImageUrl.startsWith('blob:')
      ? input.previousImageUrl
      : null;

  const presign = await createPetAvatarUploadAction({
    contentType,
    byteSize,
  });
  assertActionSuccess(presign, input.errorMessage);
  const slot = presign.data.data;

  await uploadFileWithPresignedUrl(input.file, {
    uploadUrl: slot.uploadUrl,
    contentType: slot.contentType,
  });

  const complete = await completePetAvatarUploadAction({
    key: slot.key,
    contentType: slot.contentType,
    byteSize,
    previousImageUrl,
  });
  assertActionSuccess(complete, input.errorMessage);
  return complete.data.data.url;
}
