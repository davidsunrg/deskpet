import { PetHubPage } from '@/components/pages/pet-hub-page';
import { deskpetPageTitle } from '@/lib/deskpet-seo';
import { getDeskPetMessage } from '@/lib/deskpet-i18n';
import { seo } from '@/lib/seo';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/p/')({
  head: () =>
    seo('/p', {
      title: deskpetPageTitle('Pet Hub'),
      description:
        'Explore every DeskPet companion with a public profile, including catalog pets and special pet guides.',
    }),
  component: PetHubPage,
});
