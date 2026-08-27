import { DashboardOverviewContent } from '@/components/dashboard/dashboard-overview-content';
import { DashboardPageShell } from '@/components/dashboard/dashboard-page-shell';
import { Routes } from '@/lib/routes';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/overview')({
  component: DashboardOverviewPage,
});

function DashboardOverviewPage() {
  return (
    <DashboardPageShell
      breadcrumbs={[
        { label: 'Dashboard', href: Routes.DashboardOverview },
        { label: 'Overview', isCurrentPage: true },
      ]}
    >
      <DashboardOverviewContent />
    </DashboardPageShell>
  );
}
