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

export function HeroExampleActionButtons({
  petName,
  petId,
  items,
  selectedLogicalActionId,
  onSelectLogicalAction,
}: HeroExampleActionButtonsProps) {
  const t = useTranslations('HomePage.hero');

  return (
    <nav
      aria-label={`${petName} actions`}
      className="mx-3 mb-3 sm:mx-4 sm:mb-4"
      data-testid={`hero-example-actions-${petId}`}
    >
      <p className="m-0 mb-3 rounded-xl bg-deskpet-mint-soft px-3 py-2 text-center text-[13px] font-bold leading-snug text-[#155b43] dark:bg-deskpet-mint/20 dark:text-deskpet-mint">
        {t('examplesActionsHint', { name: petName })}
      </p>
      <ul className="m-0 grid list-none grid-cols-3 gap-2 p-0">
        {items.map((item) => {
          const selected = item.id === selectedLogicalActionId;
          return (
            <li key={item.id} className="min-w-0">
              <Button
                type="button"
                variant={selected ? 'brutal' : 'brutalOutline'}
                size="sm"
                disabled={Boolean(item.disabled)}
                className={cn(
                  'h-8 w-full rounded-full px-2 text-[12px]',
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
    </nav>
  );
}
