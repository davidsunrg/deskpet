import { listUserPetsFn } from '@/api/pet-maker-wizard';
import { MyPetsContent } from '@/components/dashboard/my-pets-content';
import { DashboardPageShell } from '@/components/dashboard/dashboard-page-shell';
import { Routes } from '@/lib/routes';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/pets/')({
  loader: () => listUserPetsFn(),
  component: DashboardPetsPage,
});

function DashboardPetsPage() {
  const { pets } = Route.useLoaderData();

  return (
    <DashboardPageShell
      breadcrumbs={[
        { label: 'Dashboard', href: Routes.DashboardPets },
        { label: 'My Pets', isCurrentPage: true },
      ]}
    >
      <MyPetsContent pets={pets} />
    </DashboardPageShell>
  );
}
