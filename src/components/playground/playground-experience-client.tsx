import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { PlaygroundExperienceProps } from './playground-experience';
import { PlaygroundLoadingPets } from './playground-loading-pets';
import { PlaygroundWallpaperShell } from './playground-wallpaper-shell';
import { DEFAULT_WALLPAPER_ID, type WallpaperId } from './wallpapers';

const PlaygroundExperienceLazy = lazy(() =>
  import('./playground-experience').then((mod) => ({
    default: mod.PlaygroundExperience,
  }))
);

type PlaygroundPageProps = Omit<
  PlaygroundExperienceProps,
  'wallpaperId' | 'onWallpaperChange' | 'rootRef'
>;

/**
 * Paint the wallpaper shell immediately, then mount pets/chrome on top after
 * the first paint so the background is never blocked by interactive load.
 */
export function PlaygroundExperienceClient(props: PlaygroundPageProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const wallpaperId: WallpaperId = DEFAULT_WALLPAPER_ID;
  const [appReady, setAppReady] = useState(false);

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

  const onWallpaperChange = useCallback((_id: WallpaperId) => {}, []);

  return (
    <PlaygroundWallpaperShell wallpaperId={wallpaperId} rootRef={rootRef}>
      {appReady ? (
        <Suspense fallback={<PlaygroundLoadingPets />}>
          <PlaygroundExperienceLazy
            {...props}
            wallpaperId={wallpaperId}
            onWallpaperChange={onWallpaperChange}
            rootRef={rootRef}
          />
        </Suspense>
      ) : (
        <PlaygroundLoadingPets />
      )}
    </PlaygroundWallpaperShell>
  );
}
