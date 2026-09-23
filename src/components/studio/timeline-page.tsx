import * as Dialog from '@radix-ui/react-dialog';
import {
  IconCalendarEvent,
  IconHeartbeat,
  IconPlus,
  IconScale,
  IconSparkles,
  IconX,
} from '@tabler/icons-react';
import { useMemo, useState, type FormEvent } from 'react';
import { groupMediaByLocalDate } from '@/utils/pets/group-media-timeline';
import { studioMedia } from './studio-data';
import { StudioPageShell } from './studio-page-shell';
import {
  filterTimelineEntries,
  initialTimelineEntries,
  timelineFilters,
  type TimelineEntry,
  type TimelineFilter,
} from './timeline-data';
import { TimelineEntryContent } from './timeline-entry';

type AddEntryType = 'memory' | 'weight' | 'care' | 'event' | 'creation';

const entryTypes: Array<{
  id: Exclude<AddEntryType, 'creation'>;
  label: string;
  icon: typeof IconPlus;
}> = [
  { id: 'memory', label: 'Memory', icon: IconPlus },
  { id: 'weight', label: 'Weight', icon: IconScale },
  { id: 'care', label: 'Care', icon: IconHeartbeat },
  { id: 'event', label: 'Event', icon: IconCalendarEvent },
];

