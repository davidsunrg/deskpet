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
      <fieldset
        className="wallpaper-switcher !static !top-auto !right-auto !z-auto flex-wrap justify-end border-0 p-0"
        aria-label="Desktop wallpaper"
      >
        {WALLPAPERS.map((wallpaper) => {
          const selected = wallpaper.id === wallpaperId;
          return (
            <label
              key={wallpaper.id}
              className={`wallpaper-switcher-option${selected ? ' is-selected' : ''}`}
              data-wallpaper-id={wallpaper.id}
              style={{ ['--wallpaper-swatch' as string]: wallpaper.swatch }}
              title={wallpaper.label}
            >
              <input
                type="radio"
                name="playground-wallpaper"
                value={wallpaper.id}
                checked={selected}
                onChange={() => onWallpaperChange(wallpaper.id)}
                className="sr-only"
                aria-label={wallpaper.label}
              />
              <span className="wallpaper-switcher-swatch" aria-hidden="true" />
              <span className="wallpaper-switcher-label">
                {wallpaper.label}
              </span>
            </label>
          );
        })}
      </fieldset>
    </div>
  );
}
