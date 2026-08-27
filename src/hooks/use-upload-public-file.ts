import { useMutation } from '@tanstack/react-query';
import { getPublicAvatarUploadUrlFn } from '@/api/upload-public-file';
import { uploadFileWithPresignedUrl } from '@/lib/storage/presigned-upload';
import { wrapNestedServerFn } from '@/utils/wrap-server-fn';
import { assertActionSuccess } from '@/utils/assert-action-success';

export function useUploadPublicAvatar() {
  return useMutation({
    mutationFn: async (file: File) => {
      const contentType = (file.type || 'image/jpeg') as
        | 'image/jpeg'
        | 'image/png'
        | 'image/webp';
      const presign = await wrapNestedServerFn(() =>
        getPublicAvatarUploadUrlFn({
          data: { contentType, byteSize: file.size },
        })
      );
      assertActionSuccess(presign, 'Failed to prepare avatar upload');
      const slot = presign.data.data;
      await uploadFileWithPresignedUrl(file, {
        uploadUrl: slot.uploadUrl,
        contentType: slot.contentType,
      });
      return { url: slot.url, r2Key: slot.r2Key };
    },
  });
}
