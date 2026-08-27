import * as authSchema from './auth.schema';
import * as paymentSchema from './payment.schema';
import * as petSchema from './pet.schema';

/**
 * Re-export all tables so drizzle-kit can discover them when reading this file.
 * https://orm.drizzle.team/docs/drizzle-kit-generate
 */
export * from './auth.schema';
export * from './payment.schema';
export * from './pet.schema';

export const schema = {
  ...authSchema,
  ...paymentSchema,
  ...petSchema,
} as const;
