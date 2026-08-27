import { clientEnv } from '@/env/client';

/** Default public R2 CDN for DeskPet pet media when env is unset (production). */
const DEFAULT_PUBLIC_STORAGE_URL =
  'https://pub-60af85e07778489ab23b43e5f7c97203.r2.dev';

/** Same-origin Vite dev proxy to avoid R2 CORS on localhost. */
const DEV_PET_CDN_PROXY = '/pet-cdn';

/**
 * Resolve the public base URL for registry pet media (avatars, action clips).
 * Uses `VITE_STORAGE_PUBLIC_URL` when set; in dev uses a Vite proxy path;
 * otherwise falls back to the published DeskPet R2 bucket.
 */
export function getPublicPetMediaBase(): string {
  const configured = clientEnv.VITE_STORAGE_PUBLIC_URL?.trim();
  if (configured) {
    return configured.replace(/\/+$/, '');
  }
  if (import.meta.env.DEV) {
    return DEV_PET_CDN_PROXY;
  }
  return DEFAULT_PUBLIC_STORAGE_URL.replace(/\/+$/, '');
}

/**
 * Build a full public URL for a pet resource key.
 * Keys like `actions/uuid.webm` resolve against the storage CDN base.
 */
export function resolvePetMediaUrl(r2Key: string): string {
  const key = r2Key.trim().replace(/^\/+/, '');
  if (!key) {
    throw new Error('Pet media key is required.');
  }
  return `${getPublicPetMediaBase()}/${key}`;
}
