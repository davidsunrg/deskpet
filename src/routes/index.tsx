import { HomePage } from '@/components/blocks/homepage';
import { getDeskPetMessage } from '@/lib/deskpet-i18n';
import { seo } from '@/lib/seo';
import { listHeroPets, listPlaygroundPresetPets } from '@/pets/catalog';
import { HERO_PET_PREVIEW_COUNT } from '@/utils/showcase-pets';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  loader: async () => {
    const [floatingPets, catalogPets] = await Promise.all([
      listPlaygroundPresetPets({ visibleIn: 'home' }),
      listHeroPets(HERO_PET_PREVIEW_COUNT),
    ]);
    return { catalogPets, floatingPets };
  },
  head: () => {
    const title = `Desktop Pet for Free – Desktop Cat & Desktop Dog | ${getDeskPetMessage('Metadata.title')}`;
    const description = getDeskPetMessage('Metadata.description');
    return seo('/', {
      title,
      description,
      keywords:
        'desktop pet, desktop cat, desktop dog, free desktop pet, online desktop pet',
    });
  },
  component: IndexPage,
});

function IndexPage() {
  const { catalogPets, floatingPets } = Route.useLoaderData();

  return <HomePage catalogPets={catalogPets} floatingPets={floatingPets} />;
}
