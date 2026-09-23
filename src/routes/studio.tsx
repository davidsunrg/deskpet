import { StudioShell } from '@/components/studio/studio-shell';
import { seo } from '@/lib/seo';
import { websiteConfig } from '@/config/website';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/studio')({
  head: () =>
    seo('/studio', {
      title: `Studio | ${websiteConfig.metadata?.name}`,
      description:
        'Your pet dashboard — create images and videos, record voice, and keep every memory.',
    }),
  component: StudioLayout,
});

function StudioLayout() {
  return (
    <StudioShell>
      <Outlet />
    </StudioShell>
  );
}
