import { studioMedia } from './studio-data';

export type TimelineCategory = 'memories' | 'creations' | 'health' | 'events';
export type TimelineFilter = 'all' | TimelineCategory;
export type TimelineEntryKind =
  | 'photo'
  | 'video'
  | 'voice'
  | 'weight'
  | 'care'
  | 'event';
export type TimelineEntrySource = 'manual' | 'ai' | 'care';

export type TimelineEntry = {
  id: string;
  category: TimelineCategory;
  kind: TimelineEntryKind;
  source: TimelineEntrySource;
  createdAt: string;
  title: string;
  description: string;
  media?: string[];
  value?: string;
  duration?: string;
};

export const timelineFilters: Array<{
  id: TimelineFilter;
  label: string;
}> = [
  { id: 'all', label: 'All' },
  { id: 'memories', label: 'Memories' },
  { id: 'creations', label: 'Creations' },
  { id: 'health', label: 'Health' },
  { id: 'events', label: 'Events' },
];

export const initialTimelineEntries: TimelineEntry[] = [
  {
    id: 'memory-summer',
    category: 'memories',
    kind: 'photo',
    source: 'manual',
    createdAt: '2026-09-20T14:30:00.000Z',
    title: 'Summer adventures with Mochi',
    description: 'Beach day, mountains, and a happy run through the park.',
    media: [studioMedia.beach, studioMedia.hiking, studioMedia.flowers],
  },
  {
    id: 'creation-storybook',
    category: 'creations',
    kind: 'photo',
    source: 'ai',
    createdAt: '2026-09-18T09:10:00.000Z',
    title: 'Storybook portrait',
    description: 'Saved from the AI photo generator.',
    media: [studioMedia.flowers],
  },
  {
    id: 'health-weight',
    category: 'health',
    kind: 'weight',
    source: 'care',
    createdAt: '2026-09-14T08:00:00.000Z',
    title: 'Weekly weigh-in',
    description: 'Weight stayed in Mochi’s healthy range.',
    value: '28.4 kg',
  },
  {
    id: 'memory-bark',
    category: 'memories',
    kind: 'voice',
    source: 'manual',
    createdAt: '2026-09-05T12:00:00.000Z',
    title: "Mochi's bark",
    description: 'A favorite voice recording.',
    duration: '0:08',
  },
  {
    id: 'creation-reel',
    category: 'creations',
    kind: 'video',
    source: 'ai',
    createdAt: '2026-09-02T17:45:00.000Z',
    title: 'Little journeys reel',
    description: 'Saved from the AI video generator.',
    media: [studioMedia.interactive],
    duration: '0:15',
  },
  {
    id: 'care-grooming',
    category: 'health',
    kind: 'care',
    source: 'care',
    createdAt: '2026-08-25T10:15:00.000Z',
    title: 'Grooming complete',
    description: 'Brushed, nails trimmed, and feeling fresh.',
  },
  {
    id: 'event-family',
    category: 'events',
    kind: 'event',
    source: 'manual',
    createdAt: '2026-08-12T16:00:00.000Z',
    title: 'Joined the family',
    description: 'The first day of a lifetime together.',
  },
];

export function filterTimelineEntries(
  entries: TimelineEntry[],
  filter: TimelineFilter
) {
  return filter === 'all'
    ? entries
    : entries.filter((entry) => entry.category === filter);
}

export function parseTimelineFilter(value: unknown): TimelineFilter {
  return timelineFilters.some((filter) => filter.id === value)
    ? (value as TimelineFilter)
    : 'all';
}
