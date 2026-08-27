/**
 * Pet workspace transfer is deferred while pet tables are removed.
 * Keeps the auth hook signature stable for a future schema.
 */
export async function transferAnonymousPetData(_input: {
  anonymousUserId: string;
  newUserId: string;
}): Promise<void> {
  return;
}
