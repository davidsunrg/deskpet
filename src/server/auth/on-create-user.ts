import type { User } from 'better-auth';
import { websiteConfig } from '@/config/website';
import { subscribe } from '@/newsletter';
import {
  getRequestCountryHint,
  notifyAdminContactMessage,
} from '@/server/notify-admin';

/**
 * Side effects after a new user row is created.
 * Called from Better Auth database hooks and from direct OTP signup.
 */
export async function runOnCreateUserSideEffects(user: User): Promise<void> {
  if ((user as { isAnonymous?: boolean | null }).isAnonymous) {
    return;
  }

  const email = user.email?.trim() || 'unknown@deskpet.ai';
  const name = user.name?.trim() || email.split('@')[0] || 'New user';
  const country = getRequestCountryHint();

  try {
    await notifyAdminContactMessage({
      name,
      email,
      message: [
        'New account registered.',
        `User id: ${user.id}`,
        `Name: ${name}`,
        `Email: ${email}`,
        `Country: ${country}`,
      ].join('\n'),
    });
  } catch (error) {
    console.error('onCreateUser, admin notify error:', error);
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
