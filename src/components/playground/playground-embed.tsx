'use client';

import { cn } from '@/lib/utils';
import type { PlaygroundPet } from '@/utils/playground-pet';
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { PlaygroundLoadingPets } from './playground-loading-pets';
import { PlaygroundWallpaperShell } from './playground-wallpaper-shell';
import { DEFAULT_WALLPAPER_ID, type WallpaperId } from './wallpapers';

const PlaygroundExperienceLazy = lazy(() =>
  import('./playground-experience').then((mod) => ({
    default: mod.PlaygroundExperience,
  }))
);

type PlaygroundEmbedProps = {
  pets: readonly PlaygroundPet[];
  /** Registry pet key to select first (e.g. from `?pet=`). */
  initialPetKey?: string | null;
  /**
   * Sync the selected pet to `?pet=` and persist layout across visits.
   * Only the `/playground` page owns the URL; embeds on other pages do not.
   */
  syncWithPage?: boolean;
  className?: string;
  ariaLabel?: string;
};

/**
 * Playground card: wallpaper, pet stage, and action rail on a compact canvas.
 * Used by `/playground` and embedded on other pages.
 */
export function PlaygroundEmbed({
  pets,
  initialPetKey = null,
  syncWithPage = false,
  className,
  ariaLabel,
}: PlaygroundEmbedProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const wallpaperId: WallpaperId = DEFAULT_WALLPAPER_ID;
  const [appReady, setAppReady] = useState(false);
  const onWallpaperChange = useCallback((_id: WallpaperId) => {}, []);

  useEffect(() => {
    let innerFrame = 0;
    const outerFrame = window.requestAnimationFrame(() => {
      innerFrame = window.requestAnimationFrame(() => {
        setAppReady(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(outerFrame);
      window.cancelAnimationFrame(innerFrame);
    };
  }, []);

  return (
    <PlaygroundWallpaperShell
      wallpaperId={wallpaperId}
      rootRef={rootRef}
      className={cn(
        'overflow-hidden rounded-[28px] border border-[#f0ded3] shadow-[0_14px_38px_rgba(100,62,47,0.08)]',
        className
      )}
      ariaLabel={ariaLabel}
    >
      {appReady ? (
        <Suspense fallback={<PlaygroundLoadingPets />}>
          <PlaygroundExperienceLazy
            presetPets={pets}
            initialPetKey={initialPetKey}
            wallpaperId={wallpaperId}
            onWallpaperChange={onWallpaperChange}
            rootRef={rootRef}
            embedded={!syncWithPage}
          />
        </Suspense>
      ) : (
        <PlaygroundLoadingPets />
      )}
    </PlaygroundWallpaperShell>
  );
}
