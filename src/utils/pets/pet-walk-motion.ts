/**
 * Pure helpers for translating the pet window during walk loops.
 * Direction follows cat-walk contracts: walk_left → screen-left (−x).
 * Horizontal travel clamps at the visible edges; callers can request a turn.
 */

export type WalkScreenDirection = 'left' | 'right';

/**
 * Travel speed as a fraction of rendered pet width per second.
 * A full-body walk loop should visibly cross the screen without racing.
 */
export const PET_WALK_SPEED_WIDTHS_PER_SEC = 0.42;

/** Minimum horizontal travel speed for small clips / narrow layouts. */
export const PET_WALK_MIN_SPEED_PX_PER_SEC = 120;

/**
 * Screen travel direction for a raw walk clip, or null when the window
 * should stay put without explicit `metadata.boxMotion`.
 * Default fallback only maps `walk_*_loop`; sit_to_walk and other clips
 * opt in via JSON on `pet_action.metadata`.
 */
export function walkDirectionFromClipKey(
  clipKey: string
): WalkScreenDirection | null {
  switch (clipKey) {
    case 'walk_left_loop':
      return 'left';
    case 'walk_right_loop':
      return 'right';
    default:
      return null;
  }
}

/** Opposite travel direction (used for reverse intents / menus). */
export function oppositeWalkDirection(
  direction: WalkScreenDirection
): WalkScreenDirection {
  return direction === 'left' ? 'right' : 'left';
}

/** Logical action that continues walking in a screen direction. */
export function logicalActionForWalkDirection(
  direction: WalkScreenDirection
): 'walk_left' | 'walk_right' {
  return direction === 'left' ? 'walk_left' : 'walk_right';
}

/**
 * Advance a horizontal position for one frame of walk motion.
 * Returns the unclamped next x (caller clamps and handles edge turns).
 */
export function stepWalkPosition(input: {
  x: number;
  direction: WalkScreenDirection;
  deltaMs: number;
  petWidth: number;
  widthsPerSec?: number;
  minSpeedPxPerSec?: number;
}): number {
  const speed = Math.max(
    input.minSpeedPxPerSec ?? PET_WALK_MIN_SPEED_PX_PER_SEC,
    input.petWidth * (input.widthsPerSec ?? PET_WALK_SPEED_WIDTHS_PER_SEC)
  );
  const delta = (speed * input.deltaMs) / 1000;
  return input.direction === 'left' ? input.x - delta : input.x + delta;
}

export type WalkEdgeHit = WalkScreenDirection;

/**
 * Clamp horizontal walk motion inside the visible bounds and report edge hits.
 */
export function clampWalkPositionAtEdges(input: {
  x: number;
  boundsWidth: number;
  petWidth: number;
  edgeMargin: number;
  direction: WalkScreenDirection;
}): { x: number; edge: WalkEdgeHit | null } {
  const { x, boundsWidth, petWidth } = input;
  if (!(boundsWidth > 0) || !(petWidth > 0)) {
    return { x, edge: null };
  }

  const minX = input.edgeMargin;
  const maxX = Math.max(minX, boundsWidth - petWidth - input.edgeMargin);
  const clampedX = Math.min(Math.max(minX, x), maxX);
  let edge: WalkEdgeHit | null = null;
  if (input.direction === 'left' && x < minX) {
    edge = 'left';
  } else if (input.direction === 'right' && x > maxX) {
    edge = 'right';
  }

  return { x: clampedX, edge };
}

/**
 * Wrap horizontal position so exiting one side re-enters from the opposite side.
 * Uses the pet's horizontal center against the stage width.
 */
export function wrapHorizontalPetX(input: {
  x: number;
  boundsWidth: number;
  petWidth: number;
}): number {
  const { boundsWidth, petWidth } = input;
  if (!(boundsWidth > 0) || !(petWidth > 0)) {
    return Math.round(input.x);
  }
  let center = input.x + petWidth / 2;
  center = ((center % boundsWidth) + boundsWidth) % boundsWidth;
  return Math.round(center - petWidth / 2);
}
