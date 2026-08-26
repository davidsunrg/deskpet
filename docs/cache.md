# Cache module

The cache module provides server-side JSON caching through **Cloudflare KV**.
It is intended for low-risk, read-heavy data such as remote provider status
checks, public lists, and expensive-but-cacheable API responses.

KV is eventually consistent, so do not use it as the source of truth for
payments, auth, quotas, or other strongly consistent state.

## Enabling cache

1. **Create the KV namespace** (once per environment):

   ```bash
   pnpm wrangler kv namespace create CACHE
   ```

   Copy the returned `id`.

2. **Configure the namespace in `wrangler.jsonc`**:

   ```jsonc
   "kv_namespaces": [
     {
       "binding": "CACHE",
       "id": "<KV_NAMESPACE_ID>"
     }
   ]
   ```

   The Worker receives the namespace as `env.CACHE`.

3. **Enable cache in website config** (`src/config/website.ts`):

   ```ts
   cache: {
     enable: true,
     provider: 'kv',
   },
   ```

## Directory structure

```txt
src/cache/
├── index.ts           # getOrSetCache, deleteCache, provider registry
├── constants.ts       # key prefix, version, TTL values
├── types.ts           # CacheProvider interface
├── utils.ts           # stable cache key helpers
└── provider/
    └── kv.ts          # Cloudflare KV provider
```

## Core API

- **getOrSetCache({ key, ttlSeconds, fetcher })**
  - Reads JSON from cache. On miss or cache failure, calls `fetcher()` and
    stores the result.

- **deleteCache(key)**
  - Deletes one cache entry. Use this after mutations.

- **deleteCacheByPrefix(prefix)**
  - Deletes all entries under a key prefix. This is useful for list caches.

- **createCacheKey(scope, parts?)**
  - Builds stable keys with an internal prefix and version. You do not need to
    define a separate namespace in `websiteConfig`; key isolation is handled by
    `src/cache/constants.ts`.

## Current consumers

- **Newsletter status** (`src/api/newsletter.ts`)
  - `getNewsletterStatus` caches provider status checks for
    `CACHE_TTL.newsletterStatus`.
  - `subscribeNewsletter` and `unsubscribeNewsletter` delete the corresponding
    status cache key after a successful mutation.

## Notes

- TTL values live in `src/cache/constants.ts`, not `websiteConfig`, so product
  configuration stays focused on provider selection.
- If `CACHE` is not bound, cache operations are skipped and callers fall back
  to the underlying `fetcher()`.
