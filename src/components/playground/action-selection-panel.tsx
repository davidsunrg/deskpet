import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { LogicalActionMenuItem } from '@/utils/pets/pet-action-sequence';
import type { RefObject } from 'react';
import { logicalActionLabel } from './action-label';
import { PlaygroundFloatingPanel } from './playground-floating-panel';
import type { PanelPosition } from './use-panel-drag';

type ActionSelectionPanelProps = {
  items: readonly LogicalActionMenuItem[];
  selectedLogicalActionId: string | null;
  onSelectLogicalAction: (actionId: string) => void;
  mode?: 'floating' | 'rail';
  boundsRef?: RefObject<HTMLElement | null>;
  position?: PanelPosition | null;
  onPositionChange?: (position: PanelPosition) => void;
  onClose?: () => void;
};

/**
 * Logical action picker for the selected `/playground` pet.
 */
export function ActionSelectionPanel({
  items,
  selectedLogicalActionId,
  onSelectLogicalAction,
  mode = 'floating',
  boundsRef,
  position = null,
  onPositionChange,
  onClose,
}: ActionSelectionPanelProps) {
  const actionItems = (
    <ul
      className={cn(
        'flex gap-1.5',
        mode === 'rail'
          ? 'max-w-full flex-nowrap overflow-x-auto p-1.5'
          : 'flex-col flex-nowrap'
      )}
    >
      {items.map((item, index) => {
        const selected = item.id === selectedLogicalActionId;
        const prev = items[index - 1];
        const showGroupGap = Boolean(prev && prev.group !== item.group);
        return (
          <li
            key={item.id}
            className={cn(
              'min-w-0',
              mode === 'rail' && 'shrink-0',
              showGroupGap &&
                (mode === 'rail'
                  ? 'ml-1 border-[color:var(--picker-border)] border-l pl-2'
                  : 'mt-1.5')
            )}
          >
            <Button
              type="button"
              variant="ghost"
              disabled={Boolean(item.disabled)}
              className={cn(
                'h-auto justify-start rounded-md px-2.5 py-2 text-left text-sm font-medium',
                mode === 'rail' ? 'w-auto whitespace-nowrap' : 'w-full',
                'text-[color:var(--picker-fg)] hover:bg-[color:var(--picker-hover)] hover:text-[color:var(--picker-fg)]',
                selected &&
                  'bg-[color:var(--picker-selected)] shadow-sm ring-1 ring-[color:var(--picker-ring)] hover:bg-[color:var(--picker-selected)]',
                item.disabled && 'opacity-40'
              )}
              onClick={() => {
                if (item.disabled) return;
                onSelectLogicalAction(item.id);
              }}
              aria-pressed={selected}
            >
              <span className="truncate">{logicalActionLabel(item)}</span>
            </Button>
          </li>
        );
      })}
    </ul>
  );

  if (mode === 'rail') {
    return (
      <nav
        aria-label="Select action"
        className="playground-picker pointer-events-auto absolute bottom-4 left-1/2 z-[60] max-w-[calc(100%-2rem)] -translate-x-1/2 overflow-hidden"
      >
        {actionItems}
      </nav>
    );
  }

  if (!boundsRef || !onPositionChange || !onClose) return null;

  return (
    <PlaygroundFloatingPanel
      title="Actions"
      anchor="beside-pet-right"
      boundsRef={boundsRef}
      position={position}
      onPositionChange={onPositionChange}
      onClose={onClose}
      className="w-48"
    >
      {actionItems}
    </PlaygroundFloatingPanel>
  );
}
