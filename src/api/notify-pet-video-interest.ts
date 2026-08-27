import { auth } from '@/auth/auth';
import { websiteConfig } from '@/config/website';
import { sendEmail } from '@/mail';
import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { z } from 'zod';

const notifyPetVideoInterestSchema = z.object({
  duration: z.string().max(16),
  resolution: z.string().max(16),
  audioEnabled: z.boolean(),
  prompt: z.string().max(2000).optional(),
  hasImage: z.boolean(),
});

/** Silent admin notification when someone clicks Generate on Pet Video Maker. */
export const notifyPetVideoInterest = createServerFn({ method: 'POST' })
  .validator(notifyPetVideoInterestSchema)
  .handler(async ({ data }) => {
    try {
      const supportEmail = websiteConfig.mail?.supportEmail;
      if (!supportEmail) {
        console.error('[pet-video-interest] support email is not set');
        return { success: false as const };
      }

      const headers = getRequestHeaders();
      const session = await auth.api.getSession({ headers });
      const name =
        session?.user?.name?.trim() ||
        session?.user?.email?.split('@')[0] ||
        'Anonymous visitor';
      const email = session?.user?.email?.trim() || 'anonymous@deskpet.ai';

      const promptSnippet = data.prompt?.trim()
        ? data.prompt.trim().slice(0, 500)
        : '(empty)';

      const message = [
        'Pet Video Maker interest — Generate clicked while the feature is coming soon.',
        `Duration: ${data.duration}`,
        `Resolution: ${data.resolution}`,
        `Audio: ${data.audioEnabled ? 'on' : 'off'}`,
        `Photo uploaded: ${data.hasImage ? 'yes' : 'no'}`,
        `Prompt: ${promptSnippet}`,
      ].join('\n');

      const result = await sendEmail({
        to: supportEmail,
        template: 'contactMessage',
        context: {
          name,
          email,
          message,
        },
      });

      if (!result.success) {
        console.error('[pet-video-interest] send failed:', result.error);
        return { success: false as const };
      }

      return { success: true as const };
    } catch (error) {
      console.error('[pet-video-interest] unexpected error:', error);
      return { success: false as const };
    }
  });
