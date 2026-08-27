import {
  DashboardPetsProvider,
  type DashboardPet,
} from '@/components/dashboard/dashboard-pets-context';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { SessionUser } from '@/auth/types';
import {
  ANY_PET_BREED_ID,
  getPetSpeciesLabel,
} from '@/utils/pets/pet-species-config';
import type { ListedUserPet } from '@/server/pets/list-user-pets';
import type { PropsWithChildren } from 'react';

type DashboardShellProps = PropsWithChildren<{
  user: SessionUser;
  pets: ListedUserPet[];
}>;

function sidebarBreedLabel(pet: ListedUserPet): string {
  const breed = pet.breed.trim();
  if (!breed || breed === ANY_PET_BREED_ID || breed === pet.species) {
    return getPetSpeciesLabel(pet.species);
  }
  return pet.breedLabel;
}

export function DashboardShell({ user, pets, children }: DashboardShellProps) {
  const sidebarPets = pets.map((pet) => ({
    id: pet.id,
    name: pet.displayName,
    breedLabel: sidebarBreedLabel(pet),
    avatar: pet.avatar,
    enabled: pet.enabled,
    isPreset: pet.isPreset,
  }));

  const clientPets: DashboardPet[] = pets.map((pet) => ({
    ...pet,
    createdAt: pet.createdAt.toISOString(),
    updatedAt: pet.updatedAt.toISOString(),
  }));

  return (
    <DashboardPetsProvider pets={clientPets}>
      <SidebarProvider
        style={
          {
            '--sidebar-width': '252px',
            '--header-height': 'calc(var(--spacing) * 12)',
          } as React.CSSProperties
        }
      >
        <DashboardSidebar user={user} pets={sidebarPets} />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </DashboardPetsProvider>
  );
}
