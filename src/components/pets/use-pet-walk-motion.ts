import { clampPetPosition } from '@/components/playground/pets/deskpet/position';
import type { PetPosition } from '@/components/playground/pets/deskpet/types';
import {
  actionCanMoveBox,
  isBoxMotionVideoSynced,
  resolveBoxMotion,
  type PetActionMotionConfig,
} from '@/utils/pets/pet-action-motion-config';
import {
  clampWalkPositionAtEdges,
  stepWalkPosition,
  type WalkEdgeHit,
  type WalkScreenDirection,
} from '@/utils/pets/pet-walk-motion';
import {
  useEffect,
  useRef,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react';

type UsePetWalkMotionOptions = {
  /** Current raw clip key from the autoplay sequencer. */
  actionKey: string;
  /** Optional per-action box motion metadata (JSON). */
  motionConfig?: PetActionMotionConfig | null;
  /**
   * Expected media URL for `actionKey`. Motion waits until the visible video
   * src matches so double-buffer handoffs do not slide on the previous clip.
   */
  mediaUrl?: string | null;
  /** Active video element used for startAtSec / endAtSec gating. */
  videoRef?: RefObject<HTMLVideoElement | null>;
  /**
   * When false, skip all translation (startup reveal gate / drag handoff).
   * Defaults to true.
   */
  enabled?: boolean;
  isDragging: boolean;
  getBoundsSize: () => { width: number; height: number };
  petSize: { width: number; height: number };
  companionRef: RefObject<HTMLElement | null>;
  petPositionRef: RefObject<PetPosition>;
  setPetPosition: Dispatch<SetStateAction<PetPosition>>;
  onHitEdge?: (edge: WalkEdgeHit) => void;
};

/**
 * Translate the pet window while an action's box motion is active.
 * Prefer explicit `motionConfig.boxMotion`; otherwise fall back to walk_*_loop.
 * Horizontal motion clamps at edges and asks the controller to turn around.
 */
export function usePetWalkMotion({
  actionKey,
  motionConfig,
  mediaUrl,
  videoRef,
  enabled = true,
  isDragging,
  getBoundsSize,
  petSize,
  companionRef,
  petPositionRef,
  setPetPosition,
  onHitEdge,
}: UsePetWalkMotionOptions) {
  const previousDirectionRef = useRef<WalkScreenDirection | null>(null);
  const lastEdgeHitRef = useRef<{ edge: WalkEdgeHit; at: number } | null>(null);
  const motionConfigRef = useRef(motionConfig);
  motionConfigRef.current = motionConfig;
  const mediaUrlRef = useRef(mediaUrl);
  mediaUrlRef.current = mediaUrl;
  const onHitEdgeRef = useRef(onHitEdge);
  onHitEdgeRef.current = onHitEdge;

  useEffect(() => {
    if (!enabled) {
      previousDirectionRef.current = null;
      return;
    }

    const canEverMove = actionCanMoveBox({
      actionKey,
      motionConfig: motionConfigRef.current,
    });
    const previousDirection = previousDirectionRef.current;

    if (previousDirection && !canEverMove) {
      const current = petPositionRef.current;
      const clamped = clampPetPosition(
        current,
        companionRef.current,
        getBoundsSize(),
        petSize
      );
      if (clamped.x !== current.x || clamped.y !== current.y) {
        const next = { x: clamped.x, y: clamped.y };
        petPositionRef.current = next;
        setPetPosition(next);
      }
      previousDirectionRef.current = null;
      lastEdgeHitRef.current = null;
    }

    if (!canEverMove || isDragging) {
      if (!canEverMove) {
        previousDirectionRef.current = null;
      }
      return;
    }

    let frameId = 0;
    let lastTs = 0;

    const tick = (ts: number) => {
      frameId = window.requestAnimationFrame(tick);
      if (!lastTs) {
        lastTs = ts;
        return;
      }
      const deltaMs = Math.min(48, ts - lastTs);
      lastTs = ts;
      if (deltaMs <= 0) return;

      const video = videoRef?.current ?? null;
      const videoSrc = video?.getAttribute('src') ?? '';
      if (
        !isBoxMotionVideoSynced({
          mediaUrl: mediaUrlRef.current,
          videoSrc,
        })
      ) {
        // Keep showing the previous clip — do not sample its clock for motion.
        return;
      }

      const resolved = resolveBoxMotion({
        actionKey,
        motionConfig: motionConfigRef.current,
        currentTimeSec: video?.currentTime ?? 0,
      });
      previousDirectionRef.current = resolved?.direction ?? null;
      if (!resolved) {
        return;
      }

      const current = petPositionRef.current;
      const bounds = getBoundsSize();
      const steppedX = stepWalkPosition({
        x: current.x,
        direction: resolved.direction,
        deltaMs,
        petWidth: petSize.width,
        ...(resolved.speedWidthsPerSec != null
          ? { widthsPerSec: resolved.speedWidthsPerSec }
          : {}),
        ...(resolved.minSpeedPxPerSec != null
          ? { minSpeedPxPerSec: resolved.minSpeedPxPerSec }
          : {}),
      });
      const edgeResult = clampWalkPositionAtEdges({
        x: steppedX,
        boundsWidth: bounds.width,
        petWidth: petSize.width,
        edgeMargin: 0,
        direction: resolved.direction,
      });
      // Y stays in the stage; X clamps at visible walk edges.
      const clamped = clampPetPosition(
        { x: current.x, y: current.y },
        companionRef.current,
        bounds,
        petSize
      );
      const next = { x: Math.round(edgeResult.x), y: clamped.y };

      petPositionRef.current = next;
      setPetPosition(next);

      if (edgeResult.edge) {
        const now = Date.now();
        const last = lastEdgeHitRef.current;
        if (!last || last.edge !== edgeResult.edge || now - last.at >= 900) {
          lastEdgeHitRef.current = { edge: edgeResult.edge, at: now };
          onHitEdgeRef.current?.(edgeResult.edge);
        }
      }
    };

    frameId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [
    actionKey,
    companionRef,
    enabled,
    getBoundsSize,
    isDragging,
    mediaUrl,
    motionConfig,
    onHitEdge,
    petPositionRef,
    petSize,
    setPetPosition,
    videoRef,
  ]);
}
