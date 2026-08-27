'use client';

import { LocaleLink } from '@/lib/i18n/navigation';
import { playgroundRoute, Routes } from '@/lib/routes';
import { cn } from '@/utils/cn';
import type { ShowcasePet } from '@/utils/showcase-pets';
import { MoreVerticalIcon } from 'lucide-react';
import { useTranslations } from '@/lib/deskpet-i18n';
import { useLayoutEffect, useRef } from 'react';

export type PetCardSelectOrigin = {
  /** Viewport X of the avatar center. */
  centerX: number;
  /** Viewport Y of the avatar center. */
  centerY: number;
};

type PetCardGridProps = {
  pets: ShowcasePet[];
  selectedPetId?: string;
  onSelectPet?: (petId: string, origin?: PetCardSelectOrigin) => void;
  /**
   * Auto-play a pet when the list mounts or the page of pets changes.
   * - `first`: first catalog item (home /pets default)
   * - `random`: random pick
   */
  autoSelect?: 'first' | 'random';
  testId?: string;
  cardTestIdPrefix?: string;
  className?: string;
};

const cardButtonClassName =
  'inline-flex min-h-11 flex-1 items-center justify-center rounded-full border-2 border-[#3A2B36] bg-deskpet-sun px-6 text-sm font-black text-[#3A2B36] shadow-[3px_4px_0_0_rgba(58,43,54,0.14)] transition-colors hover:bg-deskpet-sun/85 dark:border-border dark:text-deskpet-ink';

/** Fixed media frame so avatars cannot shrink-to-fit then jump larger after load. */
const cardMediaFrameClassName =
  'relative flex aspect-[4/3] w-full shrink-0 cursor-pointer items-center justify-center p-3 sm:p-3.5';

