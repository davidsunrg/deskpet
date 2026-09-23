import { StudioCarePage } from '@/components/studio/care-page';
import { StudioPageShell } from '@/components/studio/studio-page-shell';
import { getStudioSection } from '@/components/studio/studio-sections';
import { createFileRoute, notFound } from '@tanstack/react-router';

export const Route = createFileRoute('/studio/$section')({
  component: StudioSectionPage,
});

function StudioSectionPage() {
  const { section: sectionSlug } = Route.useParams();
  const section = getStudioSection(sectionSlug);

  if (!section) {
    throw notFound();
  }

  if (sectionSlug === 'care') {
    return <StudioCarePage />;
  }

  return (
    <StudioPageShell>
      <div className="studio-placeholder">Placeholder</div>
    </StudioPageShell>
  );
}
