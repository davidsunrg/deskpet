/**
 * Pet tables (user-created desktop pets).
 */

import { relations } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import {
  DEFAULT_PET_CREATION_STATUS,
  type PetCreationStatus,
} from '@/utils/pets/pet-creation-status';
import { user } from './auth.schema';

/** User-created desktop pet from the pet maker. */
export const pet = sqliteTable(
  'pet',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    species: text('species').notNull(),
    breed: text('breed').notNull(),
    sex: text('sex'),
    avatar: text('avatar'),
    photoKeys: text('photo_keys', { mode: 'json' })
      .$type<string[]>()
      .notNull(),
    status: text('status')
      .notNull()
      .default(DEFAULT_PET_CREATION_STATUS)
      .$type<PetCreationStatus>(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    index('pet_user_id_idx').on(table.userId),
    index('pet_user_status_idx').on(table.userId, table.status),
  ]
);

export const petRelations = relations(pet, ({ one }) => ({
  user: one(user, { fields: [pet.userId], references: [user.id] }),
}));
