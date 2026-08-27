import { getDb } from '@/db';
import { pet, userPet } from '@/db/schema';
import { assertUserManagesPet } from '@/server/pets/assert-user-manages-pet';
import {
  isCreatorInProgress,
  PetCreationStatus,
} from '@/utils/pets/pet-creation-status';
import { and, asc, eq } from 'drizzle-orm';

export async function deleteInProgressCreatorPet(input: {
  userId: string;
  petId: string;
}): Promise<{ deleted: true }> {
  await assertUserManagesPet(input.userId, input.petId);

  const db = getDb();
  const [row] = await db
    .select({
      creationStatus: pet.creationStatus,
      enabled: userPet.enabled,
    })
    .from(userPet)
    .innerJoin(pet, eq(userPet.petId, pet.id))
    .where(
      and(eq(userPet.userId, input.userId), eq(userPet.petId, input.petId))
    )
    .limit(1);

  if (!row) {
    throw new Error('Pet not found');
  }
  if (!isCreatorInProgress(row.creationStatus)) {
    throw new Error('Only in-progress creator pets can be deleted this way.');
  }

  const wasEnabled = row.enabled;

  await db.delete(pet).where(eq(pet.id, input.petId));

  if (wasEnabled) {
    const now = new Date();
    const [next] = await db
      .select({ id: userPet.id })
      .from(userPet)
      .innerJoin(pet, eq(userPet.petId, pet.id))
      .where(
        and(
          eq(userPet.userId, input.userId),
          eq(pet.creationStatus, PetCreationStatus.ProfileCreated)
        )
      )
      .orderBy(asc(userPet.createdAt), asc(userPet.id))
      .limit(1);

    if (next) {
      await db
        .update(userPet)
        .set({ enabled: true, updatedAt: now })
        .where(eq(userPet.id, next.id));
    }
  }

  return { deleted: true as const };
}
