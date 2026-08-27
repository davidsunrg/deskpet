import { DesktopPetMakerPage } from '@/components/pages/desktop-pet-maker-page';
import { deskpetPageTitle } from '@/lib/deskpet-seo';
import { getDeskPetMessage } from '@/lib/deskpet-i18n';
import { seo } from '@/lib/seo';
import { listHeroPets } from '@/pets/catalog';
import { HERO_PET_PREVIEW_COUNT } from '@/utils/showcase-pets';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/tools/desktop-pet-maker')({
  loader: async () => ({
    heroPets: await listHeroPets(HERO_PET_PREVIEW_COUNT),
  }),
  head: () =>
    seo('/tools/desktop-pet-maker', {
      title: deskpetPageTitle(getDeskPetMessage('CreatePetWizard.seoTitle')),
      description: getDeskPetMessage('CreatePetWizard.seoDescription'),
    }),
  component: DesktopPetMakerRoutePage,
});

function DesktopPetMakerRoutePage() {
  const { heroPets } = Route.useLoaderData();
  return <DesktopPetMakerPage heroPets={heroPets} />;
}
