import { loadDesktopPetMakerPageDataFn } from '@/api/marketing-pet-maker';
import { DesktopPetMakerPage } from '@/components/pages/desktop-pet-maker-page';
import { deskpetPageTitle } from '@/lib/deskpet-seo';
import { getDeskPetMessage } from '@/lib/deskpet-i18n';
import { seo } from '@/lib/seo';
import { hasPetMakerResumeCreateParam } from '@/utils/pets/marketing-pet-maker-draft';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/tools/desktop-pet-maker')({
  validateSearch: (
    search: Record<string, unknown>
  ): { resumeCreate?: boolean } => ({
    resumeCreate: hasPetMakerResumeCreateParam(search) ? true : undefined,
  }),
  loader: () => loadDesktopPetMakerPageDataFn(),
  head: () =>
    seo('/tools/desktop-pet-maker', {
      title: deskpetPageTitle(getDeskPetMessage('MarketingPetMaker.seoTitle')),
      description: getDeskPetMessage('MarketingPetMaker.seoDescription'),
    }),
  component: DesktopPetMakerRoutePage,
});

function DesktopPetMakerRoutePage() {
  const { heroPets } = Route.useLoaderData();
  const { resumeCreate } = Route.useSearch();
  return (
    <DesktopPetMakerPage
      heroPets={heroPets}
      initialResumeCreate={resumeCreate === true}
    />
  );
}
