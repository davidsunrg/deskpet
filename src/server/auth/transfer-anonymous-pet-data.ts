import { and, eq } from 'drizzle-orm';
import { getDb } from '@/db';
import {
  petActionUploadedSource,
  petFile,
  petMedia,
  userPet,
} from '@/db/schema';

/**
 * Move guest-owned pet workspace data to the linked real account.
 * Does not transfer payments or credits.
 */
export async function transferAnonymousPetData(input: {
  anonymousUserId: string;
  newUserId: string;
}): Promise<void> {
  const fromUserId = input.anonymousUserId.trim();
  const toUserId = input.newUserId.trim();

  if (!fromUserId || !toUserId || fromUserId === toUserId) {
    return;
  }

  const db = getDb();

  await db.transaction(async (tx) => {
    const existingPets = await tx
      .select({ id: userPet.id })
      .from(userPet)
      .where(eq(userPet.userId, toUserId))
      .limit(1);
    const realUserHasPets = existingPets.length > 0;

    const guestMemberships = await tx
      .select({
        id: userPet.id,
        petId: userPet.petId,
        enabled: userPet.enabled,
      })
      .from(userPet)
      .where(eq(userPet.userId, fromUserId));

    for (const membership of guestMemberships) {
      const conflict = await tx
        .select({ id: userPet.id })
        .from(userPet)
        .where(
          and(eq(userPet.userId, toUserId), eq(userPet.petId, membership.petId))
        )
        .limit(1);

      if (conflict.length > 0) {
        await tx.delete(userPet).where(eq(userPet.id, membership.id));
        continue;
      }

      await tx
        .update(userPet)
        .set({
          userId: toUserId,
          enabled: realUserHasPets ? false : membership.enabled,
          updatedAt: new Date(),
        })
        .where(eq(userPet.id, membership.id));
    }

    await tx
      .update(petFile)
      .set({ createdBy: toUserId })
      .where(eq(petFile.createdBy, fromUserId));
    await tx
      .update(petMedia)
      .set({ createdBy: toUserId })
      .where(eq(petMedia.createdBy, fromUserId));
    await tx
      .update(petActionUploadedSource)
      .set({ createdBy: toUserId })
      .where(eq(petActionUploadedSource.createdBy, fromUserId));
  });
}
