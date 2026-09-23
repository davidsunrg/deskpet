import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/studio/public-site')({
  component: StudioPublicSiteLayout,
});

function StudioPublicSiteLayout() {
  return <Outlet />;
}
