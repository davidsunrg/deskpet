import type { RefObject } from 'react';
import { StickyNote } from './sticky-note';
import type { StickyNoteState } from './playground-layout-storage';

type StickyNotesLayerProps = {
  boundsRef: RefObject<HTMLElement | null>;
  active: boolean;
  notes: readonly StickyNoteState[];
  onTextChange: (id: string, text: string) => void;
  onPositionChange: (id: string, x: number, y: number) => void;
  onCycleColor: (id: string) => void;
  onRemove: (id: string) => void;
};

/**
 * Free-floating sticky notes on the playground stage.
 * Stays mounted while Stickies is open even if the Widgets dock is hidden.
 */
export function StickyNotesLayer({
  boundsRef,
  active,
  notes,
  onTextChange,
  onPositionChange,
  onCycleColor,
  onRemove,
}: StickyNotesLayerProps) {
  if (!active) {
    return null;
  }

  return (
    <section
      className="pointer-events-none absolute inset-0 z-30"
      aria-label="Sticky notes"
    >
      {notes.map((note) => (
        <StickyNote
          key={note.id}
          note={note}
          boundsRef={boundsRef}
          onTextChange={(text) => onTextChange(note.id, text)}
          onPositionChange={(x, y) => onPositionChange(note.id, x, y)}
          onCycleColor={() => onCycleColor(note.id)}
          onRemove={() => onRemove(note.id)}
        />
      ))}
    </section>
  );
}
