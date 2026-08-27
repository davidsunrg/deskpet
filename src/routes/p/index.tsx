import { PetHubPage } from '@/components/pages/pet-hub-page';
import { deskpetPageTitle } from '@/lib/deskpet-seo';
import { seo } from '@/lib/seo';
import { listPetResources } from '@/utils/pets/pet-resources';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/p/')({
  loader: () => ({
    resources: listPetResources({ visibleIn: 'detail' }),
  }),
  head: () =>
    seo('/p', {
      title: deskpetPageTitle('Pet Hub'),
      description:
        'Explore every DeskPet companion with a public profile, including catalog pets and special pet guides.',
    }),
  component: PetHubIndexPage,
});

function PetHubIndexPage() {
  const { resources } = Route.useLoaderData();
  return <PetHubPage resources={resources} />;
}
