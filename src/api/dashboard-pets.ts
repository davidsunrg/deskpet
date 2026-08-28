import { authApiMiddleware } from '@/middlewares/auth-middleware';
import { updatePetStatusForUser } from '@/server/pets/update-pet-status';
import { PetCreationStatus } from '@/utils/pets/pet-creation-status';
import { isUuid } from '@/utils/pets/pet-maker-storage-keys';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

export const listUserPetsFn = createServerFn({ method: 'GET' })
  .middleware([authApiMiddleware])
  .handler(async ({ context }) => {
    const { getDb } = await import('@/db');
    const { pet } = await import('@/db/pet.schema');
    const { desc, eq } = await import('drizzle-orm');
    const db = getDb();
    const rows = await db
      .select({
        id: pet.id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        sex: pet.sex,
        avatar: pet.avatar,
        status: pet.status,
        createdAt: pet.createdAt,
      })
      .from(pet)
      .where(eq(pet.userId, context.userId))
      .orderBy(desc(pet.createdAt))
      .limit(20);
    return { pets: rows };
  });

const getUserPetSchema = z.object({
  petId: z.string().refine(isUuid, 'Invalid pet id'),
});

export const getUserPetFn = createServerFn({ method: 'GET' })
  .validator(getUserPetSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { getDb } = await import('@/db');
    const { user } = await import('@/db/auth.schema');
    const { pet } = await import('@/db/pet.schema');
    const { and, eq } = await import('drizzle-orm');
    const db = getDb();
    const [userRow] = await db
      .select({ email: user.email })
      .from(user)
      .where(eq(user.id, context.userId))
      .limit(1);
    const rows = await db
      .select({
        id: pet.id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        sex: pet.sex,
        avatar: pet.avatar,
        photoKeys: pet.photoKeys,
        status: pet.status,
        paidAt: pet.paidAt,
        createdAt: pet.createdAt,
        updatedAt: pet.updatedAt,
      })
      .from(pet)
      .where(and(eq(pet.id, data.petId), eq(pet.userId, context.userId)))
      .limit(1);
    return {
      pet: rows[0] ?? null,
      userEmail: userRow?.email ?? null,
    };
  });

const markPetCheckoutStartedSchema = z.object({
  petId: z.string().refine(isUuid, 'Invalid pet id'),
});

export const markPetCheckoutStartedFn = createServerFn({ method: 'POST' })
  .validator(markPetCheckoutStartedSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const updated = await updatePetStatusForUser(
      data.petId,
      context.userId,
      PetCreationStatus.CheckoutStarted
    );
    if (!updated) throw new Error('Pet not found');
    return { ok: true as const };
  });
