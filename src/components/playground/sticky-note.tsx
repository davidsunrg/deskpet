import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GripVerticalIcon, XIcon } from 'lucide-react';
import {
  useCallback,
  useRef,
  useState,
  type PointerEvent,
  type RefObject,
} from 'react';
import type { StickyColor, StickyNoteState } from './playground-layout-storage';
import { clampPanelPosition } from './use-panel-drag';

const COLOR_CLASS: Record<StickyColor, string> = {
  yellow:
    'bg-[#fef3c7]/95 text-[#78350f] border-[#f59e0b]/45 placeholder:text-[#92400e]/55',
  mint: 'bg-[#d1fae5]/95 text-[#065f46] border-[#34d399]/45 placeholder:text-[#047857]/55',
  pink: 'bg-[#fce7f3]/95 text-[#9d174d] border-[#f472b6]/45 placeholder:text-[#be185d]/55',
  blue: 'bg-[#dbeafe]/95 text-[#1e3a8a] border-[#60a5fa]/45 placeholder:text-[#1d4ed8]/55',
};

type StickyNoteProps = {
  note: StickyNoteState;
  boundsRef: RefObject<HTMLElement | null>;
  onTextChange: (text: string) => void;
  onPositionChange: (x: number, y: number) => void;
  onCycleColor: () => void;
  onRemove: () => void;
};

/**
 * One draggable sticky note on the playground.
 */
export function StickyNote({
  note,
  boundsRef,
  onTextChange,
  onPositionChange,
  onCycleColor,
  onRemove,
}: StickyNoteProps) {
  const noteRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
  } | null>(null);

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) {
        return;
      }
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      dragRef.current = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startX: note.x,
        startY: note.y,
      };
      setIsDragging(true);
    },
    [note.x, note.y]
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) {
        return;
      }
      event.preventDefault();
      const boundsEl = boundsRef.current;
      const noteEl = noteRef.current;
      const bounds = boundsEl
        ? { width: boundsEl.clientWidth, height: boundsEl.clientHeight }
        : { width: 0, height: 0 };
      const size = noteEl
        ? {
            width: noteEl.getBoundingClientRect().width,
            height: noteEl.getBoundingClientRect().height,
          }
        : { width: 180, height: 160 };
      const next = clampPanelPosition(
        {
          x: drag.startX + event.clientX - drag.startClientX,
          y: drag.startY + event.clientY - drag.startClientY,
        },
        size,
        bounds
      );
      onPositionChange(next.x, next.y);
    },
    [boundsRef, onPositionChange]
  );

  const finishDrag = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
    setIsDragging(false);
  }, []);

  return (
    <div
      ref={noteRef}
      className={cn(
        'pointer-events-auto absolute top-0 left-0 z-30 w-[min(180px,46vw)] rounded-md border shadow-md backdrop-blur-sm',
        COLOR_CLASS[note.color],
        isDragging && 'cursor-grabbing select-none shadow-lg'
      )}
      style={{
        transform: `translate3d(${note.x}px, ${note.y}px, 0)`,
      }}
      data-testid="sticky-note"
    >
      <div
        className={cn(
          'flex items-center gap-1 border-b border-black/10 px-1.5 py-1',
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
      >
        <GripVerticalIcon
          className="size-3.5 shrink-0 opacity-60"
          aria-hidden
        />
        <button
          type="button"
          className="size-3.5 shrink-0 rounded-full border border-black/20 bg-black/10"
          aria-label="Change sticky color"
          title="Change color"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={onCycleColor}
        />
        <span className="min-w-0 flex-1 truncate text-[10px] font-semibold tracking-wide uppercase opacity-70">
          Note
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6 shrink-0 rounded-md opacity-70 hover:bg-black/10 hover:opacity-100"
          aria-label="Delete sticky note"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={onRemove}
        >
          <XIcon className="size-3.5" />
        </Button>
      </div>
      <textarea
        className="min-h-[7rem] w-full resize-none bg-transparent px-2.5 py-2 text-sm leading-snug outline-none placeholder:opacity-60"
        value={note.text}
        placeholder="Write something…"
        onChange={(event) => onTextChange(event.target.value)}
        aria-label="Sticky note text"
      />
    </div>
  );
}
