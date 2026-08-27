import { createFileRoute } from '@tanstack/react-router';
import {
  getWebAppManifestBody,
  webAppManifestHeaders,
} from '@/lib/web-app-manifest';

/**
 * Reference parity: production HTML links manifest.webmanifest (absolute URL).
 */
export const Route = createFileRoute('/manifest.webmanifest')({
  server: {
    handlers: {
      GET: async () => {
        return new Response(JSON.stringify(getWebAppManifestBody()), {
          headers: webAppManifestHeaders,
        });
      },
    },
  },
});
