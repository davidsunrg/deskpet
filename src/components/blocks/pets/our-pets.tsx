import { HeaderSection } from '@/components/layout/header-section';
import { PetCardGrid } from '@/components/pets/pet-card-grid';
import { ScrollReveal } from '@/components/shared/scroll-reveal';
import { LocaleLink } from '@/lib/i18n/navigation';
import { Routes } from '@/lib/routes';
import type { ShowcasePet } from '@/utils/showcase-pets';
import { useTranslations } from '@/lib/deskpet-i18n';

type OurPetsSectionProps = {
  pets: ShowcasePet[];
};

/**
 * Home “Our Pets” catalog strip — same header pattern as Features / FAQ.
 */
export default function OurPetsSection({ pets }: OurPetsSectionProps) {
  const t = useTranslations('HomePage.pets');

  return (
    <section
      id="our-pets"
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

        <PetCardGrid
          pets={pets}
          testId="home-pet-grid"
          cardTestIdPrefix="home-pet"
          className="mx-auto flex w-full max-w-5xl flex-wrap justify-center gap-4 sm:gap-5 [&>article]:w-[min(100%,17.5rem)]"
        />

        <div className="mt-8 flex justify-center">
          <LocaleLink
            href={Routes.Pets}
            data-testid="home-view-all-pets"
            className="inline-flex h-10 items-center justify-center rounded-full border-2 border-deskpet-ink bg-white px-5 text-sm font-black text-deskpet-ink shadow-[3px_4px_0_0_rgba(58,43,54,0.14)] transition-[box-shadow,background-color] hover:bg-deskpet-mint hover:shadow-[4px_5px_0_0_rgba(58,43,54,0.18)] dark:border-border dark:bg-card dark:text-foreground"
          >
            {t('viewAll')} →
          </LocaleLink>
        </div>
      </div>
    </section>
  );
}
