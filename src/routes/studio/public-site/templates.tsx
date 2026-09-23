import { createFileRoute } from '@tanstack/react-router';
import { StudioPublicSiteTemplates } from '@/components/studio/public-site-templates';

export const Route = createFileRoute('/studio/public-site/templates')({
  component: StudioPublicSiteTemplates,
});
