import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ChromeId } from './use-playground-chrome';

type PanelsToggleStripProps = {
  panels: readonly { id: ChromeId; label: string }[];
  visible: Record<ChromeId, boolean>;
  onToggle: (id: ChromeId) => void;
};

/**
 * Fixed control to show/hide playground chrome panels after they are closed.
 */
export function PanelsToggleStrip({
  panels,
  visible,
  onToggle,
}: PanelsToggleStripProps) {
  return (
    <div
      className="pointer-events-auto absolute bottom-4 left-1/2 z-[60] flex -translate-x-1/2 flex-nowrap justify-center gap-1 playground-picker p-1"
      role="toolbar"
      aria-label="Playground panels"
    >
      {panels.map((panel) => {
        const isVisible = visible[panel.id];
        return (
          <Button
            key={panel.id}
            type="button"
            variant="ghost"
            className={cn(
              'h-7 rounded-md px-2.5 text-xs font-medium',
              'text-[color:var(--picker-fg)] hover:bg-[color:var(--picker-hover)] hover:text-[color:var(--picker-fg)]',
              isVisible &&
                'bg-[color:var(--picker-selected)] shadow-sm ring-1 ring-[color:var(--picker-ring)] hover:bg-[color:var(--picker-selected)]'
            )}
            aria-pressed={isVisible}
            onClick={() => onToggle(panel.id)}
          >
            {panel.label}
          </Button>
        );
      })}
    </div>
  );
}
