import { getDb } from '@/db';
import { userPet } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function userHasPets(userId: string): Promise<boolean> {
  const db = getDb();
  const [row] = await db
    .select({ id: userPet.id })
    .from(userPet)
    .where(eq(userPet.userId, userId))
    .limit(1);

  return !!row;
}
