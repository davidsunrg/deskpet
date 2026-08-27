import { websiteConfig } from '@/config/website';

/** Shared PWA manifest payload (reference: manifest.webmanifest). */
export function getWebAppManifestBody() {
  const metadata = websiteConfig.metadata;
  return {
    name: metadata?.name,
    short_name: metadata?.name,
    description: metadata?.description,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#fbfaf7',
    theme_color: '#4edfa6',
    icons: [
      { src: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}

export const webAppManifestHeaders = {
  'Content-Type': 'application/manifest+json',
  'Cache-Control': 'public, max-age=3600',
} as const;
