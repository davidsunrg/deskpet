/** Public CDN object key for a pet avatar (one-level: avatars/{id}.{ext}). */

const FLAT_AVATAR_RE = /^avatars\/([0-9a-f-]+)\.(jpe?g|png|webp)$/i;
const LEGACY_AVATAR_PREFIX_RE =
  /^avatars\/pets\/([0-9a-f-]+)\/([0-9a-f-]+)\.(jpe?g|png|webp)$/i;

export function buildPetAvatarKey(input: {
  /** @deprecated Unused; kept for call-site compatibility. */
  userId?: string;
  uploadId: string;
  extension?: string;
}) {
  const ext =
    (input.extension ?? 'webp').replace(/^\./, '').toLowerCase() || 'webp';
  return `avatars/${input.uploadId}.${ext}`;
}

/**
 * True when `key` is a managed pet avatar under the flat public scheme,
 * or a legacy nested avatar key owned by `userId` (when provided).
 */
export function isPetAvatarKey(
  key: string,
  input?: { userId?: string }
): boolean {
  if (FLAT_AVATAR_RE.test(key)) {
    return true;
  }
  const legacy = LEGACY_AVATAR_PREFIX_RE.exec(key);
  if (!legacy) return false;
  if (input?.userId) {
    return legacy[1]!.toLowerCase() === input.userId.toLowerCase();
  }
  return true;
}
