import { getUserPetFn } from '@/api/pet-maker-wizard';
import { PetDetailContent } from '@/components/dashboard/pet-detail-content';
import { DashboardPageShell } from '@/components/dashboard/dashboard-page-shell';
import { Routes } from '@/lib/routes';
import { createFileRoute, notFound } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/pets/$petId')({
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

  return (
    <DashboardPageShell
      breadcrumbs={[
        { label: 'Dashboard', href: Routes.DashboardPets },
        { label: 'My Pets', href: Routes.DashboardPets },
        { label: pet.name, isCurrentPage: true },
      ]}
    >
      <PetDetailContent pet={pet} />
    </DashboardPageShell>
  );
}
