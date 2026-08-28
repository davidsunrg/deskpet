'use client';

import { HeroExamplePetCard } from '@/components/blocks/hero/hero-example-pet-card';
import { useTranslations } from '@/lib/deskpet-i18n';
import { cn } from '@/lib/utils';
import type { ShowcasePet } from '@/utils/showcase-pets';

type HeroPetExamplesProps = {
  pets: ShowcasePet[];
  className?: string;
};

type HeroExamplePet = ShowcasePet & {
  makerExample: {
    photoUrl: string;
    petName: string;
    uploadedBy: string;
  };
};

function hasMakerExample(pet: ShowcasePet): pet is HeroExamplePet {
  return Boolean(
    pet.makerExample?.photoUrl &&
      pet.makerExample.petName &&
      pet.makerExample.uploadedBy
  );
}

export function HeroPetExamples({ pets, className }: HeroPetExamplesProps) {
  const t = useTranslations('HomePage.hero');
  const examples = pets.filter(hasMakerExample);

  if (examples.length === 0) return null;

  return (
    <div className={cn('mx-auto w-full max-w-5xl px-4 sm:px-6', className)}>
      <div className="mx-auto max-w-2xl text-center">
        <p className="m-0 text-sm font-black uppercase tracking-[0.16em] text-deskpet-muted">
          {t('examplesEyebrow')}
        </p>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 sm:gap-5">
        {examples.map((pet) => (
          <HeroExamplePetCard key={pet.id} pet={pet} />
        ))}
      </div>
    </div>
  );
}
