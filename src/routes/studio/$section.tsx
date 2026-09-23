import { createFileRoute, notFound } from '@tanstack/react-router';
import { StudioCarePage } from '@/components/studio/care-page';
import {
  StudioCreatePage,
  type CreateTemplateKind,
} from '@/components/studio/create-page';
import { StudioPetPage } from '@/components/studio/pet-page';
import { StudioPageShell } from '@/components/studio/studio-page-shell';
import { getStudioSection } from '@/components/studio/studio-sections';

function parseCreateType(type: unknown): CreateTemplateKind | undefined {
  if (type === 'photo' || type === 'video') return type;
  return undefined;
}

export const Route = createFileRoute('/studio/$section')({
  validateSearch: (search: Record<string, unknown>) => ({
    type: parseCreateType(search.type),
  }),
  component: StudioSectionPage,
});

function StudioSectionPage() {
  const { section: sectionSlug } = Route.useParams();
  const { type } = Route.useSearch();
  const section = getStudioSection(sectionSlug);

  if (!section) {
    throw notFound();
  }

  if (sectionSlug === 'care') {
    return <StudioCarePage />;
  }

  if (sectionSlug === 'create') {
    return (
      <StudioCreatePage key={type ?? 'photo'} initialKind={type ?? 'photo'} />
    );
  }

  if (sectionSlug === 'share') {
    return <StudioPetPage />;
  }

  return (
    <StudioPageShell>
      <div className="studio-placeholder">Placeholder</div>
    </StudioPageShell>
  );
}
