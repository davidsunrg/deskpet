import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/auth/auth';
import { isRealSignedInUser } from '@/lib/auth/session-identity';
import { getObject } from '@/lib/storage/r2-s3';
import { isPublicFolder } from '@/storage/utils';
import { ConfigurationError, StorageError } from '@/storage/types';
import {
  isPetMakerFinalKey,
  isPetMakerStagingKey,
} from '@/utils/pets/pet-maker-storage-keys';
import { userOwnsStorageKey } from '@/server/pets/create-pet-from-draft';

/**
 * Serves a file by key via the storage provider (same-origin proxy URL).
 * Public folders and pet-maker staging keys are readable without auth.
 * Final pet-maker keys require ownership of a matching pet row.
 */
export const Route = createFileRoute('/api/storage/file')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const key = url.searchParams.get('key');
        if (!key || key.includes('..')) {
          return new Response('Bad Request', { status: 400 });
        }

        try {
          const headers = getRequestHeaders();
          const session = await auth.api.getSession({ headers });
          const userId =
            session?.user && isRealSignedInUser(session.user)
              ? session.user.id
              : undefined;
          const isPublicKey = isPublicFolder(key);
          const isStagingKey = isPetMakerStagingKey(key);
          const isFinalPetMakerKey = isPetMakerFinalKey(key);

          if (isFinalPetMakerKey) {
            if (!userId) {
              return new Response('Forbidden', { status: 403 });
            }
            const ownsKey = await userOwnsStorageKey(userId, key);
            if (!ownsKey) {
              return new Response('Forbidden', { status: 403 });
            }
          } else if (!isPublicKey && !isStagingKey) {
            return new Response('Not Found', { status: 404 });
          }

          const file = await getObject(key);
          const contentType = file.contentType ?? 'application/octet-stream';

          const safeInlineTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/bmp',
            'image/x-icon',
            'image/svg+xml',
            'application/pdf',
          ];
          const isPublicFile = isPublicKey || isStagingKey;
          const responseHeaders: Record<string, string> = {
            'Content-Type': contentType,
            'Cache-Control': isPublicFile
              ? 'public, max-age=31536000, immutable'
              : 'private, no-store',
            'X-Content-Type-Options': 'nosniff',
          };
          if (!safeInlineTypes.includes(contentType)) {
            responseHeaders['Content-Disposition'] = 'attachment';
          }

          return new Response(file.body, { headers: responseHeaders });
        } catch (e) {
          if (e instanceof ConfigurationError) {
            return new Response('Storage not configured', { status: 503 });
          }
          if (e instanceof StorageError) {
            return new Response('Not Found', { status: 404 });
          }
          throw e;
        }
      },
    },
  },
});
