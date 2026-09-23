import {
  createFileRoute,
  type ErrorComponentProps,
  Outlet,
} from '@tanstack/react-router';
import {
  StudioErrorPage,
  StudioNotFoundPage,
} from '@/components/studio/studio-error-page';
import { StudioShell } from '@/components/studio/studio-shell';
import { websiteConfig } from '@/config/website';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/studio')({
  head: () =>
    seo('/studio', {
      title: `Studio | ${websiteConfig.metadata?.name}`,
      description:
        'Your pet dashboard — create images and videos, record voice, and keep every memory.',
    }),
  component: StudioLayout,
  errorComponent: StudioErrorRoute,
  notFoundComponent: StudioNotFoundRoute,
});

function StudioLayout() {
  return (
    <StudioShell>
      <Outlet />
    </StudioShell>
  );
}

function StudioErrorRoute(props: ErrorComponentProps) {
  return (
    <StudioShell>
      <StudioErrorPage {...props} />
    </StudioShell>
  );
}

function StudioNotFoundRoute() {
  return (
    <StudioShell>
      <StudioNotFoundPage />
    </StudioShell>
  );
}
