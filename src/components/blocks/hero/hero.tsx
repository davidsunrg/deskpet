'use client';

import { AnimatedGroup } from '@/components/tailark/motion/animated-group';
import { TextEffect } from '@/components/tailark/motion/text-effect';
import { CtaButton } from '@/components/ui/cta-button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { PetCardGrid } from '@/components/pets/pet-card-grid';
import { useTranslations } from '@/lib/deskpet-i18n';
import { LocaleLink } from '@/lib/i18n/navigation';
import { Routes } from '@/lib/routes';
import type { PlaygroundPet } from '@/utils/playground-pet';
import type { ShowcasePet } from '@/utils/showcase-pets';
import { lazy, Suspense, useRef } from 'react';

const HeroFloatingPetLazy = lazy(() =>
  import('./hero-floating-pet').then((mod) => ({
    default: mod.HeroFloatingPet,
  }))
);

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      y: 12,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        bounce: 0,
        duration: 0.8,
      },
    },
  },
};

type HeroSectionProps = {
  pets: ShowcasePet[];
  /** Interactive floating dog on the left. */
  floatingPet?: PlaygroundPet | null;
};

export default function HeroSection({
  pets,
  floatingPet = null,
}: HeroSectionProps) {
  const t = useTranslations('HomePage.hero');
  const tPets = useTranslations('HomePage.pets');
  const heroRef = useRef<HTMLElement | null>(null);

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

      {floatingPet ? (
        <Suspense fallback={null}>
          <HeroFloatingPetLazy
            pet={floatingPet}
            boundsRef={heroRef}
            side="left"
          />
        </Suspense>
      ) : null}

      <div className="relative pt-12 pb-0">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
            <TextEffect
              per="line"
              preset="fade-in-blur"
              speedSegment={0.3}
              as="h1"
              className="mt-8 text-balance text-5xl font-sans font-black lg:mt-8 xl:text-[5rem]"
            >
              {t('title')}
            </TextEffect>

            <TextEffect
              per="line"
              preset="fade-in-blur"
              speedSegment={0.3}
              delay={0.5}
              as="p"
              className="mx-auto mt-8 max-w-4xl text-balance text-lg text-muted-foreground"
            >
              {t('description')}
            </TextEffect>

            <div id="get-started" className="mx-auto mt-10 text-center">
              <AnimatedGroup
                variants={{
                  container: {
                    visible: {
                      transition: {
                        staggerChildren: 0.05,
                        delayChildren: 0.15,
                      },
                    },
                  },
                  ...transitionVariants,
                }}
                className="mt-7 flex flex-row flex-wrap items-center justify-center gap-4"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CtaButton
                      asChild
                      type="button"
                      className="h-11 px-6"
                      data-testid="hero-cta-make-pet"
                    >
                      <LocaleLink href={Routes.DesktopPetCreator}>
                        <span className="text-nowrap">{t('secondary')}</span>
                      </LocaleLink>
                    </CtaButton>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('ctaMakeMyOwnTooltip')}</p>
                  </TooltipContent>
                </Tooltip>
              </AnimatedGroup>
            </div>
          </div>
        </div>

        <div
          id="hero-pets"
          className="relative z-20 mt-10 w-full scroll-mt-24 pb-12"
        >
          <PetCardGrid
            pets={pets}
            testId="home-pet-grid"
            cardTestIdPrefix="home-pet"
            className="mx-auto flex w-full max-w-5xl flex-wrap justify-center gap-4 px-4 sm:gap-5 sm:px-6 [&>article]:w-[min(100%,17.5rem)]"
          />
          <div className="mt-8 flex justify-center">
            <LocaleLink
              href={Routes.Pets}
              data-testid="home-view-all-pets"
              className="inline-flex h-10 items-center justify-center rounded-full border-2 border-deskpet-ink bg-white px-5 text-sm font-black text-deskpet-ink shadow-[3px_4px_0_0_rgba(58,43,54,0.14)] transition-[box-shadow,background-color] hover:bg-deskpet-mint hover:shadow-[4px_5px_0_0_rgba(58,43,54,0.18)] dark:border-border dark:bg-card dark:text-foreground"
            >
              {tPets('viewAll')} →
            </LocaleLink>
          </div>
        </div>
      </div>
    </section>
  );
}
