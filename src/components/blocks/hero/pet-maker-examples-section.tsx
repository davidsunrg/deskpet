'use client';

import { HeroFloatingPet } from '@/components/blocks/hero/hero-floating-pet';
import { HeroPetExamples } from '@/components/blocks/hero/hero-pet-examples';
import { cn } from '@/lib/utils';
import type { PlaygroundPet } from '@/utils/playground-pet';
import { PetSpecies, type ShowcasePet } from '@/utils/showcase-pets';
import { useMemo, useRef } from 'react';

type PetMakerExamplesSectionProps = {
  pets: ShowcasePet[];
  floatingPets?: PlaygroundPet[];
  className?: string;
};

/**
 * Shared Real examples block: photo cards + floating desk pets with actions.
 * Used on the homepage hero and the custom-pet final pricing step.
 */
export function PetMakerExamplesSection({
  pets,
  floatingPets = [],
  className,
}: PetMakerExamplesSectionProps) {
  const boundsRef = useRef<HTMLDivElement | null>(null);

  const floatingCompanions = useMemo(() => {
    const dog =
      floatingPets.find((pet) => pet.species === PetSpecies.Dog) ?? null;
    const cat =
      floatingPets.find((pet) => pet.species === PetSpecies.Cat) ?? null;

    const displayNameFor = (petId: string, fallback: string) =>
      pets.find((pet) => pet.id === petId)?.makerExample?.petName ?? fallback;

    return [
      dog
        ? {
            pet: dog,
            side: 'left' as const,
            photoPetId: dog.key,
            displayPetName: displayNameFor(dog.key, dog.name),
          }
        : null,
      cat
        ? {
            pet: cat,
            side: 'right' as const,
            photoPetId: cat.key,
            displayPetName: displayNameFor(cat.key, cat.name),
          }
        : null,
    ].filter((item): item is NonNullable<typeof item> => item != null);
  }, [floatingPets, pets]);

  return (
    <div ref={boundsRef} className={cn('relative', className)}>
      {floatingCompanions.map(({ pet, side, photoPetId, displayPetName }) => (
        <HeroFloatingPet
          key={pet.key}
          pet={pet}
          boundsRef={boundsRef}
          side={side}
          photoPetId={photoPetId}
          displayPetName={displayPetName}
        />
      ))}
      <HeroPetExamples pets={pets} />
    </div>
  );
}
