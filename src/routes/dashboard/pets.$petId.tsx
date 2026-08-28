import { getUserPetFn } from '@/api/dashboard-pets';
import { DashboardPetDetail } from '@/components/dashboard/pet-detail/dashboard-pet-detail';
import { DashboardPageShell } from '@/components/dashboard/dashboard-page-shell';
import { Routes } from '@/lib/routes';
import {
  DEFAULT_DASHBOARD_PET_DETAIL_STEP,
  isDashboardPetDetailStep,
  type DashboardPetDetailStep,
} from '@/utils/pets/dashboard-pet-detail-steps';
import { createFileRoute, notFound } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/pets/$petId')({
  validateSearch: (
    search: Record<string, unknown>
  ): { step?: DashboardPetDetailStep } => ({
    step: isDashboardPetDetailStep(search.step) ? search.step : undefined,
  }),
  loader: async ({ params }) => {
    const { pet, userEmail } = await getUserPetFn({
      data: { petId: params.petId },
    });
    if (!pet) {
      throw notFound();
    }
    return { pet, userEmail };
  },
  component: DashboardPetDetailPage,
});

function DashboardPetDetailPage() {
  const { pet, userEmail } = Route.useLoaderData();
  const { step } = Route.useSearch();

  return (
    <DashboardPageShell
      breadcrumbs={[
        { label: 'Dashboard', href: Routes.DashboardPets },
        { label: 'My Pets', href: Routes.DashboardPets },
        { label: pet.name, isCurrentPage: true },
      ]}
    >
      <DashboardPetDetail
        pet={pet}
        userEmail={userEmail}
        initialStep={step ?? DEFAULT_DASHBOARD_PET_DETAIL_STEP}
      />
    </DashboardPageShell>
  );
}
