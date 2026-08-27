import { getDb } from '@/db';
import { userPet } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export async function setActiveUserPet(input: {
  userId: string;
  userPetId: string;
}): Promise<{ userPetId: string }> {
  const db = getDb();
  const now = new Date();

  const [link] = await db
    .select({ id: userPet.id })
    .from(userPet)
    .where(
      and(eq(userPet.userId, input.userId), eq(userPet.id, input.userPetId))
    )
    .limit(1);

  if (!link) {
    throw new Error('Pet not found');
  }

  await db.transaction(async (tx) => {
    await tx
      .update(userPet)
      .set({ enabled: false, updatedAt: now })
      .where(eq(userPet.userId, input.userId));

    await tx
      .update(userPet)
      .set({ enabled: true, updatedAt: now })
      .where(
        and(eq(userPet.userId, input.userId), eq(userPet.id, input.userPetId))
      );
  });

  return { userPetId: link.id };
}
