import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { CheckIcon } from 'lucide-react';
import type { ReactElement } from 'react';
import { Fragment } from 'react';

export type PetActionMenuItem = {
  id: string;
  label: string;
  active?: boolean;
  disabled?: boolean;
  /** Render a separator above this item. */
  separatorBefore?: boolean;
};

/**
 * Right-click action menu used by playground companions and showcase previews.
 */
export function PetActionMenu({
  trigger,
  items,
  onSelect,
  menuTestId,
  disabled,
}: {
  trigger: ReactElement;
  items: PetActionMenuItem[];
  onSelect: (id: string) => void;
  menuTestId: string;
  /** When true, render trigger only (e.g. hero preview). */
  disabled?: boolean;
}) {
  if (disabled) return trigger;

  return (
    <ContextMenu>
      <ContextMenuTrigger render={trigger} />
      <ContextMenuContent
        className="z-[2147483647] min-w-44"
        data-testid={menuTestId}
      >
        {items.map((item) => (
          <Fragment key={item.id}>
            {item.separatorBefore ? <ContextMenuSeparator /> : null}
            <ContextMenuItem
              data-testid={`${menuTestId}-item-${item.id}`}
              disabled={item.disabled}
              onSelect={() => onSelect(item.id)}
            >
              <span>{item.label}</span>
              {item.active ? (
                <CheckIcon className="ml-auto size-3.5 opacity-90" />
              ) : null}
            </ContextMenuItem>
          </Fragment>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
}
