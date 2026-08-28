import { listUserPetsFn } from '@/api/dashboard-pets';
import { MyPetsContent } from '@/components/dashboard/my-pets-content';
import { DashboardPageShell } from '@/components/dashboard/dashboard-page-shell';
import { CtaButton } from '@/components/ui/cta-button';
import { LocaleLink } from '@/lib/i18n/navigation';
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
      actions={
        <CtaButton asChild size="default" className="min-h-10 px-4">
          <LocaleLink href={Routes.DesktopPetCreator}>Add Pet</LocaleLink>
        </CtaButton>
      }
    >
      <MyPetsContent pets={pets} />
    </DashboardPageShell>
  );
}
