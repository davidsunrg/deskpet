import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { StudioCarePage } from '@/components/studio/care-page';
import {
  StudioCreatePage,
  type CreateTemplateKind,
} from '@/components/studio/create-page';
import { StudioPageShell } from '@/components/studio/studio-page-shell';
import { getStudioSection } from '@/components/studio/studio-sections';
import {
  parseTimelineFilter,
  type TimelineFilter,
} from '@/components/studio/timeline-data';
import { StudioTimelinePage } from '@/components/studio/timeline-page';

function parseCreateType(type: unknown): CreateTemplateKind | undefined {
  if (type === 'photo' || type === 'video') return type;
  return undefined;
}

export const Route = createFileRoute('/studio/$section')({
  beforeLoad: ({ params }) => {
    if (params.section === 'moments') {
      throw redirect({
        to: '/studio/$section',
        params: { section: 'timeline' },
        replace: true,
      });
    }
  },
  validateSearch: (search: Record<string, unknown>) => ({
    type: parseCreateType(search.type),
    filter:
      typeof search.filter === 'string'
        ? parseTimelineFilter(search.filter)
        : undefined,
    add:
      search.add === 'entry' || search.add === 'creation'
        ? search.add
        : undefined,
    kind:
      search.kind === 'photo' || search.kind === 'video'
        ? search.kind
        : undefined,
  }),
  component: StudioSectionPage,
});

function StudioSectionPage() {
  const { section: sectionSlug } = Route.useParams();
  const { type, filter, add, kind } = Route.useSearch();
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

  if (sectionSlug === 'timeline') {
    return (
      <StudioTimelinePage
        key={`${add ?? 'view'}-${kind ?? 'photo'}`}
        initialFilter={(filter ?? 'all') as TimelineFilter}
        initialAdd={add}
        creationKind={kind}
      />
    );
  }

  return (
    <StudioPageShell>
      <div className="studio-placeholder">Placeholder</div>
    </StudioPageShell>
  );
}
