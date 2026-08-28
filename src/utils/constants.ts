/** 5 MB — matches common upload limits in the app. */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Max pet photo size for direct-to-storage presigned uploads (20MB). */
export const PET_PHOTO_MAX_FILE_SIZE = 20 * 1024 * 1024;

/** Alias for creator media uploads (photos + videos). */
export const PET_MEDIA_MAX_FILE_SIZE = 20 * 1024 * 1024;

export const PET_MEDIA_THUMBNAIL_MIME_TYPE = 'image/webp';

/** WebP quality for album / recognition thumbnails (matches reference). */
export const PET_MEDIA_THUMBNAIL_QUALITY = 75;

/** Long-edge max for album / recognition thumbnails (matches reference). */
export const PET_MEDIA_THUMBNAIL_MAX_EDGE = 640;
