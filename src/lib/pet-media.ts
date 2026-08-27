import { clientEnv } from '@/env/client';

/** Default public R2 CDN for DeskPet pet media when env is unset (local dev). */
const DEFAULT_PUBLIC_STORAGE_URL =
  'https://pub-60af85e07778489ab23b43e5f7c97203.r2.dev';

/**
 * Resolve the public base URL for registry pet media (avatars, action clips).
 * Uses `VITE_STORAGE_PUBLIC_URL` when set; otherwise falls back to the
 * published DeskPet R2 bucket for local development.
 */
export function getPublicPetMediaBase(): string {
  const configured = clientEnv.VITE_STORAGE_PUBLIC_URL?.trim();
  const base = (configured || DEFAULT_PUBLIC_STORAGE_URL).replace(/\/+$/, '');
  return base;
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
