import { HeaderSection } from '@/components/layout/header-section';
import { ScrollReveal } from '@/components/shared/scroll-reveal';
import { cn } from '@/lib/utils';
import { KeyboardIcon, MouseIcon, type LucideIcon } from 'lucide-react';
import { useTranslations } from '@/lib/deskpet-i18n';

export const PET_BEHAVIOR_IDS = [
  'walk',
  'nap',
  'cursor',
  'snack',
  'box',
  'window',
  'click',
  'celebrate',
] as const;

type BehaviorIcon = string | LucideIcon;

/** Emoji for most actions; Lucide for mouse/keyboard so they stay dark ink. */
export const PET_BEHAVIOR_ICONS: Record<
  (typeof PET_BEHAVIOR_IDS)[number],
  BehaviorIcon
> = {
  walk: '🚶',
  nap: '😴',
  cursor: MouseIcon,
  snack: '🍪',
  box: '📦',
  window: KeyboardIcon,
  click: '👋',
  celebrate: '🎉',
};

function BehaviorIconMark({ icon }: { icon: BehaviorIcon }) {
  if (typeof icon === 'string') {
    return <>{icon}</>;
  }
  const Icon = icon;
  return (
    <Icon
      aria-hidden
      className="size-6 text-deskpet-ink dark:text-foreground"
      strokeWidth={2.25}
    />
  );
}

type BehaviorsGridProps = {
  testId?: string;
  className?: string;
};

/**
 * Shared 4-column behavior cards used on homepage and pet detail.
 * Matches references/html/pet-detail.html .behavior-grid.
 */
export function BehaviorsGrid({
  testId = 'behaviors-grid',
  className,
}: BehaviorsGridProps) {
  const t = useTranslations('HomePage.behaviors');

  return (
    <div
      className={cn('grid gap-4 sm:grid-cols-2 xl:grid-cols-4', className)}
      data-testid={testId}
    >
      {PET_BEHAVIOR_IDS.map((id, index) => (
        <ScrollReveal
          key={id}
          delay={index * 40}
          className="group -my-1.5 h-full py-1.5"
        >
          <article
            className={cn(
              'flex h-full min-h-[150px] flex-col rounded-[22px] border-2 border-deskpet-ink bg-deskpet-paper p-[18px]',
              'shadow-[4px_5px_0_0_rgba(56,42,53,0.14)] transition-[transform,box-shadow] duration-[160ms] ease-out',
              'group-hover:-translate-y-1 group-hover:shadow-[5px_7px_0_0_rgba(56,42,53,0.16)]',
              'dark:border-border dark:bg-card dark:shadow-[4px_5px_0_0_rgba(0,0,0,0.35)]'
            )}
          >
            <div className="mb-auto grid size-12 place-items-center rounded-[15px] border-2 border-deskpet-ink bg-white text-[23px] leading-none dark:border-border">
              <BehaviorIconMark icon={PET_BEHAVIOR_ICONS[id]} />
            </div>
            <strong className="mt-[18px] text-base text-deskpet-ink dark:text-foreground">
              {t(`items.${id}.title`)}
            </strong>
            <span className="mt-1 text-xs font-medium leading-5 text-muted-foreground">
              {t(`items.${id}.description`)}
            </span>
          </article>
        </ScrollReveal>
      ))}
    </div>
  );
}

export default function BehaviorsSection() {
  const t = useTranslations('HomePage.behaviors');

  return (
    <section
      id="behaviors"
      className="relative isolate overflow-hidden px-4 pt-8 pb-16 md:pt-10 md:pb-20"
      data-testid="behaviors-section"
    >
      <div className="relative mx-auto max-w-7xl px-1 sm:px-2">
        <ScrollReveal>
          <div className="mx-auto mb-[22px] max-w-3xl space-y-3 text-center">
            <HeaderSection
              title={t('title')}
              subtitle={t('subtitle')}
              className="items-center gap-2 text-center"
              titleClassName="text-[13px] font-black tracking-[0.08em] text-[#155b43] dark:text-deskpet-mint"
              subtitleClassName="text-balance text-[clamp(34px,5vw,48px)] font-black leading-[1.05] tracking-[-0.045em] text-deskpet-ink dark:text-foreground"
            />
            <p className="text-base font-medium leading-[1.6] text-muted-foreground">
              {t('description')}
            </p>
          </div>
        </ScrollReveal>

        <BehaviorsGrid />
      </div>
    </section>
  );
}
