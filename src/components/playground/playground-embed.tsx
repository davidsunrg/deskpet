'use client';

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
  className?: string;
  ariaLabel?: string;
};

/**
 * Compact `/playground` for other pages: same wallpaper, pet stage, and action
 * rail, on a smaller canvas without URL sync or shared layout persistence.
 */
export function PlaygroundEmbed({
  pets,
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
      variant="hero"
      className={className}
      ariaLabel={ariaLabel}
    >
      {appReady ? (
        <Suspense fallback={<PlaygroundLoadingPets />}>
          <PlaygroundExperienceLazy
            presetPets={pets}
            wallpaperId={wallpaperId}
            onWallpaperChange={onWallpaperChange}
            rootRef={rootRef}
            embedded
          />
        </Suspense>
      ) : (
        <PlaygroundLoadingPets />
      )}
    </PlaygroundWallpaperShell>
  );
}
