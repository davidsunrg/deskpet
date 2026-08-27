import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
  type RefObject,
} from 'react';

export type PanelPosition = { x: number; y: number };

export type PanelAnchor =
  | 'top-left'
  | 'top-right'
  | 'top-after-left'
  | 'beside-pet-left'
  | 'beside-pet-right'
  | 'below-top-left'
  | 'lower-left'
  | 'below-top-right'
  | 'top-center'
  | 'mid-left'
  | 'mid-right'
  | 'bottom-left'
  | 'bottom-right';

const EDGE_MARGIN = 12;
const MIN_VISIBLE = 48;
/** Clear fixed wallpaper switcher on the top-right. */
const TOP_RIGHT_CLEARANCE = 72;
/** Width reserved for the Pets panel when placing Widgets beside it. */
const TOP_ROW_PETS_WIDTH = 224;
/** Gap between Pets and Widgets in the top row. */
const TOP_ROW_GAP = 12;
/** Default centered pet position (matches PlaygroundPetStage). */
const PET_PLACE_X = 0.5;
/** Default centered pet position (matches PlaygroundPetStage). */
const PET_PLACE_Y = 0.5;
/** Approx half-width of the default playground pet for beside-pet anchors. */
const PET_HALF_WIDTH = 180;
/** Gap between Actions panel and the pet. */
const PET_ACTIONS_GAP = 16;
/** Place the second left-column panel under a typical pets list. */
const LEFT_STACK_OFFSET = 280;
/** Place the third left-column panel further down the stack. */
const LEFT_LOWER_OFFSET = 520;

export function clampPanelPosition(
  position: PanelPosition,
  size: { width: number; height: number },
  bounds: { width: number; height: number }
): PanelPosition {
  if (bounds.width <= 0 || bounds.height <= 0) {
    return position;
  }

  const maxX = Math.max(EDGE_MARGIN, bounds.width - MIN_VISIBLE);
  const maxY = Math.max(EDGE_MARGIN, bounds.height - MIN_VISIBLE);
  const minX = Math.min(EDGE_MARGIN, maxX);
  const minY = Math.min(EDGE_MARGIN, maxY);

  // Prefer keeping the panel fully on-screen; fall back to keeping a slice visible.
  const fullMaxX = bounds.width - size.width - EDGE_MARGIN;
  const fullMaxY = bounds.height - size.height - EDGE_MARGIN;

  const xMax = fullMaxX >= minX ? fullMaxX : maxX;
  const yMax = fullMaxY >= minY ? fullMaxY : maxY;

  return {
    x: Math.round(Math.min(xMax, Math.max(minX, position.x))),
    y: Math.round(Math.min(yMax, Math.max(minY, position.y))),
  };
}

export function defaultPanelPosition(
  anchor: PanelAnchor,
  size: { width: number; height: number },
  bounds: { width: number; height: number }
): PanelPosition {
  const m = EDGE_MARGIN;
  const rightX = Math.round(bounds.width - size.width - m);
  const bottomY = Math.round(bounds.height - size.height - m);

  switch (anchor) {
    case 'top-left':
      return { x: m, y: m };
    case 'top-right':
      return { x: rightX, y: m };
    case 'top-after-left': {
      const x = m + TOP_ROW_PETS_WIDTH + TOP_ROW_GAP;
      return {
        x: Math.min(x, Math.max(m, rightX)),
        y: m,
      };
    }
    case 'beside-pet-left': {
      const petCenterX = Math.round(bounds.width * PET_PLACE_X);
      const petCenterY = Math.round(bounds.height * PET_PLACE_Y);
      return {
        x: Math.max(
          m,
          petCenterX - PET_HALF_WIDTH - size.width - PET_ACTIONS_GAP
        ),
        y: Math.min(Math.max(m, petCenterY), Math.max(m, bottomY)),
      };
    }
    case 'beside-pet-right': {
      const petCenterX = Math.round(bounds.width * PET_PLACE_X);
      const petCenterY = Math.round(bounds.height * PET_PLACE_Y);
      return {
        x: Math.min(
          Math.max(m, rightX),
          petCenterX + PET_HALF_WIDTH + PET_ACTIONS_GAP
        ),
        y: Math.min(Math.max(m, petCenterY), Math.max(m, bottomY)),
      };
    }
    case 'below-top-left': {
      const stackY =
        m + Math.min(LEFT_STACK_OFFSET, Math.round(bounds.height * 0.32));
      return {
        x: m,
        y: Math.min(stackY, Math.max(m, bottomY)),
      };
    }
    case 'lower-left': {
      const stackY =
        m + Math.min(LEFT_LOWER_OFFSET, Math.round(bounds.height * 0.55));
      return {
        x: m,
        y: Math.min(stackY, Math.max(m, bottomY)),
      };
    }
    case 'below-top-right':
      return {
        x: rightX,
        y: Math.min(m + TOP_RIGHT_CLEARANCE, Math.max(m, bottomY)),
      };
    case 'top-center':
      return {
        x: Math.round((bounds.width - size.width) / 2),
        y: m,
      };
    case 'mid-left':
      return {
        x: m,
        y: Math.round((bounds.height - size.height) / 2),
      };
    case 'mid-right':
      return {
        x: rightX,
        y: Math.round((bounds.height - size.height) / 2),
      };
    case 'bottom-left':
      return { x: m, y: bottomY };
    case 'bottom-right':
      return { x: rightX, y: bottomY };
  }
}

