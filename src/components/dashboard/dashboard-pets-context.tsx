'use client';

import { createContext, useContext } from 'react';
import type { ListedUserPet } from '@/server/pets/list-user-pets';

export type DashboardPet = Omit<ListedUserPet, 'createdAt' | 'updatedAt'> & {
  createdAt: string | Date;
  updatedAt: string | Date;
};

const DashboardPetsContext = createContext<DashboardPet[] | null>(null);

type DashboardPetsProviderProps = {
  pets: DashboardPet[];
  children: React.ReactNode;
};

export function DashboardPetsProvider({
  pets,
  children,
}: DashboardPetsProviderProps) {
  return (
    <DashboardPetsContext.Provider value={pets}>
      {children}
    </DashboardPetsContext.Provider>
  );
}

export function useDashboardPets(): DashboardPet[] {
  const pets = useContext(DashboardPetsContext);
  if (!pets) {
    throw new Error(
      'useDashboardPets must be used within DashboardPetsProvider'
    );
  }
  return pets;
}

export function useActiveDashboardPet(): DashboardPet | null {
  const pets = useDashboardPets();
  return pets.find((pet) => pet.enabled) ?? pets[0] ?? null;
}
