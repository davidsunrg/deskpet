import { auth } from '@/auth/auth';
import {
  getRequestCountryHint,
  notifyAdminContactMessage,
} from '@/server/notify-admin';
import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { z } from 'zod';

const notifyPetFinalPayClickSchema = z.object({
  petId: z.string().uuid(),
  petName: z.string().max(120).optional(),
  species: z.string().max(64).optional(),
  breed: z.string().max(120).optional(),
  checkoutAvailable: z.boolean().optional(),
});

/** Silent admin notification when Final-tab pay CTA is clicked. */
export const notifyPetFinalPayClick = createServerFn({ method: 'POST' })
  .validator(notifyPetFinalPayClickSchema)
  .handler(async ({ data }) => {
    try {
      const headers = getRequestHeaders();
      const session = await auth.api.getSession({ headers });
      const email = session?.user?.email?.trim() || 'unknown@deskpet.ai';
      const name =
        session?.user?.name?.trim() ||
        session?.user?.email?.split('@')[0] ||
        'Dashboard user';
      const country = getRequestCountryHint();
      const checkoutAvailable =
        data.checkoutAvailable === undefined
          ? 'unknown'
          : data.checkoutAvailable
            ? 'yes'
            : 'no';

      const message = [
        'Final paywall pay CTA clicked.',
        `Email: ${email}`,
        `Country: ${country}`,
        `Checkout available: ${checkoutAvailable}`,
        `Pet id: ${data.petId}`,
        `Pet name: ${data.petName?.trim() || '(none)'}`,
        `Species: ${data.species?.trim() || '(none)'}`,
        `Breed: ${data.breed?.trim() || '(none)'}`,
      ].join('\n');

      return notifyAdminContactMessage({ name, email, message });
    } catch (error) {
      console.error('[pet-final-pay] unexpected error:', error);
      return { success: false as const };
    }
  });
