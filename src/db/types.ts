import { user } from "./auth.schema";
import { pet, userFiles, userPet, payment } from "./app.schema";

export type User = typeof user.$inferSelect;
export type UserFiles = typeof userFiles.$inferSelect;
export type Payment = typeof payment.$inferSelect;
export type Pet = typeof pet.$inferSelect;
export type UserPet = typeof userPet.$inferSelect;