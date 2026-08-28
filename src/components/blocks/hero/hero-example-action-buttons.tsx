'use client';

import { logicalActionLabel } from '@/components/playground/action-label';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/lib/deskpet-i18n';
import { cn } from '@/lib/utils';
import type { LogicalActionMenuItem } from '@/utils/pets/pet-action-sequence';

type HeroExampleActionButtonsProps = {
  petName: string;
  petId: string;
  items: readonly LogicalActionMenuItem[];
  selectedLogicalActionId: string | null;
  onSelectLogicalAction: (actionId: string) => void;
};

/** Split menu items into two visual rows (status/sit, then walk). */
function splitActionRows(
  items: readonly LogicalActionMenuItem[]
): LogicalActionMenuItem[][] {
  if (items.length === 0) return [];
  const walkStart = items.findIndex((item) => item.group === 'walk');
  if (walkStart > 0) {
    return [items.slice(0, walkStart), items.slice(walkStart)];
  }
  const mid = Math.ceil(items.length / 2);
  return [items.slice(0, mid), items.slice(mid)];
}

export function HeroExampleActionButtons({
  petName,
  petId,
  items,
  selectedLogicalActionId,
  onSelectLogicalAction,
}: HeroExampleActionButtonsProps) {
  const t = useTranslations('HomePage.hero');
  const rows = splitActionRows(items);

  return (
    <nav
      aria-label={`${petName} actions`}
      className="mx-3 mb-3 sm:mx-4 sm:mb-4"
      data-testid={`hero-example-actions-${petId}`}
    >
      <p className="m-0 mb-3 rounded-xl bg-deskpet-mint-soft px-3 py-2 text-center text-[13px] font-bold leading-snug text-[#155b43] dark:bg-deskpet-mint/20 dark:text-deskpet-mint">
        {t('examplesActionsHint', { name: petName })}
      </p>
      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <ul
            key={row.map((item) => item.id).join('-')}
            className="m-0 flex list-none flex-wrap justify-center gap-2 p-0"
          >
            {row.map((item) => {
              const selected = item.id === selectedLogicalActionId;
              return (
                <li key={item.id} className="min-w-0 shrink-0">
                  <Button
                    type="button"
                    variant={selected ? 'brutal' : 'brutalOutline'}
                    size="sm"
                    disabled={Boolean(item.disabled)}
                    className={cn(
                      'h-8 rounded-full px-3 text-[12px]',
                      item.disabled && 'opacity-40'
                    )}
                    aria-pressed={selected}
                    onClick={() => {
                      if (item.disabled) return;
                      onSelectLogicalAction(item.id);
                    }}
                  >
                    <span className="truncate">{logicalActionLabel(item)}</span>
                  </Button>
                </li>
              );
            })}
          </ul>
        ))}
      </div>
    </nav>
  );
}
