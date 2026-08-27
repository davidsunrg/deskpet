import { PetVideoMakerPage } from '@/components/pages/pet-video-maker-page';
import { getDeskPetMessage } from '@/lib/deskpet-i18n';
import { seo } from '@/lib/seo';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/tools/pet-video-maker')({
  head: () =>
    seo('/tools/pet-video-maker', {
      title: getDeskPetMessage('PetVideoMakerPage.seoTitle'),
      description: getDeskPetMessage('PetVideoMakerPage.seoDescription'),
    }),
  component: PetVideoMakerPage,
});