export function StudioTimelinePage({
  initialFilter,
  initialAdd,
  creationKind = 'photo',
}: {
  initialFilter: TimelineFilter;
  initialAdd?: 'entry' | 'creation';
  creationKind?: 'photo' | 'video';
}) {
  const [entries, setEntries] = useState(initialTimelineEntries);
  const [filter, setFilter] = useState(initialFilter);
  const [open, setOpen] = useState(Boolean(initialAdd));
  const [entryType, setEntryType] = useState<AddEntryType>(
    initialAdd === 'creation' ? 'creation' : 'memory'
  );
  const [title, setTitle] = useState(
    initialAdd === 'creation'
      ? `Saved AI ${creationKind}`
      : 'A new memory with Mochi'
  );
  const [description, setDescription] = useState(
    initialAdd === 'creation' ? `Added from the ${creationKind} generator.` : ''
  );
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [weight, setWeight] = useState('28.4');
  const filteredEntries = useMemo(
    () => filterTimelineEntries(entries, filter),
    [entries, filter]
  );
  const groups = useMemo(
    () => groupMediaByLocalDate(filteredEntries, 'en'),
    [filteredEntries]
  );

  function selectEntryType(type: Exclude<AddEntryType, 'creation'>) {
    setEntryType(type);
    setTitle(
      type === 'weight'
        ? 'Weekly weigh-in'
        : type === 'care'
          ? 'Care update'
          : type === 'event'
            ? 'A special milestone'
            : 'A new memory with Mochi'
    );
  }

  function addEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const isCreation = entryType === 'creation';
    const kind =
      entryType === 'weight'
        ? 'weight'
        : entryType === 'care'
          ? 'care'
          : entryType === 'event'
            ? 'event'
            : isCreation
              ? creationKind
              : 'photo';
    const category =
      entryType === 'weight' || entryType === 'care'
        ? 'health'
        : entryType === 'event'
          ? 'events'
          : isCreation
            ? 'creations'
            : 'memories';
    const newEntry: TimelineEntry = {
      id: `local-${Date.now()}`,
      category,
      kind,
      source:
        entryType === 'weight' || entryType === 'care'
          ? 'care'
          : isCreation
            ? 'ai'
            : 'manual',
      createdAt: new Date(`${date}T12:00:00`).toISOString(),
      title: title.trim() || 'Untitled entry',
      description:
        description.trim() || 'Added locally in this Timeline prototype.',
      media:
        kind === 'photo' || kind === 'video'
          ? [kind === 'video' ? studioMedia.interactive : studioMedia.desktop]
          : undefined,
      value: kind === 'weight' ? `${weight || '—'} kg` : undefined,
      duration: kind === 'video' ? '0:15' : undefined,
    };
    setEntries((current) =>
      [newEntry, ...current].sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt)
      )
    );
    setFilter('all');
    setOpen(false);
  }

  return (
    <StudioPageShell>
      <section className="studio-timeline-page">
        <header className="studio-template-page-heading">
          <div>
            <p>Timeline</p>
            <h1>Every part of {`Mochi's`} story, in one place</h1>
            <span>
              Add memories, saved creations, health updates, and milestones as
              life happens.
            </span>
          </div>
          <button
            type="button"
            className="studio-button studio-button-primary"
            onClick={() => {
              setEntryType('memory');
              setOpen(true);
            }}
          >
            <IconPlus />
            Add entry
          </button>
        </header>

        <nav className="studio-timeline-filters" aria-label="Timeline filters">
          {timelineFilters.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={filter === item.id}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
              <span>
                {item.id === 'all'
                  ? entries.length
                  : entries.filter((entry) => entry.category === item.id)
                      .length}
              </span>
            </button>
          ))}
        </nav>

        <div className="studio-timeline-feed">
          {groups.length > 0 ? (
            groups.map((group) => (
              <section key={group.dateKey} className="studio-timeline-day">
                <header>
                  <time dateTime={group.dateKey}>{group.label}</time>
                  <span>{group.items.length} entries</span>
                </header>
                <div>
                  {group.items.map((entry) => (
                    <TimelineEntryContent key={entry.id} entry={entry} />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="studio-timeline-empty">
              <IconSparkles />
              <h2>No entries in this view yet</h2>
              <p>Add something new or choose another filter.</p>
            </div>
          )}
        </div>
      </section>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay
            data-studio-theme="light"
            className="studio-entry-dialog-overlay"
          />
          <Dialog.Content
            data-studio-theme="light"
            className="studio-entry-dialog"
          >
            <Dialog.Title>
              {entryType === 'creation'
                ? `Add generated ${creationKind}`
                : 'Add to Timeline'}
            </Dialog.Title>
            <Dialog.Description>
              This prototype keeps new entries only until the page is refreshed.
            </Dialog.Description>
            <Dialog.Close
              className="studio-entry-dialog-close"
              aria-label="Close"
            >
              <IconX />
            </Dialog.Close>
            <form onSubmit={addEntry}>
              {entryType !== 'creation' ? (
                <div className="studio-entry-type-grid">
                  {entryTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      aria-pressed={entryType === type.id}
                      onClick={() => selectEntryType(type.id)}
                    >
                      <type.icon />
                      {type.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="studio-entry-creation-note">
                  <IconSparkles />
                  <span>
                    <strong>AI {creationKind}</strong>
                    <small>Ready to save from Create</small>
                  </span>
                </div>
              )}
              <label>
                <span>Title</span>
                <input
                  value={title}
                  required
                  onChange={(event) => setTitle(event.target.value)}
                />
              </label>
              <label>
                <span>Note</span>
                <textarea
                  value={description}
                  rows={3}
                  placeholder="What would you like to remember?"
                  onChange={(event) => setDescription(event.target.value)}
                />
              </label>
              <div className="studio-entry-fields">
                <label>
                  <span>Date</span>
                  <input
                    type="date"
                    value={date}
                    required
                    onChange={(event) => setDate(event.target.value)}
                  />
                </label>
                {entryType === 'weight' ? (
                  <label>
                    <span>Weight (kg)</span>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={weight}
                      required
                      onChange={(event) => setWeight(event.target.value)}
                    />
                  </label>
                ) : null}
              </div>
              <div className="studio-entry-dialog-actions">
                <Dialog.Close className="studio-button">Cancel</Dialog.Close>
                <button
                  type="submit"
                  className="studio-button studio-button-primary"
                >
                  Add to Timeline
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </StudioPageShell>
  );
}
