import { websiteConfig } from '@/config/website';
import { clientEnv } from '@/env/client';

export type DownloadCardId = 'windows' | 'macos';

export type DownloadCard = {
  id: DownloadCardId;
  href: string | null;
};

function readValue(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function publicDownloadHref(key: string | null | undefined): string | null {
  const trimmed = readValue(key)?.replace(/^\/+/, '');
  if (!trimmed) return null;
  const base = readValue(clientEnv.VITE_STORAGE_PUBLIC_URL)?.replace(
    /\/+$/,
    ''
  );
  if (!base) return null;
  return `${base}/${encodeURI(trimmed)}`;
}

export function getDesktopDownloadCards(): DownloadCard[] {
  const { macKey, windowsKey } = websiteConfig.desktopDownload ?? {};

  return [
    { id: 'windows', href: publicDownloadHref(windowsKey) },
    { id: 'macos', href: publicDownloadHref(macKey) },
  ];
}
