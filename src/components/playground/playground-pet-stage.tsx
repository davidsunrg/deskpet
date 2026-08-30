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
import {
  wrapHorizontalPetX,
  type WalkEdgeHit,
} from '@/utils/pets/pet-walk-motion';
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
  /**
   * Optional CSS selector for an element the pet should sit beside/above on
   * first reveal — e.g. a hero example photo. Scoped under `anchorRootRef`
   * when set, otherwise under `boundsRef`.
   */
  anchorSelector?: string;
  /**
   * Root used to find photo anchors. Defaults to `boundsRef`. Pass a separate
   * content root when walk bounds are a fixed overlay.
   */
  anchorRootRef?: RefObject<HTMLElement | null>;
  /** Which side of the anchor the pet sits on. Defaults to `initialSide`. */
  anchorSide?: 'left' | 'right';
  /**
   * Initial anchor placement. `auto` places above stacked photo grids and
   * beside side-by-side grids; `above` / `beside` force one mode.
   */
  anchorPlacement?: 'auto' | 'above' | 'beside';
  /** Disable shared playground layout reads/writes for embedded stages. */
  persistLayout?: boolean;
  /** When false, play once and fire onEnded (autoplay sequencer). */
  videoLoop?: boolean;
  /** Bumps to force replay of the same clip during dwell. */
  playbackNonce?: number;
  onVideoEnded?: () => void;
  /** Edge of the visible walk area — request opposite walk direction. */
  onHitWalkEdge?: (edge: WalkEdgeHit) => void;
  /**
   * When true, walking/dragging past left/right re-enters from the opposite
   * side instead of clamping or turning around.
   */
  horizontalWrap?: boolean;
  /** Fires once when the companion is ready to be shown (placed + first frame). */
  onStartupReady?: () => void;
};

function isHeroPhotoGridStacked(boundsEl: HTMLElement): boolean {
  const photos = [
    ...boundsEl.querySelectorAll('[data-hero-photo-anchor]'),
  ] as HTMLElement[];
  if (photos.length < 2) {
    return (
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 639px)').matches
    );
  }
  const [first, second] = photos.map((el) => el.getBoundingClientRect());
  // Single column: cards share roughly the same left edge.
  return (
    Math.abs(first.left - second.left) <
    Math.min(first.width, second.width) * 0.25
  );
}

function resolveAnchorPlacement(
  rootEl: HTMLElement,
  mode: 'auto' | 'above' | 'beside'
): 'above' | 'beside' {
  if (mode === 'above' || mode === 'beside') return mode;
  return isHeroPhotoGridStacked(rootEl) ? 'above' : 'beside';
}

