import { websiteConfig } from '@/config/website';
import { KvCacheProvider } from './provider/kv';
import type { CacheOptions, CacheProvider, CacheProviderName } from './types';
export { CACHE_TTL } from './constants';
export { createCacheKey } from './utils';

let cacheProvider: CacheProvider | null = null;

type ProviderFactory = () => CacheProvider;

const providerRegistry: Record<CacheProviderName, ProviderFactory> = {
  kv: () => new KvCacheProvider(),
};

function createProvider(): CacheProvider | null {
  const config = websiteConfig.cache;
  if (!config?.enable || !config?.provider) return null;

  const factory = providerRegistry[config.provider];
  if (!factory) {
    throw new Error(`Unsupported cache provider: ${config.provider}.`);
  }

  return factory();
}

export function getCacheProvider(): CacheProvider | null {
  if (!cacheProvider) cacheProvider = createProvider();
  return cacheProvider;
}

export async function getOrSetCache<T>({
  key,
  ttlSeconds,
  fetcher,
}: CacheOptions<T>): Promise<T> {
  const provider = getCacheProvider();
  if (!provider) return fetcher();

  try {
    const cached = await provider.getJson<T>(key);
    if (cached !== null) return cached;
  } catch (error) {
    console.warn('[cache] read failed', { key, error });
  }

  const value = await fetcher();

  try {
    await provider.setJson(key, value, ttlSeconds);
  } catch (error) {
    console.warn('[cache] write failed', { key, error });
  }

  return value;
}

export async function deleteCache(key: string): Promise<void> {
  const provider = getCacheProvider();
  if (!provider) return;

  try {
    await provider.delete(key);
  } catch (error) {
    console.warn('[cache] delete failed', { key, error });
  }
}

export async function deleteCacheByPrefix(prefix: string): Promise<void> {
  const provider = getCacheProvider();
  if (!provider) return;

  try {
    await provider.deleteByPrefix(prefix);
  } catch (error) {
    console.warn('[cache] delete by prefix failed', { prefix, error });
  }
}
