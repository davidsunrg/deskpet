import { cn } from '@/lib/utils';
import { getWallpaper, type WallpaperId } from './wallpapers';
import type { CSSProperties, ReactNode, Ref } from 'react';

type PlaygroundWallpaperShellProps = {
  wallpaperId: WallpaperId;
  children?: ReactNode;
  /** Optional section ref (pet bounds / panel clamp). */
  rootRef?: Ref<HTMLElement | null>;
  className?: string;
  /** Override section aria-label. */
  ariaLabel?: string;
  /** Shrink-wrap height (embeds on marketing / profile pages). */
  fitContent?: boolean;
  /** Overrides `.playground-root` layout constraints for narrow embeds. */
  playgroundMode?: 'default' | 'profile-play';
};

const STAGE_HEIGHT = '32rem';

/**
 * Playground atmosphere only: root gradients, grid, and glow, on a fixed-height
 * compact stage. Safe to paint before pets / chrome mount.
 */
export function PlaygroundWallpaperShell({
  wallpaperId,
  children,
  rootRef,
  className,
  ariaLabel = 'Pets playground',
  fitContent = false,
  playgroundMode = 'default',
}: PlaygroundWallpaperShellProps) {
  const wallpaper = getWallpaper(wallpaperId);
  const gridOnly = playgroundMode === 'profile-play';

  return (
    <div className={cn('w-full', className)}>
      <section
        ref={rootRef as Ref<HTMLElement>}
        className={cn(
          'playground-root relative isolate w-full overflow-hidden',
          fitContent && 'min-w-0'
        )}
        data-wallpaper-id={wallpaper.id}
        data-playground-mode={
          playgroundMode === 'default' ? undefined : playgroundMode
        }
        style={
          {
            ...wallpaper.vars,
            ...(fitContent
              ? { minHeight: 0, height: 'auto' }
              : { minHeight: STAGE_HEIGHT, height: STAGE_HEIGHT }),
            minWidth: 0,
            color: 'var(--foreground, #102149)',
            background: gridOnly
              ? 'var(--wallpaper-root-base)'
              : `
          radial-gradient(circle at 20% 14%, var(--wallpaper-root-a), transparent 24%),
          radial-gradient(circle at 86% 20%, var(--wallpaper-root-b), transparent 22%),
          var(--wallpaper-root-base)
        `,
          } as CSSProperties
        }
        aria-label={ariaLabel}
      >
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background: gridOnly
              ? `
            linear-gradient(var(--wallpaper-grid-a) 1px, transparent 1px),
            linear-gradient(90deg, var(--wallpaper-grid-b) 1px, transparent 1px),
            var(--wallpaper-shell-base)
          `
              : `
            linear-gradient(var(--wallpaper-grid-a) 1px, transparent 1px),
            linear-gradient(90deg, var(--wallpaper-grid-b) 1px, transparent 1px),
            radial-gradient(circle at 12% 18%, var(--wallpaper-shell-a), transparent 28%),
            radial-gradient(circle at 78% 16%, var(--wallpaper-shell-b), transparent 24%),
            var(--wallpaper-shell-base)
          `,
            backgroundSize: gridOnly
              ? '42px 42px, 42px 42px, auto'
              : '42px 42px, 42px 42px, auto, auto, auto',
          }}
        />
        {gridOnly ? null : (
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={{
              background: `
            radial-gradient(circle at 52% 46%, var(--wallpaper-glow-a), transparent 18%),
            radial-gradient(circle at 54% 48%, var(--wallpaper-glow-b), transparent 34%)
          `,
            }}
          />
        )}
        {children}
      </section>
    </div>
  );
}
