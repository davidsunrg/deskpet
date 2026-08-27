import { HealthPage } from '@/components/pages/health-page';
import { deskpetPageTitle } from '@/lib/deskpet-seo';
import { getDeskPetMessage } from '@/lib/deskpet-i18n';
import { seo } from '@/lib/seo';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/health')({
  head: () =>
    seo('/health', {
      title: deskpetPageTitle(getDeskPetMessage('HealthPage.title')),
      description: getDeskPetMessage('HealthPage.description'),
    }),
  component: HealthPage,
});