function positionRelativeToAnchor(input: {
  boundsEl: HTMLElement;
  anchorEl: HTMLElement;
  size: { width: number; height: number };
  side: 'left' | 'right';
  placement: 'beside' | 'above';
}): { x: number; y: number } {
  const bounds = input.boundsEl.getBoundingClientRect();
  const anchor = input.anchorEl.getBoundingClientRect();

  if (input.placement === 'above') {
    return {
      // Nudge slightly right of true center so the subject reads better in-frame.
      x:
        anchor.left -
        bounds.left +
        (anchor.width - input.size.width) / 2 +
        input.size.width * 0.12,
      // Center on the photo so the companion sits in the middle of the card.
      y: anchor.top - bounds.top + (anchor.height - input.size.height) / 2,
    };
  }

  const y = anchor.top - bounds.top + (anchor.height - input.size.height) / 2;
  // Slight overlap so the pet reads as "next to" the photo, not far away.
  const overlap = Math.round(input.size.width * 0.28);
  const x =
    input.side === 'left'
      ? anchor.left - bounds.left - input.size.width + overlap
      : anchor.right - bounds.left - overlap;
  return { x, y };
}

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
    anchorSelector,
    anchorRootRef,
    anchorSide,
    anchorPlacement = 'auto',
    persistLayout = true,
    videoLoop = true,
    playbackNonce = 0,
    onVideoEnded,
    onHitWalkEdge,
    horizontalWrap = false,
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
  const lastAnchorPlacementRef = useRef<'beside' | 'above' | null>(null);
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
    horizontalWrap,
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
    // Content-area roam expands the bounds element past the pane edges so pets
    // can hang off the sides — walk must use that width, not the parent width.
    const useBoundsWidth = Boolean(
      boundsRef.current?.hasAttribute('data-pet-content-bounds')
    );
    return {
      width: useBoundsWidth ? bounds.width : getVisibleWidth(),
      height: bounds.height,
    };
  }, [boundsRef, getBoundsSize, getVisibleWidth]);

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
    onHitEdge: horizontalWrap ? undefined : handleHitWalkEdge,
    horizontalWrap,
  });

  const restorePetPosition = useCallback(
    (aspectOverride?: number) => {
      const boundsEl = boundsRef.current;
      const anchorRootEl = anchorRootRef?.current ?? boundsEl;
      const bounds = getBoundsSize();
      if (!boundsEl || bounds.width <= 0 || bounds.height <= 0) {
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

      const side = anchorSide ?? initialSide ?? 'left';
      let position: { x: number; y: number } | null = null;

      if (anchorSelector) {
        if (!anchorRootEl) {
          return false;
        }
        const anchorEl = anchorRootEl.querySelector(anchorSelector);
        if (!(anchorEl instanceof HTMLElement)) {
          // Photo card not mounted yet — retry via ResizeObserver.
          return false;
        }
        const placement = resolveAnchorPlacement(anchorRootEl, anchorPlacement);
        position = positionRelativeToAnchor({
          boundsEl,
          anchorEl,
          size,
          side,
          placement,
        });
        lastAnchorPlacementRef.current = placement;
      } else if (initialSide) {
        position = {
          x:
            initialSide === 'right'
              ? Math.max(24, bounds.width - size.width - 24)
              : 24,
          y: Math.max(80, Math.round((bounds.height - size.height) / 2)),
        };
      } else {
        const placement = computeInitialPlaygroundPetPlacement({
          bounds,
          visibleWidth: getVisibleWidth(),
          displayScale: lookScrubScale,
          aspect: aspectNow,
          storedPosition: layout?.petPosition ?? null,
        });
        position = placement.position;
      }

      const clamped = clampPetPosition(
        position,
        companionRef.current,
        bounds,
        size
      );
      const next = horizontalWrap
        ? {
            x: wrapHorizontalPetX({
              x: position.x,
              boundsWidth: bounds.width,
              petWidth: size.width,
            }),
            y: clamped.y,
          }
        : clamped;
      petPositionRef.current = next;
      setPetPosition(next);
      setHasRestoredPosition(true);
      return true;
    },
    [
      anchorRootRef,
      anchorSelector,
      anchorSide,
      anchorPlacement,
      boundsRef,
      companionRef,
      getBoundsSize,
      getVisibleWidth,
      horizontalWrap,
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
  // Also watch DOM mutations so hero photo anchors can appear after first paint.
  useEffect(() => {
    const el = boundsRef.current;
    const anchorRootEl = anchorRootRef?.current ?? el;
    if (!el) {
      return;
    }

    const tryRestore = () => {
      const stackedRoot = anchorRootRef?.current ?? el;
      const placement = resolveAnchorPlacement(stackedRoot, anchorPlacement);

      if (!didRestoreRef.current) {
        if (restorePetPosition()) {
          didRestoreRef.current = true;
          if (anchorSelector) {
            lastAnchorPlacementRef.current = placement;
          }
        }
        return;
      }

      // Hero anchors: re-snap when the photo grid flips between stacked and
      // side-by-side, unless the user is actively dragging.
      if (
        anchorSelector &&
        !persistLayout &&
        !isDragging &&
        lastAnchorPlacementRef.current !== placement
      ) {
        if (restorePetPosition()) {
          lastAnchorPlacementRef.current = placement;
        }
      }
    };

    tryRestore();

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            tryRestore();
          })
        : null;
    resizeObserver?.observe(el);
    const parent = el.parentElement;
    if (parent) {
      resizeObserver?.observe(parent);
    }
    if (anchorRootEl && anchorRootEl !== el) {
      resizeObserver?.observe(anchorRootEl);
    }

    const mutationObserver =
      typeof MutationObserver !== 'undefined'
        ? new MutationObserver(() => {
            tryRestore();
          })
        : null;
    mutationObserver?.observe(el, { childList: true, subtree: true });
    if (anchorRootEl && anchorRootEl !== el) {
      mutationObserver?.observe(anchorRootEl, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
    };
  }, [
    anchorRootRef,
    anchorSelector,
    anchorPlacement,
    boundsRef,
    isDragging,
    persistLayout,
    restorePetPosition,
  ]);

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
