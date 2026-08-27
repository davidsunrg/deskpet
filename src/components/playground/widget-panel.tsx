import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { XIcon } from 'lucide-react';
import { useCallback, useEffect, useState, type RefObject } from 'react';
import { CountdownWidget } from './countdown-widget';
import { PlaygroundFloatingPanel } from './playground-floating-panel';
import {
  readPlaygroundLayout,
  writePlaygroundWidgets,
  type WidgetId,
} from './playground-layout-storage';
import { PomodoroWidget } from './pomodoro-widget';
import { StickyNotesLayer } from './sticky-notes-layer';
import type { PanelPosition } from './use-panel-drag';
import { useStickyNotes } from './use-sticky-notes';

const WIDGETS: readonly {
  id: WidgetId;
  label: string;
}[] = [
  { id: 'pomodoro', label: 'Pomodoro' },
  { id: 'countdown', label: 'Timer' },
  { id: 'notes', label: 'Stickies' },
];

type WidgetPanelProps = {
  boundsRef: RefObject<HTMLElement | null>;
  position: PanelPosition | null;
  onPositionChange: (position: PanelPosition) => void;
  onClose: () => void;
  /** When false, hide the Widgets dock chrome but keep stickies/timers alive. */
  dockVisible?: boolean;
};

/**
 * Playground widget dock. Individual widgets close independently and reopen
 * from the tab list; running timers stay mounted so they keep ticking.
 */
export function WidgetPanel({
  boundsRef,
  position,
  onPositionChange,
  onClose,
  dockVisible = true,
}: WidgetPanelProps) {
  const [selectedWidgetId, setSelectedWidgetId] = useState<WidgetId | null>(
    null
  );
  const [openWidgetIds, setOpenWidgetIds] = useState<ReadonlySet<WidgetId>>(
    () => new Set()
  );
  const [pomodoroMounted, setPomodoroMounted] = useState(false);
  const [countdownMounted, setCountdownMounted] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const getBoundsSize = useCallback(() => {
    const el = boundsRef.current;
    if (!el) {
      return { width: 0, height: 0 };
    }
    return { width: el.clientWidth, height: el.clientHeight };
  }, [boundsRef]);

  const {
    notes,
    hydrated: stickiesHydrated,
    add: addSticky,
    ensureAtLeastOne,
    updateText,
    setPosition: setStickyPosition,
    cycleColor,
    remove: removeSticky,
  } = useStickyNotes({ getBoundsSize });

  useEffect(() => {
    const stored = readPlaygroundLayout();
    const open = new Set(stored?.openWidgets ?? []);
    setOpenWidgetIds(open);
    setSelectedWidgetId(stored?.selectedWidget ?? null);
    setPomodoroMounted(open.has('pomodoro'));
    setCountdownMounted(open.has('countdown'));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    writePlaygroundWidgets({
      openWidgets: [...openWidgetIds],
      selectedWidget: selectedWidgetId,
    });
  }, [hydrated, openWidgetIds, selectedWidgetId]);

  const notesOpen = openWidgetIds.has('notes');

  useEffect(() => {
    if (!notesOpen || !stickiesHydrated) {
      return;
    }
    ensureAtLeastOne();
  }, [ensureAtLeastOne, notesOpen, stickiesHydrated]);

  const openWidget = useCallback((id: WidgetId) => {
    setOpenWidgetIds((current) => {
      if (current.has(id)) {
        return current;
      }
      const next = new Set(current);
      next.add(id);
      return next;
    });
    setSelectedWidgetId(id);
    if (id === 'pomodoro') {
      setPomodoroMounted(true);
    }
    if (id === 'countdown') {
      setCountdownMounted(true);
    }
  }, []);

  const closeWidget = useCallback((id: WidgetId) => {
    setOpenWidgetIds((current) => {
      if (!current.has(id)) {
        return current;
      }
      const next = new Set(current);
      next.delete(id);
      return next;
    });
    setSelectedWidgetId((current) => (current === id ? null : current));
  }, []);

  const pomodoroOpen = openWidgetIds.has('pomodoro');
  const countdownOpen = openWidgetIds.has('countdown');

  return (
    <>
      <StickyNotesLayer
        boundsRef={boundsRef}
        active={notesOpen}
        notes={notes}
        onTextChange={updateText}
        onPositionChange={setStickyPosition}
        onCycleColor={cycleColor}
        onRemove={removeSticky}
      />

      <div
        className={dockVisible ? undefined : 'hidden'}
        aria-hidden={!dockVisible}
      >
        <PlaygroundFloatingPanel
          title="Widgets"
          anchor="top-after-left"
          boundsRef={boundsRef}
          position={position}
          onPositionChange={onPositionChange}
          onClose={onClose}
          className="w-56"
        >
          {pomodoroMounted ? (
            <PomodoroWidget
              visible={pomodoroOpen}
              onClose={() => closeWidget('pomodoro')}
            />
          ) : null}

          {countdownMounted ? (
            <CountdownWidget
              visible={countdownOpen}
              onClose={() => closeWidget('countdown')}
            />
          ) : null}

          {notesOpen ? (
            <StickiesDockBody
              count={notes.length}
              onAdd={addSticky}
              onClose={() => closeWidget('notes')}
            />
          ) : null}

          <ul className="flex flex-col flex-nowrap gap-1.5">
            {WIDGETS.map((widget) => {
              const selected = widget.id === selectedWidgetId;
              const open = openWidgetIds.has(widget.id);
              return (
                <li key={widget.id} className="min-w-0">
                  <Button
                    type="button"
                    variant="ghost"
                    className={cn(
                      'h-auto w-full justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium',
                      'text-[color:var(--picker-fg)] hover:bg-[color:var(--picker-hover)] hover:text-[color:var(--picker-fg)]',
                      (selected || open) &&
                        'bg-[color:var(--picker-selected)] shadow-sm ring-1 ring-[color:var(--picker-ring)] hover:bg-[color:var(--picker-selected)]'
                    )}
                    onClick={() => openWidget(widget.id)}
                    aria-pressed={open}
                  >
                    <span className="truncate">{widget.label}</span>
                  </Button>
                </li>
              );
            })}
          </ul>
        </PlaygroundFloatingPanel>
      </div>
    </>
  );
}

function StickiesDockBody({
  count,
  onAdd,
  onClose,
}: {
  count: number;
  onAdd: () => void;
  onClose: () => void;
}) {
  return (
    <div className="mb-2 space-y-2 rounded-md border border-[color:var(--picker-ring)] bg-[color:var(--picker-selected)]/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold tracking-wide text-[color:var(--picker-muted)] uppercase">
          Stickies
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6 shrink-0 rounded-md text-[color:var(--picker-muted)] hover:bg-[color:var(--picker-hover)] hover:text-[color:var(--picker-fg)]"
          aria-label="Close Stickies"
          onClick={onClose}
        >
          <XIcon className="size-3.5" />
        </Button>
      </div>
      <p className="text-[11px] text-[color:var(--picker-muted)]">
        {count} note{count === 1 ? '' : 's'} on the desk
      </p>
      <Button
        type="button"
        variant="ghost"
        className={cn(
          'h-8 w-full rounded-md text-sm font-medium',
          'text-[color:var(--picker-fg)] hover:bg-[color:var(--picker-hover)]'
        )}
        onClick={onAdd}
      >
        Add note
      </Button>
    </div>
  );
}
