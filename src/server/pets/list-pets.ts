import { listUserPets, type ListedUserPet } from './list-user-pets';

export type ListedPet = ListedUserPet;

export async function listPets(userId: string): Promise<ListedUserPet[]> {
  return listUserPets(userId);
}
