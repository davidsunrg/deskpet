import { cn } from '@/lib/utils';
import { getWallpaper, type WallpaperId } from './wallpapers';
import type { CSSProperties, ReactNode, Ref } from 'react';

export type PlaygroundWallpaperShellVariant = 'page' | 'hero';

type PlaygroundWallpaperShellProps = {
  wallpaperId: WallpaperId;
  children?: ReactNode;
  /** Optional section ref (pet bounds / panel clamp). */
  rootRef?: Ref<HTMLElement | null>;
  /**
   * `page` — full playground viewport (default).
   * `hero` — fixed marketing stage height, no 1024px min-width scroll.
   */
  variant?: PlaygroundWallpaperShellVariant;
  className?: string;
  /** Override section aria-label. */
  ariaLabel?: string;
};

const VARIANT_LAYOUT: Record<
  PlaygroundWallpaperShellVariant,
  { wrapClassName: string; sectionClassName: string; minHeight: string }
> = {
  page: {
    wrapClassName: 'w-full overflow-x-auto',
    sectionClassName:
      'playground-root relative isolate w-full min-w-[1024px] overflow-hidden',
    minHeight: 'calc(100svh - 4.5rem)',
  },
  hero: {
    wrapClassName: 'w-full',
    sectionClassName:
      'playground-root relative isolate w-full overflow-hidden border-y-2 border-[#3A2B36]/[0.12] shadow-[0_6px_0_0_rgba(58,43,54,0.12)] dark:border-border dark:shadow-[0_6px_0_0_rgba(0,0,0,0.35)]',
    minHeight: 'min(68vh, 40rem)',
  },
};

/**
 * Playground atmosphere only: root gradients, grid, and glow.
 * Safe to paint before pets / chrome mount.
 */
export function PlaygroundWallpaperShell({
  wallpaperId,
  children,
  rootRef,
  variant = 'page',
  className,
  ariaLabel = 'Pets playground',
}: PlaygroundWallpaperShellProps) {
  const wallpaper = getWallpaper(wallpaperId);
  const layout = VARIANT_LAYOUT[variant];

  return (
    <div className={cn(layout.wrapClassName, className)}>
      <section
        ref={rootRef as Ref<HTMLElement>}
        className={layout.sectionClassName}
        data-wallpaper-id={wallpaper.id}
        data-wallpaper-variant={variant}
        style={
          {
            ...wallpaper.vars,
            minHeight: layout.minHeight,
            height: variant === 'hero' ? layout.minHeight : undefined,
            color: 'var(--foreground, #102149)',
            background: `
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
            background: `
            linear-gradient(var(--wallpaper-grid-a) 1px, transparent 1px),
            linear-gradient(90deg, var(--wallpaper-grid-b) 1px, transparent 1px),
            radial-gradient(circle at 12% 18%, var(--wallpaper-shell-a), transparent 28%),
            radial-gradient(circle at 78% 16%, var(--wallpaper-shell-b), transparent 24%),
            var(--wallpaper-shell-base)
          `,
            backgroundSize: '42px 42px, 42px 42px, auto, auto, auto',
          }}
        />
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
        {children}
      </section>
    </div>
  );
}
