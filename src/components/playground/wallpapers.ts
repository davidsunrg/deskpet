/** Built-in playground wallpaper presets (CSS-variable driven). */

export type WallpaperId = 'sky' | 'mint' | 'sunset' | 'night';

export type WallpaperPreset = {
  id: WallpaperId;
  label: string;
  /** Compact swatch color for the switcher control. */
  swatch: string;
  /** CSS custom properties applied to `.playground-root`. */
  vars: Record<string, string>;
};

export const DEFAULT_WALLPAPER_ID: WallpaperId = 'night';

export const WALLPAPER_STORAGE_KEY = 'petnet.playground.wallpaper';

/** Current default Sky look preserved as the first preset. */
export const WALLPAPERS: WallpaperPreset[] = [
  {
    id: 'sky',
    label: 'Sky',
    swatch: '#cfe5ff',
    vars: {
      '--wallpaper-root-a': 'rgba(219, 234, 254, 0.7)',
      '--wallpaper-root-b': 'rgba(255, 241, 184, 0.44)',
      '--wallpaper-root-base':
        'linear-gradient(160deg, #cfe5ff 0%, #eef7ff 46%, #d8f3ea 100%)',
      '--wallpaper-shell-a': 'rgba(59, 150, 255, 0.28)',
      '--wallpaper-shell-b': 'rgba(52, 211, 153, 0.2)',
      '--wallpaper-shell-base':
        'linear-gradient(160deg, #cfe5ff 0%, #eef7ff 46%, #d8f3ea 100%)',
      '--wallpaper-glow-a': 'rgba(255, 255, 255, 0.8)',
      '--wallpaper-glow-b': 'rgba(23, 109, 242, 0.12)',
      '--wallpaper-grid-a': 'rgba(255, 255, 255, 0.16)',
      '--wallpaper-grid-b': 'rgba(255, 255, 255, 0.14)',
      '--panel-border': 'rgba(126, 161, 210, 0.48)',
    },
  },
  {
    id: 'mint',
    label: 'Mint',
    swatch: '#b8f0de',
    vars: {
      '--wallpaper-root-a': 'rgba(167, 243, 208, 0.65)',
      '--wallpaper-root-b': 'rgba(186, 230, 253, 0.4)',
      '--wallpaper-root-base':
        'linear-gradient(160deg, #c8f7e8 0%, #e8fff6 46%, #d4f0ff 100%)',
      '--wallpaper-shell-a': 'rgba(52, 211, 153, 0.3)',
      '--wallpaper-shell-b': 'rgba(56, 189, 248, 0.22)',
      '--wallpaper-shell-base':
        'linear-gradient(160deg, #c8f7e8 0%, #e8fff6 46%, #d4f0ff 100%)',
      '--wallpaper-glow-a': 'rgba(255, 255, 255, 0.78)',
      '--wallpaper-glow-b': 'rgba(16, 185, 129, 0.14)',
      '--wallpaper-grid-a': 'rgba(255, 255, 255, 0.16)',
      '--wallpaper-grid-b': 'rgba(255, 255, 255, 0.14)',
      '--panel-border': 'rgba(110, 180, 160, 0.48)',
    },
  },
  {
    id: 'sunset',
    label: 'Sunset',
    swatch: '#ffc9a8',
    vars: {
      '--wallpaper-root-a': 'rgba(254, 215, 170, 0.7)',
      '--wallpaper-root-b': 'rgba(251, 182, 206, 0.45)',
      '--wallpaper-root-base':
        'linear-gradient(160deg, #ffd4b8 0%, #ffe8d6 46%, #ffd0e0 100%)',
      '--wallpaper-shell-a': 'rgba(251, 146, 60, 0.28)',
      '--wallpaper-shell-b': 'rgba(244, 114, 182, 0.22)',
      '--wallpaper-shell-base':
        'linear-gradient(160deg, #ffd4b8 0%, #ffe8d6 46%, #ffd0e0 100%)',
      '--wallpaper-glow-a': 'rgba(255, 255, 255, 0.75)',
      '--wallpaper-glow-b': 'rgba(234, 88, 12, 0.14)',
      '--wallpaper-grid-a': 'rgba(255, 255, 255, 0.18)',
      '--wallpaper-grid-b': 'rgba(255, 255, 255, 0.14)',
      '--panel-border': 'rgba(210, 150, 120, 0.5)',
    },
  },
  {
    id: 'night',
    label: 'Night',
    swatch: '#1e3a5f',
    vars: {
      '--wallpaper-root-a': 'rgba(59, 130, 246, 0.28)',
      '--wallpaper-root-b': 'rgba(139, 92, 246, 0.22)',
      '--wallpaper-root-base':
        'linear-gradient(160deg, #0f1c2e 0%, #16233a 46%, #1a2740 100%)',
      '--wallpaper-shell-a': 'rgba(59, 130, 246, 0.22)',
      '--wallpaper-shell-b': 'rgba(167, 139, 250, 0.18)',
      '--wallpaper-shell-base':
        'linear-gradient(160deg, #0f1c2e 0%, #16233a 46%, #1a2740 100%)',
      '--wallpaper-glow-a': 'rgba(148, 163, 184, 0.18)',
      '--wallpaper-glow-b': 'rgba(59, 130, 246, 0.16)',
      '--wallpaper-grid-a': 'rgba(255, 255, 255, 0.06)',
      '--wallpaper-grid-b': 'rgba(255, 255, 255, 0.04)',
      '--panel-border': 'rgba(100, 130, 180, 0.4)',
      '--foreground': '#e2e8f0',
      '--copy': '#94a3b8',
    },
  },
];

export function getWallpaper(id: string | null | undefined): WallpaperPreset {
  return (
    WALLPAPERS.find((wallpaper) => wallpaper.id === id) ??
    WALLPAPERS.find((wallpaper) => wallpaper.id === DEFAULT_WALLPAPER_ID) ??
    WALLPAPERS[0]
  );
}

export function isWallpaperId(value: string): value is WallpaperId {
  return WALLPAPERS.some((wallpaper) => wallpaper.id === value);
}

export function readStoredWallpaperId(): WallpaperId | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(WALLPAPER_STORAGE_KEY);
    if (!raw || !isWallpaperId(raw)) return null;
    return raw;
  } catch {
    return null;
  }
}

export function writeStoredWallpaperId(id: WallpaperId) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(WALLPAPER_STORAGE_KEY, id);
  } catch {
    // Quota / private mode — ignore.
  }
}
