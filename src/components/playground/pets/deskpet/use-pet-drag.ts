import { wrapHorizontalPetX } from '@/utils/pets/pet-walk-motion';
import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type Dispatch,
  type PointerEvent,
  type RefObject,
  type SetStateAction,
} from 'react';
import { clampPetPosition } from './position';
import { PET_EDGE_MARGIN, type PetPosition } from './types';

type UsePetDragOptions = {
  getBoundsSize: () => { width: number; height: number };
  initialPosition: PetPosition;
  /** Fraction of bounds for first placement (0–1). */
  placeAt?: { x: number; y: number };
  /**
   * When false, skip automatic first placement — the caller sets position
   * (e.g. after reading localStorage).
   */
  autoPlace?: boolean;
  /**
   * Viewport center to place the pet over. When this changes, the pet is
   * re-centered on that point (e.g. a card avatar).
   */
  originCenter?: { x: number; y: number } | null;
  fallbackSize?: { width: number; height: number };
  /**
   * When true, dragging past left/right re-enters from the opposite side.
   */
  horizontalWrap?: boolean;
};

export function usePetDrag({
  getBoundsSize,
  initialPosition,
  placeAt,
  autoPlace = true,
  originCenter = null,
  fallbackSize,
  horizontalWrap = false,
}: UsePetDragOptions): {
  companionRef: RefObject<HTMLDivElement | null>;
  petPosition: PetPosition;
  isDragging: boolean;
  companionStyle: CSSProperties;
  handlePointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  handlePointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  finishDrag: (event: PointerEvent<HTMLDivElement>) => void;
  setPetPosition: Dispatch<SetStateAction<PetPosition>>;
  petPositionRef: RefObject<PetPosition>;
} {
  const [petPosition, setPetPosition] = useState<PetPosition>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [hasPlaced, setHasPlaced] = useState(false);
  const companionRef = useRef<HTMLDivElement | null>(null);
  const petPositionRef = useRef<PetPosition>(initialPosition);
  const lastOriginKeyRef = useRef<string | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
  } | null>(null);

  petPositionRef.current = petPosition;

  const constrainPosition = useCallback(
    (position: PetPosition, bounds = getBoundsSize()) => {
      const clamped = clampPetPosition(
        position,
        companionRef.current,
        bounds,
        fallbackSize
      );
      if (!horizontalWrap) return clamped;
      const petWidth =
        companionRef.current?.offsetWidth ||
        companionRef.current?.getBoundingClientRect().width ||
        fallbackSize?.width ||
        192;
      return {
        x: wrapHorizontalPetX({
          x: position.x,
          boundsWidth: bounds.width,
          petWidth,
        }),
        y: clamped.y,
      };
    },
    [fallbackSize, getBoundsSize, horizontalWrap]
  );

  const originKey = originCenter ? `${originCenter.x},${originCenter.y}` : null;

  useLayoutEffect(() => {
    const bounds = getBoundsSize();
    if (bounds.width <= 0 || bounds.height <= 0) {
      return;
    }

    if (originCenter && originKey !== lastOriginKeyRef.current) {
      lastOriginKeyRef.current = originKey;
      const width = fallbackSize?.width ?? 0;
      const height = fallbackSize?.height ?? 0;
      const next = constrainPosition(
        {
          x: Math.round(originCenter.x - width / 2),
          y: Math.round(originCenter.y - height / 2),
        },
        bounds
      );
      petPositionRef.current = next;
      setPetPosition(next);
      setHasPlaced(true);
      return;
    }

    if (hasPlaced || originCenter || !autoPlace) return;
    const seed = placeAt
      ? {
          x: Math.max(PET_EDGE_MARGIN, Math.round(bounds.width * placeAt.x)),
          y: Math.max(PET_EDGE_MARGIN, Math.round(bounds.height * placeAt.y)),
        }
      : initialPosition;
    const next = constrainPosition(seed, bounds);
    petPositionRef.current = next;
    setPetPosition(next);
    setHasPlaced(true);
  }, [
    autoPlace,
    constrainPosition,
    fallbackSize,
    getBoundsSize,
    hasPlaced,
    initialPosition,
    originCenter,
    originKey,
    placeAt,
  ]);

  useLayoutEffect(() => {
    const handleResize = () => {
      setPetPosition((current) => {
        const next = constrainPosition(current);
        petPositionRef.current = next;
        return next;
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [constrainPosition]);

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      dragRef.current = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startX: petPositionRef.current.x,
        startY: petPositionRef.current.y,
      };
      setIsDragging(true);
    },
    []
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      event.preventDefault();
      const next = constrainPosition({
        x: drag.startX + event.clientX - drag.startClientX,
        y: drag.startY + event.clientY - drag.startClientY,
      });
      petPositionRef.current = next;
      setPetPosition(next);
    },
    [constrainPosition]
  );

  const finishDrag = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      dragRef.current = null;
      setIsDragging(false);
      setPetPosition((current) => {
        const next = constrainPosition(current);
        petPositionRef.current = next;
        return next;
      });
    },
    [constrainPosition]
  );

  const companionStyle = useMemo(
    () =>
      ({
        '--pet-x': `${petPosition.x}px`,
        '--pet-y': `${petPosition.y}px`,
      }) as CSSProperties,
    [petPosition.x, petPosition.y]
  );

  return {
    companionRef,
    petPosition,
    isDragging,
    companionStyle,
    handlePointerDown,
    handlePointerMove,
    finishDrag,
    setPetPosition,
    petPositionRef,
  };
}
