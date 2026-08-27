import { loadDesktopPetMakerPageDataFn } from '@/api/pet-maker-wizard';
import { DesktopPetMakerPage } from '@/components/pages/desktop-pet-maker-page';
import { deskpetPageTitle } from '@/lib/deskpet-seo';
import { getDeskPetMessage } from '@/lib/deskpet-i18n';
import { seo } from '@/lib/seo';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/tools/desktop-pet-maker')({
  loader: () => loadDesktopPetMakerPageDataFn(),
  head: () =>
    seo('/tools/desktop-pet-maker', {
      title: deskpetPageTitle(getDeskPetMessage('CreatePetWizard.seoTitle')),
      description: getDeskPetMessage('CreatePetWizard.seoDescription'),
    }),
  component: DesktopPetMakerRoutePage,
});

function DesktopPetMakerRoutePage() {
  const { heroPets, initialDraft } = Route.useLoaderData();
  return (
    <DesktopPetMakerPage heroPets={heroPets} initialDraft={initialDraft} />
  );
}
