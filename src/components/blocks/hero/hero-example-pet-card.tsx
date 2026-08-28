'use client';

import { useTranslations } from '@/lib/deskpet-i18n';
import { cn } from '@/lib/utils';
import type { ShowcasePet } from '@/utils/showcase-pets';

type HeroExamplePet = ShowcasePet & {
  makerExample: {
    photoUrl: string;
    petName: string;
    uploadedBy: string;
  };
};

type HeroExamplePetCardProps = {
  pet: HeroExamplePet;
};

export function HeroExamplePetCard({ pet }: HeroExamplePetCardProps) {
  const t = useTranslations('HomePage.hero');

  return (
    <article
      className={cn(
        'overflow-hidden rounded-[22px] border-2 border-[#3A2B36] bg-deskpet-paper',
        'shadow-[5px_6px_0_0_rgba(58,43,54,0.16)]',
        'dark:border-border dark:bg-card dark:shadow-[5px_6px_0_0_rgba(0,0,0,0.35)]'
      )}
      data-testid={`hero-example-${pet.id}`}
    >
      <figure className="m-0">
        <div className="flex justify-center px-4 pt-4 sm:px-6 sm:pt-5">
          <div
            className="relative aspect-square w-full max-w-md overflow-hidden"
            data-hero-photo-anchor={pet.id}
          >
            <img
              src={pet.makerExample.photoUrl}
              alt={`${pet.makerExample.petName} original`}
              width={640}
              height={640}
              className="absolute inset-0 size-full object-cover object-center"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
        <figcaption className="px-3 py-3 text-center text-sm leading-snug text-deskpet-muted sm:px-4 sm:text-[15px]">
          <span className="font-black tracking-tight text-deskpet-ink dark:text-foreground">
            {pet.makerExample.petName}
          </span>
          <span className="mx-1.5 text-deskpet-muted/50" aria-hidden>
            ·
          </span>
          <span>
            {t('examplesUploadedBy', { name: pet.makerExample.uploadedBy })}
          </span>
        </figcaption>
      </figure>

      <div
        data-hero-actions-slot={pet.id}
        className="min-h-0"
        aria-live="polite"
      />
    </article>
  );
}
