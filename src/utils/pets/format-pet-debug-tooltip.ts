/**
 * Format admin pet-debug tooltip:
 * `walk_right_loop 3.21/4.04 · 480×320 · (640, 280)`
 */

function formatSeconds(value: number): string {
  if (!Number.isFinite(value) || value < 0) {
    return '0.00';
  }
  return value.toFixed(2);
}

function formatPixels(value: number): string {
  if (!Number.isFinite(value) || value < 0) {
    return '0';
  }
  return String(Math.round(value));
}

export type PetDebugTooltipParts = {
  actionKey: string;
  /** CDN / storage URL for the active clip media, when available. */
  mediaUrl: string;
  /** Stable id for this PlaygroundPetStage mount (remount detection). */
  mountId?: string;
  /** Whether the startup reveal gate has opened. */
  startupReady?: boolean;
  currentTime: number;
  duration: number;
  /** CSS / rendered pet window width in px. */
  renderWidth: number;
  /** CSS / rendered pet window height in px. */
  renderHeight: number;
  /** Pet window center X in viewport coordinates. */
  centerX: number;
  /** Pet window center Y in viewport coordinates. */
  centerY: number;
};

/**
 * Build the debug label for the active clip, video clock, render size, and
 * on-screen center. Invalid times fall back to `0.00`; sizes/centers to `0`.
 */
export function formatPetDebugTooltip(parts: PetDebugTooltipParts): string {
  const key = parts.actionKey.trim() || 'unknown';
  const clock = `${formatSeconds(parts.currentTime)}/${formatSeconds(parts.duration)}`;
  const size = `${formatPixels(parts.renderWidth)}×${formatPixels(parts.renderHeight)}`;
  const center = `(${formatPixels(parts.centerX)}, ${formatPixels(parts.centerY)})`;
  return `${key} ${clock} · ${size} · ${center}`;
}
