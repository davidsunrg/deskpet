import { PetVideoMakerPage } from '@/components/pages/pet-video-maker-page';
import { deskpetPageTitle } from '@/lib/deskpet-seo';
import { getDeskPetMessage } from '@/lib/deskpet-i18n';
import { seo } from '@/lib/seo';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/tools/pet-video-maker')({
  head: () =>
    seo('/tools/pet-video-maker', {
      title: deskpetPageTitle(getDeskPetMessage('PetVideoMakerPage.seoTitle')),
      description: getDeskPetMessage('PetVideoMakerPage.seoDescription'),
    }),
  component: PetVideoMakerPage,
});
