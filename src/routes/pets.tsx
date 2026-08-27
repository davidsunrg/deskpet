import Container from '@/components/layout/container';
import { PetsPageClient } from '@/components/pets/pets-page-client';
import { deskpetPageTitle } from '@/lib/deskpet-seo';
import { getDeskPetMessage } from '@/lib/deskpet-i18n';
import { seo } from '@/lib/seo';
import { paginateCatalogPets } from '@/pets/catalog';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/pets')({
  loader: async ({ location }) => {
    const params = new URLSearchParams(location.search);
    const rawPage = Number(params.get('page'));
    return paginateCatalogPets(Number.isFinite(rawPage) ? rawPage : 1);
  },
  head: () =>
    seo('/pets', {
      title: deskpetPageTitle(getDeskPetMessage('PetsPage.title')),
      description: getDeskPetMessage('PetsPage.description'),
    }),
  component: PetsPage,
});

function PetsPage() {
  const { pets, page, totalPages } = Route.useLoaderData();

  return (
    <Container className="px-4 py-16">
      <PetsPageClient pets={pets} page={page} totalPages={totalPages} />
    </Container>
  );
}
