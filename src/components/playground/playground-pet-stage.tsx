import {
  useLookVideoScrub,
  type LookPointerSource,
} from '@/components/pets/use-look-video-scrub';
import { usePetWalkMotion } from '@/components/pets/use-pet-walk-motion';
import { PetVideoDoubleBuffer } from '@/components/pets/pet-video-double-buffer';
import { cn } from '@/lib/utils';
import type {
  PlaygroundPet,
  PlaygroundPetAction,
} from '@/utils/playground-pet';
import { showcasePetWindowSize } from '@/utils/showcase-pets';
import type { PetDebugTooltipParts } from '@/utils/pets/format-pet-debug-tooltip';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';
import { computeInitialPlaygroundPetPlacement } from '@/utils/pets/compute-initial-playground-pet-placement';
import type { WalkEdgeHit } from '@/utils/pets/pet-walk-motion';
import {
  clampPetPosition,
  repositionForPetSizeChange,
} from './pets/deskpet/position';
import { usePetDrag } from './pets/deskpet/use-pet-drag';
import {
  readPlaygroundLayout,
  writePlaygroundPetAspect,
  writePlaygroundPetPosition,
} from './playground-layout-storage';

export type PointerSource = LookPointerSource;

export type PlaygroundPetStageHandle = {
  handlePointerX: (normalizedX: number, source: PointerSource) => void;
  endPointer: (source: PointerSource) => void;
  /** Live admin debug stats for the Debug chrome panel. */
  getDebugSnapshot: () => PetDebugTooltipParts | null;
};

/** Walk-gen / landscape sit_idle clips — avoid portrait default size jump. */
const PLAYGROUND_PET_DEFAULT_ASPECT = 16 / 9;
const PLAYGROUND_PET_FALLBACK_POSITION = { x: 80, y: 140 } as const;

type PlaygroundPetStageProps = {
  pet: PlaygroundPet;
  action: PlaygroundPetAction;
  boundsRef: RefObject<HTMLElement | null>;
  /** Optional fixed window size for embedded stages; playground uses dynamic sizing. */
  windowSize?: { width: number; height: number };
  /** Initial horizontal placement when no stored layout is used. */
  initialSide?: 'left' | 'right';
  /** Disable shared playground layout reads/writes for embedded stages. */
  persistLayout?: boolean;
  /** When false, play once and fire onEnded (autoplay sequencer). */
  videoLoop?: boolean;
  /** Bumps to force replay of the same clip during dwell. */
  playbackNonce?: number;
  onVideoEnded?: () => void;
  /** Edge of the visible walk area — request opposite walk direction. */
  onHitWalkEdge?: (edge: WalkEdgeHit) => void;
  /** Fires once when the companion is ready to be shown (placed + first frame). */
  onStartupReady?: () => void;
};

/**
 * Playground pet stage: look-scrub on hover; drag to reposition within the playground.
 * Hidden until first placement + media size are stable so refresh never flashes
 * the fallback seed and then jumps to the target.
 */
export const PlaygroundPetStage = forwardRef<
  PlaygroundPetStageHandle,
  PlaygroundPetStageProps
