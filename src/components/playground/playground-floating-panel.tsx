import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GripVerticalIcon, XIcon } from 'lucide-react';
import {
  useCallback,
  useRef,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  usePanelDrag,
  type PanelAnchor,
  type PanelPosition,
} from './use-panel-drag';

type PlaygroundFloatingPanelProps = {
  title: string;
  anchor: PanelAnchor;
  boundsRef: RefObject<HTMLElement | null>;
  position: PanelPosition | null;
  onPositionChange: (position: PanelPosition) => void;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  style?: CSSProperties;
  zIndexClassName?: string;
};

/**
 * Draggable / closable chrome shell for playground overlays.
 * Drag only from the title handle so inner controls stay clickable.
 */
export function PlaygroundFloatingPanel({
  title,
  anchor,
  boundsRef,
  position,
  onPositionChange,
  onClose,
  children,
  className,
  contentClassName,
  style,
  zIndexClassName = 'z-40',
}: PlaygroundFloatingPanelProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const { isDragging, handlePointerDown, handlePointerMove, finishDrag } =
    usePanelDrag({
      boundsRef,
      panelRef,
      anchor,
      position,
      onPositionChange,
    });

  const onCloseClick = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      className={cn(
        'pointer-events-auto absolute top-0 left-0',
        zIndexClassName,
        isDragging && 'select-none',
        className
      )}
      style={{
        ...style,
        transform:
          position != null
            ? `translate3d(${position.x}px, ${position.y}px, 0)`
            : 'translate3d(-9999px, -9999px, 0)',
        visibility: position != null ? 'visible' : 'hidden',
      }}
    >
      <div
        className={cn('playground-picker overflow-hidden', contentClassName)}
      >
        <div
          className={cn(
            'flex items-center gap-1 border-b border-[color:var(--picker-ring)] px-1.5 py-1',
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
        >
          <GripVerticalIcon
            className="size-3.5 shrink-0 text-[color:var(--picker-muted)]"
            aria-hidden
          />
          <p className="min-w-0 flex-1 truncate text-[11px] font-semibold tracking-wide text-[color:var(--picker-muted)] uppercase">
            {title}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-6 shrink-0 rounded-md text-[color:var(--picker-muted)] hover:bg-[color:var(--picker-hover)] hover:text-[color:var(--picker-fg)]"
            aria-label={`Close ${title}`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={onCloseClick}
          >
            <XIcon className="size-3.5" />
          </Button>
        </div>
        <div className="p-2.5">{children}</div>
      </div>
    </div>
  );
}
