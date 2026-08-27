/**
 * SessionStorage handoff after guest pet-maker create → sign-in.
 * Transfer may clear `enabled` when the real account already has pets;
 * the wizard re-activates the pending `user_pet.id` after auth, then
 * redirects to pricing (dashboard activate is only a stale-session fallback).
 */

const PENDING_DASHBOARD_AFTER_AUTH_KEY = 'deskpet:creator-dashboard-after-auth';
const PENDING_ACTIVE_USER_PET_ID_KEY =
  'deskpet:creator-pending-active-user-pet-id';
/** Legacy resume-create flag; cleared so old sessions do not reopen the maker. */
const LEGACY_PENDING_CREATE_STORAGE_KEY = 'deskpet:creator-pending-create';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export function readPendingCreatorDashboardAfterAuth(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.sessionStorage.getItem(PENDING_DASHBOARD_AFTER_AUTH_KEY) === '1'
  );
}

export function readPendingCreatorActiveUserPetId(): string | null {
  if (typeof window === 'undefined') return null;
  const value = window.sessionStorage
    .getItem(PENDING_ACTIVE_USER_PET_ID_KEY)
    ?.trim();
  if (!value || !isUuid(value)) return null;
  return value;
}

/**
 * Persist post-auth pending membership to activate (before pricing redirect).
 */
export function writePendingCreatorDashboardAfterAuth(
  userPetId?: string | null
) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(PENDING_DASHBOARD_AFTER_AUTH_KEY, '1');
  window.sessionStorage.removeItem(LEGACY_PENDING_CREATE_STORAGE_KEY);
  const trimmed = userPetId?.trim();
  if (trimmed && isUuid(trimmed)) {
    window.sessionStorage.setItem(PENDING_ACTIVE_USER_PET_ID_KEY, trimmed);
  } else {
    window.sessionStorage.removeItem(PENDING_ACTIVE_USER_PET_ID_KEY);
  }
}

export function clearPendingCreatorDashboardAfterAuth() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(PENDING_DASHBOARD_AFTER_AUTH_KEY);
  window.sessionStorage.removeItem(PENDING_ACTIVE_USER_PET_ID_KEY);
  window.sessionStorage.removeItem(LEGACY_PENDING_CREATE_STORAGE_KEY);
}

/**
 * Read and clear the pending active membership id (one-shot).
 */
export function takePendingCreatorActiveUserPetId(): string | null {
  const value = readPendingCreatorActiveUserPetId();
  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem(PENDING_ACTIVE_USER_PET_ID_KEY);
  }
  return value;
}
