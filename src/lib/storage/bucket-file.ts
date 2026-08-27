export type BucketStorageProvider = 's3' | 'r2';

/** Legacy bucket target for API compatibility (single R2 bucket in deskpet). */
export type StorageBucketTarget = 'private' | 'public';

/**
 * Durable object reference (Ark-style).
 * Presigned download URLs are never stored — only returned at read time.
 *
 * `isPublic` is the source of truth for which bucket the object lives in.
 * Missing means private. `url` is only the CDN address of a public object.
 */
export type BucketFile = {
  key: string;
  mimeType: string;
  size: number;
  provider: BucketStorageProvider;
  /**
   * Explicit public flag. Missing means false / private. Only set to `true`
   * for public CDN objects.
   */
  isPublic?: boolean;
  /**
   * Absolute public CDN URL for objects in the public bucket. Never used to
   * decide whether an object is public — check `isPublic` for that.
   */
  url?: string;
};

export const DEFAULT_BUCKET_STORAGE_PROVIDER: BucketStorageProvider = 'r2';

/** True when the object lives in the public bucket. */
export function isPublicBucketFile(file: BucketFile): boolean {
  return file.isPublic === true;
}

/** Which configured bucket the stored object lives in. */
export function bucketTargetForBucketFile(
  file: BucketFile
): StorageBucketTarget {
  return isPublicBucketFile(file) ? 'public' : 'private';
}

/** True when the file is public and carries a usable CDN URL. */
export function isPublicLinkedBucketFile(
  file: BucketFile
): file is BucketFile & { url: string } {
  return (
    isPublicBucketFile(file) &&
    typeof file.url === 'string' &&
    file.url.trim().length > 0
  );
}