>(function PlaygroundPetStage(
  {
    pet,
    action,
    boundsRef,
    windowSize,
    initialSide,
    persistLayout = true,
    videoLoop = true,
    playbackNonce = 0,
    onVideoEnded,
    onHitWalkEdge,
    onStartupReady,
  },
  ref
) {
  const supportsLookControl = action.interaction === 'look-scrub';

  const videoRef = useRef<HTMLVideoElement>(null);

  const resetKey = `${pet.key}:${action.key}:${action.mediaUrl}:${playbackNonce}`;

  const [mediaEpoch, setMediaEpoch] = useState(resetKey);
  const [mediaFailed, setMediaFailed] = useState(false);
  // Same default on server + first client paint (no localStorage here — that
  // caused hydration mismatches). Stored aspect is applied in layout restore.
  const [mediaAspect, setMediaAspect] = useState(PLAYGROUND_PET_DEFAULT_ASPECT);
  // Sync clip epoch after every hook — setState during render before later
  // hooks aborts the pass and causes "Rendered more hooks than during the
  // previous render" (Sentry / pet-maker SelectedCatPreview path).
  const clipChanged = mediaEpoch !== resetKey;

  const [hasRestoredPosition, setHasRestoredPosition] = useState(false);
  const [hasResolvedInitialMediaSize, setHasResolvedInitialMediaSize] =
    useState(false);
  const isStartupReady = hasRestoredPosition && hasResolvedInitialMediaSize;
  const startupPetKeyRef = useRef(pet.key);
  const didRestoreRef = useRef(false);
  const hasResolvedMediaSizeRef = useRef(false);
  const onStartupReadyRef = useRef(onStartupReady);
  onStartupReadyRef.current = onStartupReady;
  const didNotifyStartupReadyRef = useRef(false);
  // Assigned after mount only — Date.now/Math.random in render caused hydration
  // mismatches when the stage was SSR'd.
  const [mountId, setMountId] = useState<string | null>(null);
  useEffect(() => {
    setMountId(
      `pet-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
    );
  }, []);

  // Reset the startup gate only when the selected pet changes — not on normal
  // action swaps after the page is already ready.
  useLayoutEffect(() => {
    if (startupPetKeyRef.current === pet.key) {
      return;
    }
    startupPetKeyRef.current = pet.key;
    didRestoreRef.current = false;
    hasResolvedMediaSizeRef.current = false;
    didNotifyStartupReadyRef.current = false;
    setHasRestoredPosition(false);
    setHasResolvedInitialMediaSize(false);
  }, [pet.key]);

  useEffect(() => {
    if (!isStartupReady || didNotifyStartupReadyRef.current) {
      return;
    }
    didNotifyStartupReadyRef.current = true;
    onStartupReadyRef.current?.();
  }, [isStartupReady]);

  const applyMediaAspect = useCallback(
    (nextAspect: number) => {
      if (!(nextAspect > 0) || !Number.isFinite(nextAspect)) {
        return false;
      }
      let changed = true;
      setMediaAspect((current) => {
        if (
          current != null &&
          Math.abs(current - nextAspect) / current < 0.02
        ) {
          changed = false;
          return current;
        }
        if (persistLayout) {
          writePlaygroundPetAspect(nextAspect);
        }
        return nextAspect;
      });
      return changed;
    },
    [persistLayout]
  );

  const markInitialMediaSizeResolved = useCallback(() => {
    if (hasResolvedMediaSizeRef.current) {
      return;
    }
    hasResolvedMediaSizeRef.current = true;
    setHasResolvedInitialMediaSize(true);
  }, []);

  const { handlePointerX, endPointer } = useLookVideoScrub({
    videoRef,
    enabled: supportsLookControl,
    resetKey,
    loop: videoLoop,
    onReady: (video) => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        applyMediaAspect(video.videoWidth / video.videoHeight);
      }
    },
  });

  const handlePointerXRef = useRef(handlePointerX);
  const endPointerRef = useRef(endPointer);
  handlePointerXRef.current = handlePointerX;
  endPointerRef.current = endPointer;

  useImperativeHandle(ref, () => ({
    handlePointerX: (normalizedX, source) =>
      handlePointerXRef.current(normalizedX, source),
    endPointer: (source) => endPointerRef.current(source),
    getDebugSnapshot: () => debugSnapshotRef.current?.() ?? null,
  }));

  // Idle and sit share height but different widths. Anchor both windows to the
  // first look-scrub action's scale so object-contain keeps the cat size stable.
  const lookScrubScale =
    pet.actions.find((item) => item.interaction === 'look-scrub')
      ?.displayScale ?? action.displayScale;
  const aspect = mediaAspect > 0 ? mediaAspect : PLAYGROUND_PET_DEFAULT_ASPECT;
  const size = windowSize ?? showcasePetWindowSize(lookScrubScale, aspect);

  const debugSnapshotRef = useRef<(() => PetDebugTooltipParts | null) | null>(
    null
  );

  const getBoundsSize = useCallback(() => {
    const el = boundsRef.current;
    if (!el) {
      return { width: 0, height: 0 };
    }
    return { width: el.clientWidth, height: el.clientHeight };
  }, [boundsRef]);

  /** Visible width of the scrollport (parent of the min-width canvas). */
  const getVisibleWidth = useCallback(() => {
    const el = boundsRef.current;
    const parent = el?.parentElement;
    if (parent && parent.clientWidth > 0) {
      return parent.clientWidth;
    }
    if (typeof window !== 'undefined') {
      return window.innerWidth;
    }
    return getBoundsSize().width;
  }, [boundsRef, getBoundsSize]);

  const {
    companionRef,
    isDragging,
    companionStyle,
    handlePointerDown,
    handlePointerMove,
    finishDrag,
    setPetPosition,
    petPositionRef,
  } = usePetDrag({
    getBoundsSize,
    // Fixed SSR/client default — stored coords are applied in layout restore.
    initialPosition: PLAYGROUND_PET_FALLBACK_POSITION,
    autoPlace: false,
    fallbackSize: size,
  });

  debugSnapshotRef.current = () => {
    const video = videoRef.current;
    const position = petPositionRef.current;
    return {
      actionKey: action.key,
      mediaUrl: action.mediaUrl,
      mountId: mountId ?? undefined,
      startupReady: isStartupReady,
      currentTime: video?.currentTime ?? 0,
      duration: video?.duration ?? 0,
      renderWidth: size.width,
      renderHeight: size.height,
      centerX: position.x + size.width / 2,
      centerY: position.y + size.height / 2,
    };
  };

  /** Keep walk motion inside the currently visible scroll strip. */
  const getWalkBoundsSize = useCallback(() => {
    const bounds = getBoundsSize();
    return {
      width: getVisibleWidth(),
      height: bounds.height,
    };
  }, [getBoundsSize, getVisibleWidth]);

  const handleHitWalkEdge = useCallback(
    (edge: WalkEdgeHit) => {
      onHitWalkEdge?.(edge);
    },
    [onHitWalkEdge]
  );

  usePetWalkMotion({
    actionKey: action.key,
    motionConfig: action.motionConfig,
    mediaUrl: action.mediaUrl,
    videoRef,
    enabled: isStartupReady,
    isDragging,
    getBoundsSize: getWalkBoundsSize,
    petSize: size,
    companionRef,
    petPositionRef,
    setPetPosition,
    onHitEdge: handleHitWalkEdge,
  });

  const restorePetPosition = useCallback(
    (aspectOverride?: number) => {
      const bounds = getBoundsSize();
      if (bounds.width <= 0 || bounds.height <= 0) {
        return false;
      }

      const layout = persistLayout ? readPlaygroundLayout() : null;
      const aspectNow =
        aspectOverride != null && aspectOverride > 0
          ? aspectOverride
          : layout?.petAspect && layout.petAspect > 0
            ? layout.petAspect
            : mediaAspect > 0
              ? mediaAspect
              : PLAYGROUND_PET_DEFAULT_ASPECT;

      if (aspectOverride == null && layout?.petAspect && layout.petAspect > 0) {
        // Prefer stored aspect while still hidden; reveal waits for video
        // (or avatar fallback) so native clip size can recompute placement.
        setMediaAspect(layout.petAspect);
      }

      const placement = computeInitialPlaygroundPetPlacement({
        bounds,
        visibleWidth: getVisibleWidth(),
        displayScale: lookScrubScale,
        aspect: aspectNow,
        storedPosition: layout?.petPosition ?? null,
      });
      const position = initialSide
        ? {
            x:
              initialSide === 'right'
                ? Math.max(24, bounds.width - size.width - 24)
                : 24,
            y: Math.max(80, Math.round((bounds.height - size.height) / 2)),
          }
        : placement.position;

      const next = clampPetPosition(
        position,
        companionRef.current,
        bounds,
        size
      );
      petPositionRef.current = next;
      setPetPosition(next);
      setHasRestoredPosition(true);
      return true;
    },
    [
      companionRef,
      getBoundsSize,
      getVisibleWidth,
      initialSide,
      lookScrubScale,
      mediaAspect,
      petPositionRef,
      persistLayout,
      setPetPosition,
      size,
    ]
  );

  useLayoutEffect(() => {
    if (didRestoreRef.current) {
      return;
    }
    if (restorePetPosition()) {
      didRestoreRef.current = true;
    }
  }, [restorePetPosition]);

  // Bounds can be 0 on the first paint (or after wallpaper chrome mounts).
  // Retry placement when the canvas actually gets a size — opening DevTools
  // used to "fix" this by triggering a resize.
  useEffect(() => {
    const el = boundsRef.current;
    if (!el || typeof ResizeObserver === 'undefined') {
      return;
    }
    const observer = new ResizeObserver(() => {
      if (didRestoreRef.current) {
        return;
      }
      if (restorePetPosition()) {
        didRestoreRef.current = true;
      }
    });
    observer.observe(el);
    const parent = el.parentElement;
    if (parent) {
      observer.observe(parent);
    }
    return () => observer.disconnect();
  }, [boundsRef, restorePetPosition]);

  // Keep feet anchored when measured aspect updates window size — only after
  // startup reveal, so the first aspect correction is applied while still hidden.
  const prevSizeRef = useRef(size);
  useLayoutEffect(() => {
    const prev = prevSizeRef.current;
    prevSizeRef.current = size;
    if (!isStartupReady) {
      return;
    }
    if (prev.width === size.width && prev.height === size.height) {
      return;
    }

    setPetPosition((current) => {
      const next = repositionForPetSizeChange({
        position: current,
        prevSize: prev,
        nextSize: size,
        bounds: getBoundsSize(),
      });
      petPositionRef.current = next;
      return next;
    });
  }, [getBoundsSize, isStartupReady, petPositionRef, setPetPosition, size]);

  const handleFinishDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      finishDrag(event);
      if (persistLayout) {
        writePlaygroundPetPosition(petPositionRef.current);
      }
    },
    [finishDrag, persistLayout, petPositionRef]
  );

  useEffect(() => {
    if (isDragging) {
      endPointerRef.current('mouse');
    }
  }, [isDragging]);

  if (clipChanged) {
    setMediaEpoch(resetKey);
    setMediaFailed(false);
  }

  const renderMediaFailed = !clipChanged && mediaFailed;

  // Avatar / missing media: no video aspect to wait for.
  useEffect(() => {
    if (isStartupReady || hasResolvedMediaSizeRef.current) {
      return;
    }
    if (renderMediaFailed || !action.mediaUrl) {
      markInitialMediaSizeResolved();
    }
  }, [
    action.mediaUrl,
    isStartupReady,
    markInitialMediaSizeResolved,
    renderMediaFailed,
  ]);

  const handleVideoReady = useCallback(
    (video: HTMLVideoElement) => {
      if (hasResolvedMediaSizeRef.current) {
        return;
      }
      if (video.videoWidth <= 0 || video.videoHeight <= 0) {
        // Still wait for a painted frame / playing before revealing when possible.
        return;
      }
      const nextAspect = video.videoWidth / video.videoHeight;
      applyMediaAspect(nextAspect);
      // Recompute placement while still hidden so the first visible frame
      // already uses the native clip aspect.
      restorePetPosition(nextAspect);

      const reveal = () => {
        if (hasResolvedMediaSizeRef.current) {
          return;
        }
        markInitialMediaSizeResolved();
      };

      // Prefer revealing only after playback has started so we never flash a
      // blank/poster frame when the companion becomes visible.
      if (
        !video.paused &&
        video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
      ) {
        reveal();
        return;
      }
      const onPlaying = () => {
        video.removeEventListener('playing', onPlaying);
        reveal();
      };
      video.addEventListener('playing', onPlaying);
      try {
        const playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
          void playResult.catch(() => {
            video.removeEventListener('playing', onPlaying);
            reveal();
          });
        }
      } catch {
        video.removeEventListener('playing', onPlaying);
        reveal();
      }
    },
    [applyMediaAspect, markInitialMediaSizeResolved, restorePetPosition]
  );

  const positionStyle = {
    ...companionStyle,
    width: `${size.width}px`,
    height: `${size.height}px`,
  } as CSSProperties;

  return (
    <div
      ref={companionRef}
      className={cn(
        'absolute top-0 left-0 z-20 touch-none select-none',
        isStartupReady ? 'pointer-events-auto' : 'pointer-events-none',
        isDragging ? 'cursor-grabbing' : 'cursor-grab',
        supportsLookControl && !isDragging && 'cursor-pointer'
      )}
      style={{
        ...positionStyle,
        // Hide until placement + media size are stable so refresh never shows
        // the fallback seed or a mid-aspect jump traveling left→right.
        visibility: isStartupReady ? 'visible' : 'hidden',
        transform: `translate3d(var(--pet-x), var(--pet-y), 0)`,
      }}
      aria-hidden={!isStartupReady}
      aria-label={`${pet.key} companion. Drag to move${supportsLookControl ? ', hover to look' : ''}.`}
      data-pet-mount-id={mountId ?? undefined}
      data-pet-startup-ready={isStartupReady ? 'true' : 'false'}
      onPointerDown={isStartupReady ? handlePointerDown : undefined}
      onPointerMove={isStartupReady ? handlePointerMove : undefined}
      onPointerUp={isStartupReady ? handleFinishDrag : undefined}
      onPointerCancel={isStartupReady ? handleFinishDrag : undefined}
    >
      {renderMediaFailed || !action.mediaUrl ? (
        <img
          src={pet.avatar}
          alt={`${pet.key} companion`}
          className="pointer-events-none size-full object-contain drop-shadow-lg"
          draggable={false}
        />
      ) : (
        <PetVideoDoubleBuffer
          src={action.mediaUrl}
          srcKey={resetKey}
          // Empty poster: the avatar/thumbnail flash on refresh looked like the
          // dog "appearing" left then jumping — only show decoded video frames.
          poster=""
          loop={videoLoop}
          className="pointer-events-none absolute inset-0 size-full object-contain drop-shadow-lg"
          ariaLabel={`${pet.key} ${action.key}`}
          videoRef={videoRef}
          onReady={handleVideoReady}
          onEnded={() => {
            onVideoEnded?.();
          }}
          onError={() => setMediaFailed(true)}
        />
      )}
    </div>
  );
});
