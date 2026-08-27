/**
 * Pure helpers for the first playground pet placement before reveal.
 */

import { showcasePetWindowSize } from '@/utils/showcase-pets';

export type PlaygroundPetPlacementSeed = {
  x: number;
  y: number;
};

export type PlaygroundPetPlacementResult = {
  position: PlaygroundPetPlacementSeed;
  size: { width: number; height: number };
  aspect: number;
};

/**
 * Compute the initial pet window size + target top-left from stored layout or
 * a centered/visible-strip default. Clamping is left to the caller.
 */
export function computeInitialPlaygroundPetPlacement(input: {
  bounds: { width: number; height: number };
  visibleWidth: number;
  displayScale: number;
  aspect: number;
  storedPosition?: PlaygroundPetPlacementSeed | null;
}): PlaygroundPetPlacementResult {
  const aspect =
    Number.isFinite(input.aspect) && input.aspect > 0 ? input.aspect : 16 / 9;
  const size = showcasePetWindowSize(input.displayScale, aspect);
  const { bounds, visibleWidth } = input;

  const seed = input.storedPosition ?? {
    x: visibleWidth < 1024 ? 48 : Math.round((bounds.width - size.width) / 2),
    y: Math.round((bounds.height - size.height) / 2),
  };

  // If a stored position sits outside the currently visible strip, pull it
  // back so a wide dog sit_idle clip is not off-screen to the right.
  const maxVisibleX = Math.max(48, Math.round(visibleWidth - size.width - 24));
  const position =
    seed.x > maxVisibleX ? { ...seed, x: Math.max(48, maxVisibleX) } : seed;

  return { position, size, aspect };
}
