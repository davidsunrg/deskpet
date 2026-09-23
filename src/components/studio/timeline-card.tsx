import { IconArrowRight, IconTimeline } from '@tabler/icons-react';
import { LocaleLink } from '@/lib/i18n/navigation';
import { Routes } from '@/lib/routes';
import { groupMediaByLocalDate } from '@/utils/pets/group-media-timeline';
import { StudioCardHeader } from './studio-card';
import { initialTimelineEntries } from './timeline-data';
import { TimelineEntryContent } from './timeline-entry';

const previewEntries = initialTimelineEntries.slice(0, 4);
const previewGroups = groupMediaByLocalDate(previewEntries, 'en');

export function TimelineCard() {
  return (
    <section id="timeline" className="studio-card studio-timeline-preview">
      <StudioCardHeader
        icon={<IconTimeline />}
        title="Timeline"
        action={
          <LocaleLink
            href={Routes.StudioTimeline}
            className="studio-preview-link"
          >
            View all
            <IconArrowRight />
          </LocaleLink>
        }
      />
      <ol className="studio-timeline">
        {previewGroups.flatMap((group) =>
          group.items.map((entry, index) => (
            <li key={entry.id}>
              {index === 0 ? <time>{group.label}</time> : null}
              <TimelineEntryContent entry={entry} compact />
            </li>
          ))
        )}
      </ol>
    </section>
  );
}
