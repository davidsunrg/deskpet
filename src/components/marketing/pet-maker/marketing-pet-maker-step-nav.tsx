import { useTranslations } from '@/lib/deskpet-i18n';
import { cn } from '@/lib/utils';
import {
  MARKETING_PET_MAKER_STEPS,
  type MarketingPetMakerStep,
} from '@/utils/pets/marketing-pet-maker-steps';
import { CheckIcon } from 'lucide-react';

type MarketingPetMakerStepNavProps = {
  step: MarketingPetMakerStep;
  currentIndex: number;
  isStepUnlocked: (step: MarketingPetMakerStep) => boolean;
  onStepChange: (step: MarketingPetMakerStep) => void;
};

export function MarketingPetMakerStepNav({
  step,
  currentIndex,
  isStepUnlocked,
  onStepChange,
}: MarketingPetMakerStepNavProps) {
  const t = useTranslations('MarketingPetMaker');

  return (
    <ol className="grid select-none gap-2 rounded-[22px] border-2 border-deskpet-ink/12 bg-white p-2 sm:grid-cols-2 lg:grid-cols-3">
      {MARKETING_PET_MAKER_STEPS.map((item, index) => {
        const active = item === step;
        const unlocked = isStepUnlocked(item);
        const complete = unlocked && index < currentIndex;
        return (
          <li key={item} className="min-w-0">
            <button
              type="button"
              disabled={!unlocked}
              aria-current={active ? 'step' : undefined}
              onClick={() => onStepChange(item)}
              className={cn(
                'flex min-h-11 w-full items-center gap-2 rounded-2xl px-3 text-left text-sm font-bold transition-colors',
                active
                  ? 'bg-deskpet-mint text-deskpet-ink'
                  : !unlocked
                    ? 'cursor-not-allowed text-deskpet-muted opacity-60'
                    : complete
                      ? 'cursor-pointer bg-deskpet-mint-soft text-deskpet-ink hover:bg-deskpet-mint/70'
                      : 'cursor-pointer text-deskpet-ink hover:bg-deskpet-mint-soft'
              )}
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white text-xs text-deskpet-ink">
                {complete ? <CheckIcon className="size-3.5" /> : index + 1}
              </span>
              {t(`steps.${item}`)}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
