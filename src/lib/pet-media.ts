import { clientEnv } from '@/env/client';

/** Default public CDN for DeskPet pet media (reference: cdn.deskpet.ai). */
const DEFAULT_PUBLIC_STORAGE_URL = 'https://cdn.deskpet.ai';

/**
 * Resolve the public base URL for registry pet media (avatars, action clips).
 * Uses `VITE_STORAGE_PUBLIC_URL` when set, otherwise the DeskPet CDN.
 */
export function getPublicPetMediaBase(): string {
  const configured = clientEnv.VITE_STORAGE_PUBLIC_URL?.trim();
  const base = configured || DEFAULT_PUBLIC_STORAGE_URL;
  return base.replace(/\/+$/, '');
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
