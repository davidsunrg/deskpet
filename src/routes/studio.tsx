import { StudioDashboard } from '@/components/studio/studio-dashboard';
import { seo } from '@/lib/seo';
import { websiteConfig } from '@/config/website';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/studio')({
  head: () =>
    seo('/studio', {
      title: `Studio | ${websiteConfig.metadata?.name}`,
      description:
        'Your pet dashboard — create images and videos, record voice, chat, and keep every memory.',
    }),
  component: StudioDashboard,
});
