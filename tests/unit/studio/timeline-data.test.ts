import { describe, expect, it } from 'vitest';
import {
  filterTimelineEntries,
  initialTimelineEntries,
  parseTimelineFilter,
} from '@/components/studio/timeline-data';
import { groupMediaByLocalDate } from '@/utils/pets/group-media-timeline';

describe('Studio Timeline data', () => {
  it('filters mixed entries by category', () => {
    const healthEntries = filterTimelineEntries(
      initialTimelineEntries,
      'health'
    );

    expect(healthEntries).toHaveLength(2);
    expect(healthEntries.every((entry) => entry.category === 'health')).toBe(
      true
    );
  });

  it('falls back to the all filter for unsupported values', () => {
    expect(parseTimelineFilter('creations')).toBe('creations');
    expect(parseTimelineFilter('unsupported')).toBe('all');
    expect(parseTimelineFilter(undefined)).toBe('all');
  });

  it('groups entries by date with newest groups first', () => {
    const groups = groupMediaByLocalDate(initialTimelineEntries, 'en');
    const dateKeys = groups.map((group) => group.dateKey);

    expect(dateKeys).toEqual([...dateKeys].sort((a, b) => b.localeCompare(a)));
    expect(groups.flatMap((group) => group.items)).toHaveLength(
      initialTimelineEntries.length
    );
  });
});
