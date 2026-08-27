export type SessionIdentityUser = {
  isAnonymous?: boolean | null;
  name?: string | null;
  email?: string | null;
  emailVerified?: boolean | null;
};

export const ANONYMOUS_ACCOUNT_REQUIRED_ERROR =
  'Create an account to open your dashboard.';

export function isAnonymousSessionUser(
  user: SessionIdentityUser | null | undefined
): boolean {
  return user?.isAnonymous === true;
}

export function isRealSignedInUser(
  user: SessionIdentityUser | null | undefined
): user is SessionIdentityUser & { isAnonymous?: false | null } {
  return !!user && !isAnonymousSessionUser(user);
}

/** Real account with verified email — required before pricing/checkout handoffs. */
export function isVerifiedSignedInUser(
  user: SessionIdentityUser | null | undefined
): user is SessionIdentityUser & { isAnonymous?: false | null } {
  return isRealSignedInUser(user) && user.emailVerified !== false;
}

export function sessionUserDisplayName(
  user: SessionIdentityUser | null | undefined,
  guestLabel = 'Guest'
): string {
  if (!user) return guestLabel;
  if (isAnonymousSessionUser(user)) return guestLabel;
  return user.name?.trim() || guestLabel;
}
