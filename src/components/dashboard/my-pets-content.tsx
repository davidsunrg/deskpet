'use client';

import { PetAvatar } from '@/components/pets/pet-avatar';
import { CtaButton } from '@/components/ui/cta-button';
import { formatDate } from '@/lib/formatter';
import { getFileAccessUrl } from '@/lib/urls';
import { LocaleLink } from '@/lib/i18n/navigation';
import { dashboardPetDetailRoute, Routes } from '@/lib/routes';
import {
  getPetBreedLabel,
  getPetSpeciesLabel,
  PetSex,
} from '@/utils/pet-catalog';

export type UserPetListItem = {
  id: string;
  name: string;
  species: string;
  breed: string;
  sex: string | null;
  avatar: string | null;
  createdAt: Date;
};

type MyPetsContentProps = {
  pets: UserPetListItem[];
};

function getSexLabel(sex: string | null): string | null {
  if (sex === PetSex.Male) return 'Male';
  if (sex === PetSex.Female) return 'Female';
  return null;
}

export function MyPetsContent({ pets }: MyPetsContentProps) {
  if (pets.length === 0) {
    return (
      <div className="mx-auto w-full max-w-xl rounded-2xl border-2 border-deskpet-ink/10 bg-deskpet-paper p-8 shadow-[5px_5px_0_0_rgba(55,39,51,0.08)]">
        <h2 className="text-2xl font-black tracking-tight text-deskpet-ink">
          No pets yet
        </h2>
        <p className="mt-3 text-sm leading-6 text-deskpet-muted">
          Create your first desktop pet to see it here. You can customize its
          name, species, breed, and avatar.
        </p>
        <div className="mt-6">
          <CtaButton asChild>
            <LocaleLink href={Routes.DesktopPetCreator}>
              Create a pet
            </LocaleLink>
          </CtaButton>
        </div>
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {pets.map((pet) => {
        const sexLabel = getSexLabel(pet.sex);
        const avatarUrl = pet.avatar ? getFileAccessUrl(pet.avatar) : null;

        return (
          <article
            key={pet.id}
            className="flex flex-col rounded-2xl border-2 border-deskpet-ink/10 bg-deskpet-paper p-4 shadow-[4px_4px_0_0_rgba(55,39,51,0.06)]"
          >
            <LocaleLink
              href={dashboardPetDetailRoute(pet.id)}
              className="flex flex-1 flex-col"
            >
              <div className="flex items-start gap-3">
                <PetAvatar src={avatarUrl} alt={pet.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-lg font-black tracking-tight text-deskpet-ink">
                    {pet.name}
                  </h3>
                  <p className="mt-0.5 text-sm font-semibold text-deskpet-muted">
                    {getPetSpeciesLabel(pet.species)}
                    {' · '}
                    {getPetBreedLabel(pet.breed)}
                  </p>
                  {sexLabel ? (
                    <p className="mt-1 text-sm text-deskpet-muted">
                      {sexLabel}
                    </p>
                  ) : null}
                </div>
              </div>
              <p className="mt-4 text-xs font-medium text-deskpet-muted">
                Created {formatDate(pet.createdAt)}
              </p>
            </LocaleLink>
          </article>
        );
      })}
    </div>
  );
}
