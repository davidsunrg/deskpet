import { StudioPageShell } from '@/components/studio/studio-page-shell';
import { getStudioSection } from '@/components/studio/studio-sections';
import { createFileRoute, notFound } from '@tanstack/react-router';

export const Route = createFileRoute('/studio/$section')({
  component: StudioPlaceholderPage,
});

function StudioPlaceholderPage() {
  const { section: sectionSlug } = Route.useParams();
  const section = getStudioSection(sectionSlug);

  if (!section) {
    throw notFound();
  }

  return (
    <StudioPageShell>
      <div className="studio-placeholder">Placeholder</div>
    </StudioPageShell>
  );
}
