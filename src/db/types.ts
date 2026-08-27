import { user } from './auth.schema';
import { payment } from './payment.schema';
import { pet } from './pet.schema';

export type User = typeof user.$inferSelect;
export type Payment = typeof payment.$inferSelect;
export type Pet = typeof pet.$inferSelect;