function readSize(el: HTMLElement | null): { width: number; height: number } {
  if (!el) {
    return { width: 0, height: 0 };
  }
  const rect = el.getBoundingClientRect();
  return { width: rect.width, height: rect.height };
}

function readBounds(el: HTMLElement | null): { width: number; height: number } {
  if (!el) {
    return { width: 0, height: 0 };
  }
  return { width: el.clientWidth, height: el.clientHeight };
}

type UsePanelDragOptions = {
  boundsRef: RefObject<HTMLElement | null>;
  panelRef: RefObject<HTMLElement | null>;
  anchor: PanelAnchor;
  position: PanelPosition | null;
  onPositionChange: (position: PanelPosition) => void;
};

/**
 * Pointer-drag for playground chrome panels. Position is controlled by the
 * parent; null seeds from `anchor` on first layout.
 */
export function usePanelDrag({
  boundsRef,
  panelRef,
  anchor,
  position,
  onPositionChange,
}: UsePanelDragOptions): {
  isDragging: boolean;
  handlePointerDown: (event: PointerEvent<HTMLElement>) => void;
  handlePointerMove: (event: PointerEvent<HTMLElement>) => void;
  finishDrag: (event: PointerEvent<HTMLElement>) => void;
} {
  const [isDragging, setIsDragging] = useState(false);
  const positionRef = useRef<PanelPosition | null>(position);
  const onPositionChangeRef = useRef(onPositionChange);
  const dragRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
  } | null>(null);

  positionRef.current = position;
  onPositionChangeRef.current = onPositionChange;

  const clampCurrent = useCallback(
    (next: PanelPosition) =>
      clampPanelPosition(
        next,
        readSize(panelRef.current),
        readBounds(boundsRef.current)
      ),
    [boundsRef, panelRef]
  );

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const boundsEl = boundsRef.current;

    const seedOrClamp = () => {
      const bounds = readBounds(boundsRef.current);
      const size = readSize(panelRef.current);
      if (bounds.width <= 0 || size.width <= 0) {
        return;
      }

      const current = positionRef.current;
      if (current == null) {
        onPositionChangeRef.current(
          clampPanelPosition(
            defaultPanelPosition(anchor, size, bounds),
            size,
            bounds
          )
        );
        return;
      }

      const clamped = clampPanelPosition(current, size, bounds);
      if (clamped.x !== current.x || clamped.y !== current.y) {
        onPositionChangeRef.current(clamped);
      }
    };

    seedOrClamp();

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => seedOrClamp())
        : null;
    if (panel) {
      resizeObserver?.observe(panel);
    }
    if (boundsEl) {
      resizeObserver?.observe(boundsEl);
    }

    window.addEventListener('resize', seedOrClamp);
    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', seedOrClamp);
    };
  }, [anchor, boundsRef, panelRef, position]);

  const handlePointerDown = useCallback((event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0) {
      return;
    }
    const current = positionRef.current;
    if (current == null) {
      return;
    }
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: current.x,
      startY: current.y,
    };
    setIsDragging(true);
  }, []);

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) {
        return;
      }
      event.preventDefault();
      const next = clampCurrent({
        x: drag.startX + event.clientX - drag.startClientX,
        y: drag.startY + event.clientY - drag.startClientY,
      });
      positionRef.current = next;
      onPositionChangeRef.current(next);
    },
    [clampCurrent]
  );

  const finishDrag = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) {
        return;
      }
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      dragRef.current = null;
      setIsDragging(false);
      const current = positionRef.current;
      if (current != null) {
        onPositionChangeRef.current(clampCurrent(current));
      }
    },
    [clampCurrent]
  );

  return {
    isDragging,
    handlePointerDown,
    handlePointerMove,
    finishDrag,
  };
}