export function PetCardGrid({
  pets,
  selectedPetId,
  onSelectPet,
  autoSelect,
  testId = 'pet-card-grid',
  cardTestIdPrefix = 'pet-card',
  className,
}: PetCardGridProps) {
  const tCta = useTranslations('PetsPage.cta');
  const autoSelectedPetsKeyRef = useRef<string | null>(null);
  const petsKey = pets.map((pet) => pet.id).join(',');
  useLayoutEffect(() => {
    if (!autoSelect || !onSelectPet || pets.length === 0) return;
    if (autoSelectedPetsKeyRef.current === petsKey) return;
    if (selectedPetId && pets.some((pet) => pet.id === selectedPetId)) {
      autoSelectedPetsKeyRef.current = petsKey;
      return;
    }

    const pet =
      autoSelect === 'first'
        ? pets[0]
        : pets[Math.floor(Math.random() * pets.length)];
    if (!pet) return;

    autoSelectedPetsKeyRef.current = petsKey;
    // No avatar origin — parent places via placeAt (e.g. hero left).
    onSelectPet(pet.id);
  }, [autoSelect, onSelectPet, pets, petsKey, selectedPetId]);

  return (
    <div
      className={cn(
        'grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-4',
        className
      )}
      data-testid={testId}
    >
      {pets.map((pet) => {
        const selected = selectedPetId === pet.id;

        return (
          // Padding expands the stable hit area past the hover lift distance.
          <article
            key={pet.id}
            className="group relative w-full min-w-0 -mx-1 -my-2 px-1 py-2"
          >
            <div
              className={cn(
                'relative transition-transform duration-[180ms] ease-out',
                !selected && 'group-hover:-translate-y-1.5'
              )}
            >
              <div
                className={cn(
                  'flex w-full flex-col overflow-hidden rounded-[22px] border-2 bg-deskpet-paper',
                  'transition-[box-shadow,border-color,background-color] duration-[180ms] ease-out',
                  selected
                    ? 'border-[#155b43] bg-deskpet-mint-soft shadow-[7px_9px_0_0_rgba(58,43,54,0.2)]'
                    : 'border-[#3A2B36] shadow-[5px_6px_0_0_rgba(58,43,54,0.16)] group-hover:shadow-[7px_9px_0_0_rgba(58,43,54,0.2)]',
                  'dark:border-border dark:bg-card dark:shadow-[5px_6px_0_0_rgba(0,0,0,0.35)]',
                  'dark:group-hover:shadow-[7px_9px_0_0_rgba(0,0,0,0.4)]'
                )}
                data-cat-card="true"
                data-selected={selected ? 'true' : 'false'}
                data-testid={`${cardTestIdPrefix}-${pet.id}`}
              >
                <LocaleLink
                  href={playgroundRoute(pet.id)}
                  data-pet-card-media="true"
                  className={cardMediaFrameClassName}
                  aria-label={`Play with ${pet.breedLabel}`}
                >
                  <span className="relative block size-full overflow-hidden rounded-xl bg-[#f8f1e2]">
                    <img
                      src={pet.avatar}
                      alt={pet.breedLabel}
                      width={320}
                      height={240}
                      className="absolute inset-0 size-full object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                </LocaleLink>

                <div className="flex flex-col px-3.5 pb-3.5 pt-1 text-center">
                  <h2 className="truncate text-[15px] font-bold leading-tight tracking-tight text-[#3A2B36] dark:text-foreground">
                    <LocaleLink
                      href={playgroundRoute(pet.id)}
                      className="hover:underline focus-visible:underline"
                    >
                      {pet.breedLabel}
                    </LocaleLink>
                  </h2>
                  <div className="mt-2 flex flex-row flex-wrap gap-1.5">
                    <LocaleLink
                      href={playgroundRoute(pet.id)}
                      className={cardButtonClassName}
                      aria-label={`Play ${pet.breedLabel}`}
                    >
                      {tCta('playground')}
                    </LocaleLink>
                    <LocaleLink
                      href={Routes.DesktopPetCreator}
                      className={cardButtonClassName}
                      aria-label={`Create a pet like ${pet.breedLabel}`}
                    >
                      {tCta('bringMeHome')}
                    </LocaleLink>
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  'absolute top-3 right-3 z-10',
                  'pointer-events-none opacity-0 transition-opacity',
                  'group-hover:pointer-events-auto group-hover:opacity-100',
                  'focus-within:pointer-events-auto focus-within:opacity-100',
                  '[@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100'
                )}
              >
                <div className="group/menu relative">
                  <button
                    type="button"
                    className={cn(
                      'inline-flex size-8 items-center justify-center rounded-full border-2 border-[#3A2B36] bg-white text-[#3A2B36]',
                      'shadow-[2px_3px_0_0_rgba(58,43,54,0.14)]',
                      'dark:border-border dark:bg-card dark:text-foreground'
                    )}
                    aria-label={`Open actions for ${pet.breedLabel}`}
                    aria-haspopup="menu"
                  >
                    <MoreVerticalIcon className="size-4" aria-hidden="true" />
                  </button>
                  <div
                    className={cn(
                      'absolute top-full right-0 pt-1 transition-opacity',
                      'pointer-events-none opacity-0',
                      'group-hover/menu:pointer-events-auto group-hover/menu:opacity-100',
                      'group-focus-within/menu:pointer-events-auto group-focus-within/menu:opacity-100'
                    )}
                  >
                    <div
                      role="menu"
                      className="min-w-[8.5rem] rounded-xl border-2 border-[#3A2B36] bg-white py-1 shadow-[3px_4px_0_0_rgba(58,43,54,0.14)] dark:border-border dark:bg-card"
                    >
                      <LocaleLink
                        href={playgroundRoute(pet.id)}
                        role="menuitem"
                        className="block px-3 py-2 text-left text-[12px] font-bold text-[#3A2B36] transition-colors hover:bg-[#3A2B36]/[0.06] focus-visible:bg-[#3A2B36]/[0.06] dark:text-foreground dark:hover:bg-foreground/10 dark:focus-visible:bg-foreground/10"
                      >
                        {tCta('playground')}
                      </LocaleLink>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
