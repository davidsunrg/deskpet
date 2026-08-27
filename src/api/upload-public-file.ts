import { getBaseUrl } from '@/lib/urls';
import { getPresignedUploadUrl } from '@/lib/storage/r2-s3';
import { authApiMiddleware } from '@/middlewares/auth-middleware';
import { DEFAULT_AVATARS_FOLDER, DEFAULT_MAX_FILE_SIZE } from '@/storage/constants';

const ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

const uploadSchema = z.object({
  contentType: z.enum(ALLOWED_CONTENT_TYPES),
  byteSize: z
    .number()
    .int()
    .positive()
    .max(websiteConfig.storage?.maxFileSize ?? DEFAULT_MAX_FILE_SIZE),
});

function extensionForContentType(contentType: string): string {
  switch (contentType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return 'bin';
  }
}

export const getPublicAvatarUploadUrlFn = createServerFn({ method: 'POST' })
  .validator(uploadSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const fileId = globalThis.crypto.randomUUID();
    const extension = extensionForContentType(data.contentType);
    const r2Key = `${DEFAULT_AVATARS_FOLDER}/${context.userId}/${fileId}.${extension}`;
    const uploadUrl = await getPresignedUploadUrl({
      key: r2Key,
      contentType: data.contentType,
    });
    const requestOrigin = getBaseUrl();
    const url = `${requestOrigin}/api/storage/file?key=${encodeURIComponent(r2Key)}`;
    return { uploadUrl, r2Key, url, contentType: data.contentType };
  });
