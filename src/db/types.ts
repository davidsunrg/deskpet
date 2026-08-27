import { user } from './auth.schema';
import { payment, pet } from './app.schema';

export type User = typeof user.$inferSelect;
export type Payment = typeof payment.$inferSelect;
export type Pet = typeof pet.$inferSelect;
