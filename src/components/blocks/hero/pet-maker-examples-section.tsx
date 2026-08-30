'use client';

import { HeroFloatingPet } from '@/components/blocks/hero/hero-floating-pet';
import { HeroPetExamples } from '@/components/blocks/hero/hero-pet-examples';
import { cn } from '@/lib/utils';
import type { PlaygroundPet } from '@/utils/playground-pet';
import { PetSpecies, type ShowcasePet } from '@/utils/showcase-pets';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type PetMakerExamplesSectionProps = {
  pets: ShowcasePet[];
  floatingPets?: PlaygroundPet[];
  className?: string;
  /**
   * Let floating companions walk the full viewport (fixed overlay), while photo
   * cards and action buttons stay in this section — used on the Final tab.
   */
  viewportRoam?: boolean;
};

/**
 * Shared Real examples block: photo cards + floating desk pets with actions.
 * Used on the homepage hero and the custom-pet final pricing step.
 */
export function PetMakerExamplesSection({
  pets,
  floatingPets = [],
  className,
  viewportRoam = false,
}: PetMakerExamplesSectionProps) {
  const contentRootRef = useRef<HTMLDivElement | null>(null);
  const localBoundsRef = useRef<HTMLDivElement | null>(null);
  const viewportBoundsRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [viewportBoundsEl, setViewportBoundsEl] =
    useState<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const boundsRef = viewportRoam ? viewportBoundsRef : localBoundsRef;
  const canRenderFloating =
    !viewportRoam || (mounted && viewportBoundsEl != null);

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
    <>
      {viewportRoam && mounted
        ? createPortal(
            <div
              ref={(node) => {
                viewportBoundsRef.current = node;
                setViewportBoundsEl(node);
              }}
              className="pointer-events-none fixed inset-0 z-[80] overflow-hidden"
              data-pet-viewport-bounds=""
              aria-hidden
            />,
            document.body
          )
        : null}

      <div
        ref={(node) => {
          contentRootRef.current = node;
          if (!viewportRoam) {
            localBoundsRef.current = node;
          }
        }}
        className={cn(!viewportRoam && 'relative', className)}
      >
        {canRenderFloating
          ? floatingCompanions.map(
              ({ pet, side, photoPetId, displayPetName }) => (
                <HeroFloatingPet
                  key={pet.key}
                  pet={pet}
                  boundsRef={boundsRef}
                  contentRootRef={viewportRoam ? contentRootRef : undefined}
                  portalToBounds={viewportRoam}
                  side={side}
                  photoPetId={photoPetId}
                  displayPetName={displayPetName}
                />
              )
            )
          : null}
        <HeroPetExamples pets={pets} />
      </div>
    </>
  );
}
