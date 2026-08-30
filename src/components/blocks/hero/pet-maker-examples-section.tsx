'use client';

import {
  HeroFloatingPet,
  HERO_CONTENT_EDGE_OVERHANG_PX,
} from '@/components/blocks/hero/hero-floating-pet';
import { HeroPetExamples } from '@/components/blocks/hero/hero-pet-examples';
import { cn } from '@/lib/utils';
import type { PlaygroundPet } from '@/utils/playground-pet';
import { PetSpecies, type ShowcasePet } from '@/utils/showcase-pets';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const DASHBOARD_CONTENT_SELECTOR = '[data-slot="sidebar-inset"]';

type PetMakerExamplesSectionProps = {
  pets: ShowcasePet[];
  floatingPets?: PlaygroundPet[];
  className?: string;
  /**
   * Let floating companions roam the dashboard content pane (SidebarInset),
   * with a half-video hang past each side — used on the Final tab.
   */
  contentRoam?: boolean;
};

/**
 * Shared Real examples block: photo cards + floating desk pets with actions.
 * Used on the homepage hero and the custom-pet final pricing step.
 */
export function PetMakerExamplesSection({
  pets,
  floatingPets = [],
  className,
  contentRoam = false,
}: PetMakerExamplesSectionProps) {
  const contentRootRef = useRef<HTMLDivElement | null>(null);
  const localBoundsRef = useRef<HTMLDivElement | null>(null);
  const roamBoundsRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [contentHost, setContentHost] = useState<HTMLElement | null>(null);
  const [roamBoundsEl, setRoamBoundsEl] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!contentRoam || !mounted) {
      setContentHost(null);
      return;
    }
    const host = document.querySelector(DASHBOARD_CONTENT_SELECTOR);
    setContentHost(host instanceof HTMLElement ? host : null);
  }, [contentRoam, mounted]);

  const boundsRef = contentRoam ? roamBoundsRef : localBoundsRef;
  const canRenderFloating =
    !contentRoam || (contentHost != null && roamBoundsEl != null);

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
      {contentRoam && contentHost
        ? createPortal(
            <div
              ref={(node) => {
                roamBoundsRef.current = node;
                setRoamBoundsEl(node);
              }}
              className="pointer-events-none absolute inset-y-0 z-[80] overflow-hidden"
              style={{
                left: -HERO_CONTENT_EDGE_OVERHANG_PX,
                right: -HERO_CONTENT_EDGE_OVERHANG_PX,
              }}
              data-pet-content-bounds=""
              aria-hidden
            />,
            contentHost
          )
        : null}

      <div
        ref={(node) => {
          contentRootRef.current = node;
          if (!contentRoam) {
            localBoundsRef.current = node;
          }
        }}
        className={cn(!contentRoam && 'relative', className)}
      >
        {canRenderFloating
          ? floatingCompanions.map(
              ({ pet, side, photoPetId, displayPetName }) => (
                <HeroFloatingPet
                  key={pet.key}
                  pet={pet}
                  boundsRef={boundsRef}
                  contentRootRef={contentRoam ? contentRootRef : undefined}
                  portalToBounds={contentRoam}
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
