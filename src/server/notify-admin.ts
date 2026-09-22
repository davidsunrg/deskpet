import { websiteConfig } from '@/config/website';
import { sendEmail } from '@/mail';
import { getRequest, getRequestHeaders } from '@tanstack/react-start/server';

export type NotifyAdminResult = { success: boolean };

type CfCountryRequest = Request & {
  cf?: { country?: string | null };
};

/**
 * Best-effort Cloudflare country code for the current request.
 * Returns `unknown` when ALS/request/cf is unavailable (e.g. local/dev).
 */
export function getRequestCountryHint(): string {
  try {
    const request = getRequest() as CfCountryRequest;
    const fromCf = request.cf?.country?.trim();
    if (fromCf && fromCf.toUpperCase() !== 'XX') {
      return fromCf.toUpperCase();
    }
  } catch {
    // Request ALS may be unavailable outside an active request.
  }

  try {
    const header = getRequestHeaders().get('cf-ipcountry')?.trim();
    if (header && header.toUpperCase() !== 'XX') {
      return header.toUpperCase();
    }
  } catch {
    // Header helpers may also throw outside request context.
  }

  return 'unknown';
}

/**
 * Silent admin email via contactMessage. Never throws.
 * `subject` is the inbox title (e.g. "New user registration") — not the
 * generic contact-form subject.
 */
export async function notifyAdminContactMessage(input: {
  subject: string;
  name: string;
  email: string;
  message: string;
}): Promise<NotifyAdminResult> {
  try {
    const supportEmail = websiteConfig.mail?.supportEmail;
    if (!supportEmail) {
      console.error('[notify-admin] support email is not set');
      return { success: false };
    }

    const result = await sendEmail({
      to: supportEmail,
      template: 'contactMessage',
      subject: input.subject.trim(),
      context: {
        name: input.name,
        email: input.email,
        message: input.message,
      },
    });

    if (!result.success) {
      console.error('[notify-admin] send failed:', result.error);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error('[notify-admin] unexpected error:', error);
    return { success: false };
  }
}
