import { WALLPAPERS, type WallpaperId } from './wallpapers';

type WallpaperSwitcherProps = {
  wallpaperId: WallpaperId;
  onWallpaperChange: (id: WallpaperId) => void;
};

/**
 * Fixed top-right wallpaper preset picker for `/playground` (not draggable).
 */
export function WallpaperSwitcher({
  wallpaperId,
  onWallpaperChange,
}: WallpaperSwitcherProps) {
  return (
    <div className="pointer-events-auto absolute top-4 right-4 z-40">
      <div
        className="wallpaper-switcher !static !top-auto !right-auto !z-auto flex-wrap justify-end"
        role="radiogroup"
        aria-label="Desktop wallpaper"
      >
        {WALLPAPERS.map((wallpaper) => {
          const selected = wallpaper.id === wallpaperId;
          return (
            <button
              key={wallpaper.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={wallpaper.label}
              title={wallpaper.label}
              className={`wallpaper-switcher-option${selected ? ' is-selected' : ''}`}
              data-wallpaper-id={wallpaper.id}
              style={{ ['--wallpaper-swatch' as string]: wallpaper.swatch }}
              onClick={() => onWallpaperChange(wallpaper.id)}
            >
              <span className="wallpaper-switcher-swatch" aria-hidden="true" />
              <span className="wallpaper-switcher-label">
                {wallpaper.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
