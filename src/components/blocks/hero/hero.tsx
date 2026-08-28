'use client';

import { HeroPetExamples } from '@/components/blocks/hero/hero-pet-examples';
import { CtaButton } from '@/components/ui/cta-button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTranslations } from '@/lib/deskpet-i18n';
import { LocaleLink } from '@/lib/i18n/navigation';
import { Routes } from '@/lib/routes';
import type { PlaygroundPet } from '@/utils/playground-pet';
import { PetSpecies, type ShowcasePet } from '@/utils/showcase-pets';
import { lazy, Suspense, useMemo, useRef } from 'react';
import { usePostHog } from 'posthog-js/react';

const HeroFloatingPetLazy = lazy(() =>
  import('./hero-floating-pet').then((mod) => ({
    default: mod.HeroFloatingPet,
  }))
);

type HeroSectionProps = {
  pets: ShowcasePet[];
  /** Interactive floating companions (dog left / cat right beside photos). */
  floatingPets?: PlaygroundPet[];
};

export default function HeroSection({
  pets,
  floatingPets = [],
}: HeroSectionProps) {
  const t = useTranslations('HomePage.hero');
  const heroRef = useRef<HTMLElement | null>(null);
  const posthog = usePostHog();

  const floatingCompanions = useMemo(() => {
    const dog =
      floatingPets.find((pet) => pet.species === PetSpecies.Dog) ?? null;
    const cat =
      floatingPets.find((pet) => pet.species === PetSpecies.Cat) ?? null;
    return [
      dog ? { pet: dog, side: 'left' as const, photoPetId: dog.key } : null,
      cat ? { pet: cat, side: 'right' as const, photoPetId: cat.key } : null,
    ].filter((item): item is NonNullable<typeof item> => item != null);
  }, [floatingPets]);

  return (
    <section id="hero" ref={heroRef} className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block"
      >
        <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,oklch(0.85_0.04_55/.12)_0,oklch(0.7_0.02_45/.04)_50%,transparent_80%)]" />
        <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,oklch(0.88_0.05_38/.1)_0,oklch(0.6_0.02_38/.03)_80%,transparent_100%)] [translate:5%_-50%]" />
        <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,oklch(0.9_0.03_65/.08)_0,oklch(0.65_0.015_50/.03)_80%,transparent_100%)]" />
      </div>

      {floatingCompanions.map(({ pet, side, photoPetId }) => (
        <Suspense key={pet.key} fallback={null}>
          <HeroFloatingPetLazy
            pet={pet}
            boundsRef={heroRef}
            side={side}
            photoPetId={photoPetId}
          />
        </Suspense>
      ))}

      <div className="relative pt-12 pb-0">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
            <h1 className="mt-8 text-balance text-5xl font-sans font-black lg:mt-8 xl:text-[5rem]">
              {t('title')}
            </h1>

            <p className="mx-auto mt-8 max-w-4xl text-balance text-lg text-muted-foreground">
              {t('description')}
            </p>
          </div>
        </div>

        <div
          id="hero-pets"
          className="relative z-20 mt-10 w-full scroll-mt-24 pb-12"
        >
          <HeroPetExamples pets={pets} />

          <div id="get-started" className="mx-auto mt-8 text-center sm:mt-10">
            <div className="flex flex-row flex-wrap items-center justify-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <CtaButton
                    asChild
                    type="button"
                    className="h-11 px-6"
                    data-testid="hero-cta-make-pet"
                  >
                    <LocaleLink
                      href={Routes.DesktopPetCreator}
                      onClick={() => {
                        posthog?.capture('hero_make_pet_clicked', {
                          section: 'hero',
                        });
                      }}
                    >
                      <span className="text-nowrap">{t('secondary')}</span>
                    </LocaleLink>
                  </CtaButton>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('ctaMakeMyOwnTooltip')}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
