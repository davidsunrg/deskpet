import type { getDb } from '@/db';
import { pet } from '@/db/schema';
import {
  appendPetHandleCollisionPostfix,
  normalizePetHandleBase,
  petHandleCandidate,
} from '@/utils/pets/handle';
import { and, eq, ne } from 'drizzle-orm';

type DbClient = ReturnType<typeof getDb>;
type DbTx = Parameters<Parameters<DbClient['transaction']>[0]>[0];

const MAX_HANDLE_ATTEMPTS = 16;

export type CreateUniquePetHandleInput = {
  tx: DbTx;
  name: string;
  excludePetId?: string;
};

export async function createUniquePetHandle({
  tx,
  name,
  excludePetId,
}: CreateUniquePetHandleInput): Promise<string> {
  const base = normalizePetHandleBase(name);

  for (let attempt = 0; attempt < MAX_HANDLE_ATTEMPTS; attempt += 1) {
    const handle = attempt === 0 ? base : appendPetHandleCollisionPostfix(base);
    const taken = await isPetHandleTaken(tx, handle, excludePetId);
    if (!taken) return handle;
  }

  for (let attempt = 0; attempt < MAX_HANDLE_ATTEMPTS; attempt += 1) {
    const handle = petHandleCandidate(name, attempt + 1);
    const taken = await isPetHandleTaken(tx, handle, excludePetId);
    if (!taken) return handle;
  }

  throw new Error('Failed to allocate a unique pet handle');
}

async function isPetHandleTaken(
  tx: DbTx,
  handle: string,
  excludePetId?: string
): Promise<boolean> {
  const [row] = await tx
    .select({ id: pet.id })
    .from(pet)
    .where(
      excludePetId
        ? and(eq(pet.handle, handle), ne(pet.id, excludePetId))
        : eq(pet.handle, handle)
    )
    .limit(1);

  return Boolean(row);
}

export function isPetHandleUniqueViolation(error: unknown): boolean {
  const text = collectErrorText(error).toLowerCase();
  return text.includes('unique') && text.includes('handle');
}

function collectErrorText(error: unknown): string {
  const parts: string[] = [];
  let current: unknown = error;
  for (let depth = 0; depth < 6 && current; depth += 1) {
    if (typeof current === 'object' && current !== null) {
      if (
        'message' in current &&
        typeof (current as { message: unknown }).message === 'string'
      ) {
        parts.push((current as { message: string }).message);
      }
      current =
        'cause' in current ? (current as { cause: unknown }).cause : undefined;
    } else if (typeof current === 'string') {
      parts.push(current);
      break;
    } else {
      break;
    }
  }
  return parts.join(' ');
}
