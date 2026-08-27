import { DashboardPageShell } from '@/components/dashboard/dashboard-page-shell';
import { Routes } from '@/lib/routes';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/actions')({
  component: DashboardActionsPage,
});

function DashboardActionsPage() {
  return (
    <DashboardPageShell
      breadcrumbs={[
        { label: 'Dashboard', href: Routes.DashboardOverview },
        { label: 'Actions', isCurrentPage: true },
      ]}
    >
      <div className="rounded-2xl border-2 border-dashed border-deskpet-ink/15 bg-deskpet-paper/60 p-8 text-center">
        <h2 className="text-lg font-black text-deskpet-ink">
          Actions workspace
        </h2>
        <p className="mt-2 text-sm text-deskpet-muted">
          Pose and action generation will land in Part 4. Upload sources,
          generate poses, and build playable clips from here.
        </p>
      </div>
    </DashboardPageShell>
  );
}
