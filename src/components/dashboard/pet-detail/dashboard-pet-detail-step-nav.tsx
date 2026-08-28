import { cn } from '@/lib/utils';
import {
  DASHBOARD_PET_DETAIL_STEPS,
  type DashboardPetDetailStep,
} from '@/utils/pets/dashboard-pet-detail-steps';
import { useTranslations } from '@/lib/deskpet-i18n';

type DashboardPetDetailStepNavProps = {
  step: DashboardPetDetailStep;
  onStepChange: (step: DashboardPetDetailStep) => void;
};

export function DashboardPetDetailStepNav({
  step,
  onStepChange,
}: DashboardPetDetailStepNavProps) {
  const t = useTranslations('DashboardPetDetail');

  return (
    <nav aria-label="Pet detail steps" className="shrink-0 lg:w-52">
      <ol className="m-0 flex list-none flex-col gap-1.5 p-0">
        {DASHBOARD_PET_DETAIL_STEPS.map((item, index) => {
          const active = item === step;
          return (
            <li key={item}>
              <button
                type="button"
                aria-current={active ? 'step' : undefined}
                onClick={() => onStepChange(item)}
                className={cn(
                  'flex min-h-11 w-full items-center gap-2 rounded-2xl px-3 text-left text-sm font-bold transition-colors',
                  active
                    ? 'bg-deskpet-mint text-deskpet-ink'
                    : 'cursor-pointer text-deskpet-ink hover:bg-deskpet-mint-soft'
                )}
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white text-xs text-deskpet-ink">
                  {index + 1}
                </span>
                {t(`steps.${item}`)}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
