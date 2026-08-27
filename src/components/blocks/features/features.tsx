import { FeatureCardVisual } from '@/components/blocks/features/feature-card-visual';
import { HeaderSection } from '@/components/layout/header-section';
import { ScrollReveal } from '@/components/shared/scroll-reveal';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/lib/deskpet-i18n';

const FEATURE_IDS = [
  'item-1',
  'item-2',
  'item-3',
  'item-4',
  'item-5',
  'item-6',
] as const;

export default function FeaturesSection() {
  const t = useTranslations('HomePage.features');

  return (
    <section
      id="features"
      className="relative isolate overflow-hidden px-4 pt-8 pb-16 md:pt-10 md:pb-20"
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

        <div className="grid items-stretch gap-[22px] md:grid-cols-3">
          {FEATURE_IDS.map((id, index) => {
            return (
              <ScrollReveal
                key={id}
                delay={index * 80}
                className="group -my-1.5 h-full py-1.5"
              >
                <article
                  className={cn(
                    'relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-[28px] border-2 border-deskpet-ink bg-deskpet-paper p-5',
                    'shadow-[6px_6px_0_0_rgba(55,39,51,0.11)] transition-[transform,box-shadow] duration-300',
                    'group-hover:-translate-y-1 group-hover:shadow-[8px_8px_0_0_rgba(55,39,51,0.13)]',
                    'dark:border-border dark:bg-card dark:shadow-[6px_6px_0_0_rgba(0,0,0,0.35)]'
                  )}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-[0.045]"
                    style={{
                      backgroundImage:
                        'radial-gradient(var(--deskpet-ink) 0.75px, transparent 1px)',
                      backgroundSize: '22px 22px',
                    }}
                  />

                  <FeatureCardVisual id={id} />

                  <h3 className="relative z-[1] mb-3 shrink-0 text-[23px] font-semibold leading-[1.12] tracking-tight text-deskpet-ink dark:text-foreground">
                    {t(`items.${id}.title`)}
                  </h3>
                  <p className="relative z-[1] flex-1 text-[15px] font-medium leading-[1.68] text-deskpet-muted dark:text-muted-foreground">
                    {t(`items.${id}.description`)}
                  </p>
                </article>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
