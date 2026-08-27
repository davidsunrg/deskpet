'use client';

import { PetCardGrid } from '@/components/pets/pet-card-grid';
import { useTranslations } from '@/lib/deskpet-i18n';
import { LocaleLink } from '@/lib/i18n/navigation';
import { Routes } from '@/lib/routes';
import type { ShowcasePet } from '@/utils/showcase-pets';

type DesktopPetMakerPetShowcaseProps = {
  pets: ShowcasePet[];
};

/** Preset pet grid for the maker page (no floating preview). */
export function DesktopPetMakerPetShowcase({
  pets,
}: DesktopPetMakerPetShowcaseProps) {
  const t = useTranslations('CreatePetWizard.seoContent.tryPresets');
  const tHero = useTranslations('HomePage.hero');

  return (
    <section
      className="mx-auto mt-14 max-w-7xl border-t-2 border-deskpet-ink/10 pt-10"
      aria-labelledby="desktop-pet-maker-presets-title"
    >
      <div className="max-w-3xl">
        <p className="m-0 text-sm font-black uppercase tracking-[0.16em] text-deskpet-muted">
          {t('eyebrow')}
        </p>
        <h2
          id="desktop-pet-maker-presets-title"
          className="mt-2 m-0 font-sans text-[clamp(1.75rem,4vw,2.5rem)] font-black tracking-tight text-deskpet-ink"
        >
          {t('title')}
        </h2>
        <p className="mt-3 m-0 text-base leading-7 text-deskpet-muted">
          {t('description')}
        </p>
      </div>

      <div className="mt-7 space-y-6">
        <PetCardGrid
          pets={pets}
          testId="maker-pet-grid"
          cardTestIdPrefix="maker-pet"
          className="md:grid-cols-4 lg:grid-cols-4"
        />
        <div className="flex justify-center">
          <LocaleLink
            href={Routes.Pets}
            data-testid="maker-view-all-pets"
            className="inline-flex h-10 items-center justify-center rounded-full border-2 border-deskpet-ink bg-white px-5 text-sm font-black text-deskpet-ink shadow-[3px_4px_0_0_rgba(58,43,54,0.14)] transition-[box-shadow,background-color] hover:bg-deskpet-mint hover:shadow-[4px_5px_0_0_rgba(58,43,54,0.18)] dark:border-border dark:bg-card dark:text-foreground"
          >
            {tHero('viewAll')} →
          </LocaleLink>
        </div>
      </div>
    </section>
  );
}
