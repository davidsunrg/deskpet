import { createFileRoute } from '@tanstack/react-router';
import { StudioPublicSiteEditor } from '@/components/studio/public-site-editor';

export const Route = createFileRoute('/studio/public-site/editor')({
  validateSearch: (search: Record<string, unknown>) => ({
    template: typeof search.template === 'string' ? search.template : undefined,
  }),
  component: StudioPublicSiteEditorRoute,
});

function StudioPublicSiteEditorRoute() {
  const { template } = Route.useSearch();
  return (
    <StudioPublicSiteEditor
      key={template ?? 'default'}
      initialTemplateId={template}
    />
  );
}
