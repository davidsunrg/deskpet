import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/pets')({
  component: DashboardPetsLayout,
});

function DashboardPetsLayout() {
  return <Outlet />;
}
