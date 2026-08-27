import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PlaygroundPet } from '@/utils/playground-pet';
import type { RefObject } from 'react';
import { PlaygroundFloatingPanel } from './playground-floating-panel';
import type { PanelPosition } from './use-panel-drag';

type PetSelectionPanelProps = {
  pets: readonly PlaygroundPet[];
  selectedPetKey: string;
  onSelectPet: (petKey: string) => void;
  mode?: 'floating' | 'rail';
  boundsRef?: RefObject<HTMLElement | null>;
  position?: PanelPosition | null;
  onPositionChange?: (position: PanelPosition) => void;
  onClose?: () => void;
};

/**
 * Pet picker for `/playground` (presets + optional owned pet).
 */
export function PetSelectionPanel({
  pets,
  selectedPetKey,
  onSelectPet,
  mode = 'floating',
  boundsRef,
  position = null,
  onPositionChange,
  onClose,
}: PetSelectionPanelProps) {
  const items = (
    <ul
      data-testid="playground-pet-picker"
      className={cn(
        'flex gap-1.5',
        mode === 'rail'
          ? 'max-w-full flex-nowrap overflow-x-auto p-1.5'
          : 'flex-col flex-nowrap'
      )}
    >
      {pets.map((pet) => {
        const selected = pet.key === selectedPetKey;
        return (
          <li
            key={pet.key}
            className={cn('min-w-0', mode === 'rail' && 'shrink-0')}
          >
            <Button
              type="button"
              variant="ghost"
              data-testid={`playground-pet-option-${pet.key}`}
              data-selected={selected ? 'true' : 'false'}
              className={cn(
                'h-auto justify-start gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium',
                mode === 'rail' ? 'w-auto' : 'w-full',
                'text-[color:var(--picker-fg)] hover:bg-[color:var(--picker-hover)] hover:text-[color:var(--picker-fg)]',
                selected &&
                  'bg-[color:var(--picker-selected)] shadow-sm ring-1 ring-[color:var(--picker-ring)] hover:bg-[color:var(--picker-selected)]'
              )}
              onClick={() => onSelectPet(pet.key)}
              aria-pressed={selected}
              aria-label={mode === 'rail' ? pet.name : undefined}
            >
              {pet.avatar ? (
                <img
                  src={pet.avatar}
                  alt=""
                  className="size-8 shrink-0 rounded-md object-cover ring-1 ring-[color:var(--picker-ring)]"
                />
              ) : (
                <span
                  className="size-8 shrink-0 rounded-md bg-[color:var(--picker-hover)] ring-1 ring-[color:var(--picker-ring)]"
                  aria-hidden
                />
              )}
              {mode === 'floating' ? (
                <span className="min-w-0 flex-1 truncate">
                  {pet.name}
                  {pet.isOwned ? (
                    <span className="ml-1 text-[10px] font-semibold uppercase tracking-wide opacity-70">
                      Mine
                    </span>
                  ) : null}
                </span>
              ) : null}
            </Button>
          </li>
        );
      })}
    </ul>
  );

  if (mode === 'rail') {
    return (
      <nav
        aria-label="Select pet"
        className="playground-picker pointer-events-auto absolute top-4 left-1/2 z-[60] max-w-[calc(100%-2rem)] -translate-x-1/2 overflow-hidden"
      >
        {items}
      </nav>
    );
  }

  if (!boundsRef || !onPositionChange || !onClose) return null;

  return (
    <PlaygroundFloatingPanel
      title="Pets"
      anchor="top-left"
      boundsRef={boundsRef}
      position={position}
      onPositionChange={onPositionChange}
      onClose={onClose}
      className="w-56"
    >
      {items}
    </PlaygroundFloatingPanel>
  );
}
