import { getDb } from '@/db';
import { userPet } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

/**
 * Ensure the user manages the pet via `user_pet`. Throws when not linked.
 */
export async function assertUserManagesPet(
  userId: string,
  petId: string
): Promise<void> {
  const db = getDb();
  const [link] = await db
    .select({ id: userPet.id })
    .from(userPet)
    .where(and(eq(userPet.userId, userId), eq(userPet.petId, petId)))
    .limit(1);

  if (!link) {
    throw new Error('Pet not found');
  }
}
