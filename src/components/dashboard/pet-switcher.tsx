'use client';

import { setActivePetAction } from '@/actions/pets';
import { PetAvatar } from '@/components/pets/pet-avatar';
import { PetProfileDialog } from '@/components/pets/pet-profile-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Routes } from '@/lib/routes';
import { assertActionSuccess } from '@/utils/assert-action-success';
import { listPetBreedsForSpecies, PetSpecies } from '@/utils/pet-catalog';
import { ChevronsUpDown, PlusIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

export type SidebarPet = {
  id: string;
  name: string;
  breedLabel: string;
  avatar: string | null;
  enabled?: boolean;
  isPreset?: boolean;
};

function resolveActivePetId(pets: SidebarPet[]): string {
  return pets.find((pet) => pet.enabled)?.id ?? pets[0]?.id ?? '';
}

export function PetSwitcher({ pets }: { pets: SidebarPet[] }) {
  const { isMobile } = useSidebar();
  const [activePetId, setActivePetId] = useState(() =>
    resolveActivePetId(pets)
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [switchBusy, setSwitchBusy] = useState(false);

  const activePet =
    pets.find((pet) => pet.id === activePetId) ?? pets[0] ?? null;

  const createDefaults = useMemo(() => {
    const species = PetSpecies.Cat;
    const breeds = listPetBreedsForSpecies(species);
    return {
      name: '',
      species,
      breed: breeds[0] ?? '',
      sex: null,
      avatar: null,
    };
  }, []);

  const enabledPetId = pets.find((pet) => pet.enabled)?.id ?? '';

  useEffect(() => {
    if (!pets.some((pet) => pet.id === activePetId)) {
      setActivePetId(resolveActivePetId(pets));
    }
  }, [activePetId, pets]);

  useEffect(() => {
    if (enabledPetId) {
      setActivePetId(enabledPetId);
    }
  }, [enabledPetId]);

  const switchPet = async (userPetId: string) => {
    if (switchBusy || userPetId === activePetId) return;

    setSwitchBusy(true);
    setActivePetId(userPetId);
    try {
      const result = await setActivePetAction({ userPetId });
      assertActionSuccess(result, 'Failed to switch pet');
      window.location.assign(
        `${window.location.origin}${window.location.pathname}`
      );
    } catch (error) {
      setActivePetId(resolveActivePetId(pets));
      toast.error(
        error instanceof Error ? error.message : 'Failed to switch pet'
      );
      setSwitchBusy(false);
    }
  };

  const createDialog = (
    <PetProfileDialog
      mode="create"
      open={createOpen}
      onOpenChange={setCreateOpen}
      defaults={createDefaults}
      onSuccess={() => {
        window.location.assign(Routes.DashboardActions);
      }}
    />
  );

  if (!activePet) {
    return (
      <>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              disabled={switchBusy}
              onClick={() => setCreateOpen(true)}
              className="border-2 border-deskpet-ink/12"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <PlusIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Add pet</span>
                <span className="truncate text-xs text-muted-foreground">
                  No pets yet
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {createDialog}
      </>
    );
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="border-2 border-deskpet-ink/12 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <PetAvatar src={activePet.avatar} size="xs" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{activePet.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {activePet.breedLabel}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              align="start"
              side={isMobile ? 'bottom' : 'right'}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Your pets
              </DropdownMenuLabel>
              {pets.map((pet) => (
                <DropdownMenuItem
                  key={pet.id}
                  disabled={switchBusy}
                  onClick={() => {
                    void switchPet(pet.id);
                  }}
                  className="gap-2 p-2"
                >
                  <PetAvatar src={pet.avatar} size="xs" className="size-6" />
                  <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{pet.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {pet.breedLabel}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={switchBusy}
                className="gap-2 p-2"
                onSelect={() => setCreateOpen(true)}
              >
                <div className="flex size-6 items-center justify-center rounded-md border border-dashed">
                  <PlusIcon className="size-3.5 shrink-0" />
                </div>
                <span className="font-medium">Add pet</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      {createDialog}
    </>
  );
}
