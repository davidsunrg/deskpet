'use client';

import { PetAvatar } from '@/components/pets/pet-avatar';
import { PetProfileDialog } from '@/components/pets/pet-profile-dialog';
import { Button } from '@/components/ui/button';
import { useActiveDashboardPet } from '@/components/dashboard/dashboard-pets-context';
import {
  getPetSpeciesLabel,
  PetSex,
  parsePetBreed,
  parsePetSpecies,
} from '@/utils/pet-catalog';
import { PencilIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

export function DashboardActivePetOverview() {
  const pet = useActiveDashboardPet();
  const [open, setOpen] = useState(false);

  const defaults = useMemo(() => {
    if (!pet) return null;
    const species = parsePetSpecies(pet.species);
    return {
      name: pet.name,
      species,
      breed: parsePetBreed(pet.breed) ?? pet.breed,
      sex: pet.sex,
      avatar: pet.avatar,
    };
  }, [pet]);

  if (!pet || !defaults) {
    return null;
  }

  const species = parsePetSpecies(pet.species);
  const sexLabel =
    pet.sex === PetSex.Male
      ? 'Male'
      : pet.sex === PetSex.Female
        ? 'Female'
        : 'Unknown';

  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl border-2 border-deskpet-ink/10 bg-deskpet-paper p-6 shadow-[5px_5px_0_0_rgba(55,39,51,0.08)]">
      <div className="flex items-start gap-4">
        <PetAvatar src={pet.avatar} size="lg" className="size-20" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-2xl font-black tracking-tight text-deskpet-ink">
            {pet.displayName}
          </h2>
          <p className="mt-1 text-sm text-deskpet-muted">{pet.breedLabel}</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-deskpet-muted">Species</dt>
              <dd className="font-medium">{getPetSpeciesLabel(species)}</dd>
            </div>
            <div>
              <dt className="text-deskpet-muted">Sex</dt>
              <dd className="font-medium">{sexLabel}</dd>
            </div>
          </dl>
          <Button
            type="button"
            variant="outline"
            className="mt-5"
            onClick={() => setOpen(true)}
          >
            <PencilIcon className="size-4" />
            Edit profile
          </Button>
        </div>
      </div>

      <PetProfileDialog
        mode="edit"
        open={open}
        onOpenChange={setOpen}
        petId={pet.petId}
        defaults={defaults}
      />
    </div>
  );
}
