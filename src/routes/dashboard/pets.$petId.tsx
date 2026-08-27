import { getUserPetFn } from '@/api/pet-maker-wizard';
import { PetDetailContent } from '@/components/dashboard/pet-detail-content';
import { DashboardPageShell } from '@/components/dashboard/dashboard-page-shell';
import { Routes } from '@/lib/routes';
import { isWizardStep, DEFAULT_PET_DETAIL_STEP, type WizardStep } from '@/utils/pets/pet-maker-wizard-steps';
import { createFileRoute, notFound } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/pets/$petId')({
  validateSearch: (
    search: Record<string, unknown>
  ): { step?: WizardStep } => ({
    step: isWizardStep(search.step) ? search.step : undefined,
  }),
  loader: async ({ params }) => {
    const { pet } = await getUserPetFn({ data: { petId: params.petId } });
    if (!pet) {
      throw notFound();
    }
    return { pet };
  },
  component: DashboardPetDetailPage,
});

function DashboardPetDetailPage() {
  const { pet } = Route.useLoaderData();
  const { step } = Route.useSearch();

  return (
    <DashboardPageShell
      breadcrumbs={[
        { label: 'Dashboard', href: Routes.DashboardPets },
        { label: 'My Pets', href: Routes.DashboardPets },
        { label: pet.name, isCurrentPage: true },
      ]}
    >
      <PetDetailContent pet={pet} initialStep={step ?? DEFAULT_PET_DETAIL_STEP} />
    </DashboardPageShell>
  );
}
