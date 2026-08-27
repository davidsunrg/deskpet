import { drizzle } from 'drizzle-orm/d1';
import { schema } from './schema';
import { env } from 'cloudflare:workers';

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

/**
 * Create Drizzle instance for Cloudflare D1.
 * https://orm.drizzle.team/docs/connect-cloudflare-d1
 */
export function getDb() {
  if (dbInstance) return dbInstance;
  dbInstance = drizzle(env.DB, { schema });
  return dbInstance;
}
