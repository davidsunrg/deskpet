/**
 * Application database schema (non-auth tables).
 * Add your app tables here; keep Better Auth tables in auth.schema.ts.
 */

import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text, index } from 'drizzle-orm/sqlite-core';
import { user } from './auth.schema';
import type { PaymentScene, PaymentStatus, PaymentType, PlanInterval } from '@/payment/types';

/** 
 * Payment: subscription and one-time 
 */
export const payment = sqliteTable(
  'payment',
  {
    id: text('id').primaryKey(),
    priceId: text('price_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    customerId: text('customer_id').notNull(),
    subscriptionId: text('subscription_id'),
    sessionId: text('session_id'),
    invoiceId: text('invoice_id').unique(),
    type: text('type').notNull().$type<PaymentType>(), // 'subscription' | 'one_time'
    scene: text('scene').$type<PaymentScene>(), // 'subscription' | 'lifetime'
    interval: text('interval').$type<PlanInterval>(), // 'month' | 'year'
    status: text('status').notNull().$type<PaymentStatus>(),
    paid: integer('paid', { mode: 'boolean' }).notNull().default(false),
    periodStart: integer('period_start', { mode: 'timestamp_ms' }),
    periodEnd: integer('period_end', { mode: 'timestamp_ms' }),
    cancelAtPeriodEnd: integer('cancel_at_period_end', { mode: 'boolean' }),
    trialStart: integer('trial_start', { mode: 'timestamp_ms' }),
    trialEnd: integer('trial_end', { mode: 'timestamp_ms' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    index('payment_user_id_idx').on(table.userId),
    index('payment_customer_id_idx').on(table.customerId),
    index('payment_subscription_id_idx').on(table.subscriptionId),
    index('payment_session_id_idx').on(table.sessionId),
    index('payment_invoice_id_idx').on(table.invoiceId),
    index('payment_paid_idx').on(table.paid),
    index('payment_user_paid_idx').on(table.userId, table.paid),
  ]
);

export const paymentRelations = relations(payment, ({ one }) => ({
  user: one(user, { fields: [payment.userId], references: [user.id] }),
}));

/**
 * User files
 * metadata for files uploaded to R2 (path userfiles/{userId}/xxx);
 * filename = stored name on R2 (e.g. uuid.ext);
 * originalName = user's file name.
 */
export const userFiles = sqliteTable(
  'user_files',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    filename: text('filename').notNull(),
    originalName: text('original_name').notNull(),
    contentType: text('content_type').notNull(),
    size: integer('size').notNull(),
    r2Key: text('r2_key').notNull(),
    isPublic: integer('is_public', { mode: 'boolean' }),
    description: text('description'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    index('user_files_user_id_idx').on(table.userId),
    index('user_files_r2_key_idx').on(table.r2Key),
  ]
);

export const userFilesRelations = relations(userFiles, ({ one }) => ({
  user: one(user, {
    fields: [userFiles.userId],
    references: [user.id],
  }),
}));

/**
 * Core pet identity (adopted/custom and optional preset rows).
 */
export const pet = sqliteTable(
  'pet',
  {
    id: text('id').primaryKey(),
    handle: text('handle'),
    name: text('name').notNull(),
    breed: text('breed').notNull(),
    species: text('species').notNull().default('cat'),
    sex: text('sex'),
    avatar: text('avatar'),
    isPreset: integer('is_preset', { mode: 'boolean' }).notNull().default(false),
    creationStatus: text('creation_status')
      .notNull()
      .default('profile_created'),
    creatorRecognition: text('creator_recognition'),
    templateId: text('template_id'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    index('pet_handle_idx').on(table.handle),
    index('pet_breed_idx').on(table.breed),
    index('pet_creation_status_idx').on(table.creationStatus),
    index('pet_template_id_idx').on(table.templateId),
  ]
);

/**
 * User ↔ pet management relationship.
 */
export const userPet = sqliteTable(
  'user_pet',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    petId: text('pet_id')
      .notNull()
      .references(() => pet.id, { onDelete: 'cascade' }),
    enabled: integer('enabled', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    index('user_pet_user_id_idx').on(table.userId),
    index('user_pet_pet_id_idx').on(table.petId),
    index('user_pet_user_pet_uidx').on(table.userId, table.petId),
  ]
);

export const petRelations = relations(pet, ({ many }) => ({
  userPets: many(userPet),
}));

export const userPetRelations = relations(userPet, ({ one }) => ({
  user: one(user, { fields: [userPet.userId], references: [user.id] }),
  pet: one(pet, { fields: [userPet.petId], references: [pet.id] }),
}));