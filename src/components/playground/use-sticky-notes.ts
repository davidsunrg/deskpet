import { useCallback, useEffect, useState } from 'react';
import {
  readPlaygroundLayout,
  writePlaygroundStickies,
  type StickyColor,
  type StickyNoteState,
  STICKY_COLORS,
} from './playground-layout-storage';

function createId() {
  return `sticky-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function nextColor(index: number): StickyColor {
  return STICKY_COLORS[index % STICKY_COLORS.length] ?? 'yellow';
}

function defaultPosition(
  index: number,
  bounds?: { width: number; height: number }
): { x: number; y: number } {
  const baseX = bounds ? Math.round(bounds.width * 0.28) : 220;
  const baseY = bounds ? Math.round(bounds.height * 0.22) : 120;
  const offset = (index % 6) * 24;
  return { x: baseX + offset, y: baseY + offset };
}

/**
 * Sticky-note list with localStorage persistence.
 */
export function useStickyNotes(options?: {
  getBoundsSize?: () => { width: number; height: number };
}) {
  const getBoundsSize = options?.getBoundsSize;
  const [notes, setNotes] = useState<StickyNoteState[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readPlaygroundLayout()?.stickies;
    setNotes(stored ?? []);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    writePlaygroundStickies(notes);
  }, [hydrated, notes]);

  const add = useCallback(() => {
    setNotes((current) => {
      const bounds = getBoundsSize?.();
      const pos = defaultPosition(current.length, bounds);
      const note: StickyNoteState = {
        id: createId(),
        text: '',
        x: pos.x,
        y: pos.y,
        color: nextColor(current.length),
      };
      return [...current, note];
    });
  }, [getBoundsSize]);

  const ensureAtLeastOne = useCallback(() => {
    setNotes((current) => {
      if (current.length > 0) {
        return current;
      }
      const bounds = getBoundsSize?.();
      const pos = defaultPosition(0, bounds);
      return [
        {
          id: createId(),
          text: '',
          x: pos.x,
          y: pos.y,
          color: 'yellow',
        },
      ];
    });
  }, [getBoundsSize]);

  const updateText = useCallback((id: string, text: string) => {
    setNotes((current) =>
      current.map((note) => (note.id === id ? { ...note, text } : note))
    );
  }, []);

  const setPosition = useCallback((id: string, x: number, y: number) => {
    setNotes((current) =>
      current.map((note) =>
        note.id === id ? { ...note, x: Math.round(x), y: Math.round(y) } : note
      )
    );
  }, []);

  const setColor = useCallback((id: string, color: StickyColor) => {
    setNotes((current) =>
      current.map((note) => (note.id === id ? { ...note, color } : note))
    );
  }, []);

  const cycleColor = useCallback((id: string) => {
    setNotes((current) =>
      current.map((note) => {
        if (note.id !== id) {
          return note;
        }
        const index = STICKY_COLORS.indexOf(note.color);
        const next =
          STICKY_COLORS[(index + 1) % STICKY_COLORS.length] ?? 'yellow';
        return { ...note, color: next };
      })
    );
  }, []);

  const remove = useCallback((id: string) => {
    setNotes((current) => current.filter((note) => note.id !== id));
  }, []);

  return {
    notes,
    hydrated,
    add,
    ensureAtLeastOne,
    updateText,
    setPosition,
    setColor,
    cycleColor,
    remove,
  };
}
