import { websiteConfig } from '@/config/website';
import { getDeskPetMessage } from '@/lib/deskpet-i18n';

/** `{pageTitle} | DeskPet.ai` title pattern used across marketing pages. */
export function deskpetPageTitle(pageTitle: string): string {
  const siteName =
    websiteConfig.metadata?.name ?? getDeskPetMessage('Metadata.name');
  return `${pageTitle} | ${siteName}`;
}
