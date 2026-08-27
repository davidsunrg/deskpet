import { DownloadPage } from '@/components/pages/download-page';
import { getDeskPetMessage } from '@/lib/deskpet-i18n';
import { seo } from '@/lib/seo';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/download')({
  head: () =>
    seo('/download', {
      title: getDeskPetMessage('DownloadPage.seoTitle'),
      description: getDeskPetMessage('DownloadPage.description'),
    }),
  component: DownloadPage,
});
