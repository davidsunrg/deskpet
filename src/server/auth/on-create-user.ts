import type { User } from 'better-auth';
import { websiteConfig } from '@/config/website';
import { subscribe } from '@/newsletter';

/**
 * Side effects after a new user row is created.
 * Called from Better Auth database hooks and from direct OTP signup.
 */
export async function runOnCreateUserSideEffects(user: User): Promise<void> {
  if ((user as { isAnonymous?: boolean | null }).isAnonymous) {
    return;
  }

  const newsletterConfig = websiteConfig.newsletter;
  if (
    !user.email ||
    !newsletterConfig?.enable ||
    !newsletterConfig.autoSubscribeAfterSignUp
  ) {
    return;
  }

  try {
    const subscribed = await subscribe(user.email);
    if (!subscribed) {
      console.error(`onCreateUser, user ${user.email} failed to subscribe`);
    } else {
      console.log(`onCreateUser, user ${user.email} subscribed to newsletter`);
    }
  } catch (error) {
    console.error('onCreateUser, newsletter subscription error:', error);
  }
}
