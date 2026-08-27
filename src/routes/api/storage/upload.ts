import { createFileRoute } from '@tanstack/react-router';
import { env } from 'cloudflare:workers';
import { isProxyUploadKey } from '@/lib/storage/proxy-upload-keys';
import { ConfigurationError, StorageError } from '@/storage/types';

const SAFE_INLINE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

/**
 * Same-origin PUT proxy for local dev when R2 S3 API credentials are absent.
 * Production uses presigned R2 URLs instead.
 */
export const Route = createFileRoute('/api/storage/upload')({
  server: {
    handlers: {
      PUT: async ({ request }) => {
        const url = new URL(request.url);
        const key = url.searchParams.get('key');
        if (!key || !isProxyUploadKey(key)) {
          return new Response('Bad Request', { status: 400 });
        }

        const bucket = env.BUCKET;
        if (!bucket) {
          return new Response('Storage not configured', { status: 503 });
        }

        const contentType =
          request.headers.get('Content-Type')?.trim() || 'application/octet-stream';
        if (
          !SAFE_INLINE_TYPES.includes(
            contentType as (typeof SAFE_INLINE_TYPES)[number]
          )
        ) {
          return new Response('Unsupported Media Type', { status: 415 });
        }

        try {
          const body = await request.arrayBuffer();
          if (body.byteLength === 0) {
            return new Response('Bad Request', { status: 400 });
          }

          await bucket.put(key, body, {
            httpMetadata: { contentType },
          });

          return new Response(null, { status: 204 });
        } catch (error) {
          if (error instanceof ConfigurationError) {
            return new Response('Storage not configured', { status: 503 });
          }
          if (error instanceof StorageError) {
            return new Response(error.message, { status: 500 });
          }
          throw error;
        }
      },
    },
  },
});
