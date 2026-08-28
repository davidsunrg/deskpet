import { getDb } from '@/db';
import { pet } from '@/db/pet.schema';
import {
  isPetCreationStatus,
  PetCreationStatus,
  type PetCreationStatus as PetCreationStatusType,
} from '@/utils/pets/pet-creation-status';
import { and, eq, sql } from 'drizzle-orm';

/** Default delivery window after payment. */
export const PET_DELIVERY_HOURS = 24;
const MS_PER_HOUR = 60 * 60 * 1000;

type UpdatePetStatusOptions = {
  paymentId?: string;
};

export async function updatePetStatusForUser(
  petId: string,
  userId: string,
  status: PetCreationStatus,
  options: UpdatePetStatusOptions = {}
): Promise<boolean> {
  const db = getDb();
  const now = new Date();
  const paymentId = options.paymentId;
  const deliveryAtMs = now.getTime() + PET_DELIVERY_HOURS * MS_PER_HOUR;

  const rows = await db
    .update(pet)
    .set({
      status,
      updatedAt: now,
      ...(status === PetCreationStatus.Paid
        ? {
            // Keep the original delivery deadline across webhook / poll retries.
            deliveryAt: sql`COALESCE(${pet.deliveryAt}, ${deliveryAtMs})`,
            ...(paymentId
              ? {
                  // Keep the first linked payment across webhook / poll retries.
                  paymentId: sql`COALESCE(${pet.paymentId}, ${paymentId})`,
                }
              : {}),
          }
        : {}),
    })
    .where(and(eq(pet.id, petId), eq(pet.userId, userId)))
    .returning({ id: pet.id });

  if (rows.length > 0 && status === PetCreationStatus.Paid) {
    console.log(
      `Marked pet ${petId} as paid` +
        (paymentId ? ` (paymentId=${paymentId})` : '')
    );
  }

  return rows.length > 0;
}

export async function markPetPaidFromCheckoutMetadata(
  metadata: Record<string, string | undefined> | null | undefined,
  options: UpdatePetStatusOptions = {}
): Promise<void> {
  const petId = metadata?.petId;
  const userId = metadata?.userId;
  if (!petId || !userId) return;

  await updatePetStatusForUser(petId, userId, PetCreationStatus.Paid, options);
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
