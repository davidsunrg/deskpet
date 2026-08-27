import { getDb } from '@/db';
import { pet } from '@/db/pet.schema';
import {
  isPetCreationStatus,
  PetCreationStatus,
  type PetCreationStatus as PetCreationStatusType,
} from '@/utils/pets/pet-creation-status';
import { and, eq } from 'drizzle-orm';

export async function updatePetStatusForUser(
  petId: string,
  userId: string,
  status: PetCreationStatus
): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .update(pet)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(and(eq(pet.id, petId), eq(pet.userId, userId)))
    .returning({ id: pet.id });
  return rows.length > 0;
}

export async function markPetPaidFromCheckoutMetadata(
  metadata: Record<string, string | undefined> | null | undefined
): Promise<void> {
  const petId = metadata?.petId;
  const userId = metadata?.userId;
  if (!petId || !userId) return;

  await updatePetStatusForUser(petId, userId, PetCreationStatus.Paid);
}

export function readPetIdFromMetadata(
  metadata: Record<string, unknown> | null | undefined
): string | null {
  const petId = metadata?.petId;
  return typeof petId === 'string' && petId.length > 0 ? petId : null;
}

export function readCheckoutPetStatus(
  value: string | null | undefined
): PetCreationStatusType | null {
  if (!value || !isPetCreationStatus(value)) return null;
  return value;
}
