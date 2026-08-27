import { PET_EDGE_MARGIN, type PetPosition } from './types';

export function clampPetPosition(
  position: PetPosition,
  element?: HTMLElement | null,
  bounds?: { width: number; height: number },
  fallbackSize?: { width: number; height: number }
): PetPosition {
  if (typeof window === 'undefined' && !bounds) return position;
  const width =
    element?.offsetWidth ||
    element?.getBoundingClientRect().width ||
    fallbackSize?.width ||
    192;
  const height =
    element?.offsetHeight ||
    element?.getBoundingClientRect().height ||
    fallbackSize?.height ||
    230;
  const viewportWidth = bounds?.width ?? window.innerWidth;
  const viewportHeight = bounds?.height ?? window.innerHeight;
  const maxX = Math.max(
    PET_EDGE_MARGIN,
    viewportWidth - width - PET_EDGE_MARGIN
  );
  const maxY = Math.max(
    PET_EDGE_MARGIN,
    viewportHeight - height - PET_EDGE_MARGIN
  );
  return {
    x: Math.min(Math.max(PET_EDGE_MARGIN, Math.round(position.x)), maxX),
    y: Math.min(Math.max(PET_EDGE_MARGIN, Math.round(position.y)), maxY),
  };
}

/**
 * Keep feet anchored when the pet window size changes.
 * Clamp inside the visible stage so size changes never wrap across edges.
 */
export function repositionForPetSizeChange(input: {
  position: PetPosition;
  prevSize: { width: number; height: number };
  nextSize: { width: number; height: number };
  bounds: { width: number; height: number };
  edgeMargin?: number;
}): PetPosition {
  const margin = input.edgeMargin ?? PET_EDGE_MARGIN;
  const { position, prevSize, nextSize, bounds } = input;
  const nextMaxY = Math.max(margin, bounds.height - nextSize.height - margin);
  const nextMaxX = Math.max(margin, bounds.width - nextSize.width - margin);

  const centerX = position.x + prevSize.width / 2;
  const x = Math.min(
    Math.max(margin, Math.round(centerX - nextSize.width / 2)),
    nextMaxX
  );

  const bottomY = position.y + prevSize.height;
  const y = Math.round(bottomY - nextSize.height);

  return {
    x,
    y: Math.min(Math.max(margin, y), nextMaxY),
  };
}
