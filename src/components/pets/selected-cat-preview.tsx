import { usePetDrag } from '@/components/playground/pets/deskpet/use-pet-drag';
import { repositionForPetSizeChange } from '@/components/playground/pets/deskpet/position';
import { PetActionMenu } from '@/components/pets/pet-action-menu';
import { PetVideoDoubleBuffer } from '@/components/pets/pet-video-double-buffer';
import type { PetCardSelectOrigin } from '@/components/pets/pet-card-grid';
import { usePetActionAutoplay } from '@/components/pets/use-pet-action-autoplay';
import { useLookVideoScrub } from '@/components/pets/use-look-video-scrub';
import { usePetWalkMotion } from '@/components/pets/use-pet-walk-motion';
import { cn } from '@/lib/utils';
import type { WalkEdgeHit } from '@/utils/pets/pet-walk-motion';
import {
  showcasePetActionMessageKey,
  showcasePetScale,
  showcasePetWindowSize,
  type ShowcasePet,
} from '@/utils/showcase-pets';
import { useTranslations } from '@/lib/deskpet-i18n';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

/** Fallback before metadata loads — walk-gen / most action clips are 16:9. */
const DEFAULT_CLIP_ASPECT = 16 / 9;

type SelectedCatPreviewProps = {
  pet: ShowcasePet;
  className?: string;
  /** Fraction of viewport for first placement (0–1). */
  placeAt?: { x: number; y: number };
  /** Viewport center of the card avatar to spawn over. */
  origin?: PetCardSelectOrigin | null;
  /** Called when the user chooses Hide from the context menu. */
  onHide?: () => void;
};

function getViewportBounds() {
  if (typeof window === 'undefined') {
    return { width: 1280, height: 720 };
  }
  return { width: window.innerWidth, height: window.innerHeight };
}

/**
 * Floating, draggable showcase cat (playground-style).
 * Right-click picks logical actions; autoplay expands them into clip sequences.
 * Window aspect follows each clip's native video dimensions (no opaque-bbox crop).
 */
export function SelectedCatPreview({
  pet,
  className,
  placeAt = { x: 0.58, y: 0.22 },
  origin = null,
  onHide,
}: SelectedCatPreviewProps) {
  const t = useTranslations('PetsPage.actions');
  const {
    actionKey,
    selectedAction,
    logicalActionId,
    logicalMenuItems,
    videoLoop,
    playbackNonce,
    onVideoEnded,
    selectLogicalAction,
    pauseAutoplay,
    resumeAutoplay,
  } = usePetActionAutoplay({ actions: pet.actions });

  const [mediaAspect, setMediaAspect] = useState<number | undefined>(undefined);
  const [mediaFailed, setMediaFailed] = useState(false);

  const supportsLookControl = selectedAction?.interaction === 'look-scrub';
  const videoUrl = selectedAction?.mediaUrl ?? '';
  const resetKey = `${pet.id}:${selectedAction?.key ?? 'none'}:${videoUrl}:${playbackNonce}`;

  // Track which clip the readiness flags belong to. Sync happens after all
  // hooks — setState during render before later hooks aborts the pass and
  // causes "Rendered more hooks than during the previous render".
  const [mediaEpoch, setMediaEpoch] = useState(resetKey);
  const clipChanged = mediaEpoch !== resetKey;

  const effectiveScale = showcasePetScale(pet, actionKey);
  const petSize = showcasePetWindowSize(
    effectiveScale,
    mediaAspect ?? DEFAULT_CLIP_ASPECT
  );

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
    getBoundsSize: getViewportBounds,
    initialPosition: { x: 80, y: 140 },
    placeAt: origin ? undefined : placeAt,
    originCenter: origin ? { x: origin.centerX, y: origin.centerY } : null,
    fallbackSize: petSize,
  });

  const onHitWalkEdge = useCallback(
    (edge: WalkEdgeHit) => {
      // Prefer in-place turn; if turn clips are missing, sit via walk_to_sit.
      const logical = edge === 'left' ? 'walk_right' : 'walk_left';
      if (!selectLogicalAction(logical)) {
        selectLogicalAction('sit_down');
      }
    },
    [selectLogicalAction]
  );

  const videoRef = useRef<HTMLVideoElement>(null);

  usePetWalkMotion({
    actionKey,
    mediaUrl: selectedAction?.mediaUrl,
    videoRef,
    isDragging,
    getBoundsSize: getViewportBounds,
    petSize,
    companionRef,
    petPositionRef,
    setPetPosition,
    onHitEdge: onHitWalkEdge,
  });

  const markGeometryReady = (video: HTMLVideoElement) => {
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      setMediaAspect(video.videoWidth / video.videoHeight);
    }
  };

  const { endPointer } = useLookVideoScrub({
    videoRef,
    enabled: Boolean(supportsLookControl),
    resetKey,
    loop: videoLoop,
    onReady: markGeometryReady,
  });

  const endPointerRef = useRef(endPointer);
  endPointerRef.current = endPointer;

  // Keep feet anchored when action/scale changes window size.
  // Keep inside the visible stage so size changes never wrap across edges.
  const prevSizeRef = useRef(petSize);
  useLayoutEffect(() => {
    const prev = prevSizeRef.current;
    prevSizeRef.current = petSize;
    if (prev.width === petSize.width && prev.height === petSize.height) {
      return;
    }

    setPetPosition((current) =>
      repositionForPetSizeChange({
        position: current,
        prevSize: prev,
        nextSize: petSize,
        bounds: getViewportBounds(),
      })
    );
  }, [companionRef, petSize, setPetPosition]);

  useEffect(() => {
    if (isDragging) {
      endPointerRef.current('mouse');
      pauseAutoplay();
    } else {
      resumeAutoplay();
    }
  }, [isDragging, pauseAutoplay, resumeAutoplay]);

  // Reset readiness for the new clip after every hook has been registered.
  if (clipChanged) {
    setMediaEpoch(resetKey);
    setMediaFailed(false);
  }

  const renderMediaFailed = !clipChanged && mediaFailed;

  const LOGICAL_LABEL_KEYS = {
    sit_down: 'sitDown',
    walk_left: 'walkLeft',
    walk_right: 'walkRight',
    lick: 'lick',
    scratch: 'scratch',
    tease: 'tease',
    sleep: 'sleep',
    wake_up: 'wakeUp',
    stretch: 'stretch',
  } as const;

  const actionLabelKey =
    logicalActionId && logicalActionId in LOGICAL_LABEL_KEYS
      ? LOGICAL_LABEL_KEYS[logicalActionId]
      : (showcasePetActionMessageKey(actionKey) ?? 'sitIdle');

  const companion = (
    <button
      type="button"
      ref={companionRef}
      className={cn(
        'deskpet-companion border-0 bg-transparent p-0',
        isDragging && 'dragging',
        supportsLookControl && !isDragging && 'cursor-pointer',
        className
      )}
      style={{
        ...companionStyle,
        width: petSize.width,
        height: petSize.height,
      }}
      data-testid="selected-cat-preview"
      data-pet-id={pet.id}
      data-pet-action={actionKey}
      data-pet-logical-action={logicalActionId ?? undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      aria-label={`${pet.breedLabel} desktop pet. Drag to move, right-click for actions.`}
      aria-haspopup="menu"
    >
      <div className="deskpet-shadow" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0">
        {renderMediaFailed || !videoUrl ? (
          <img
            src={pet.avatar}
            alt={`${pet.breedLabel} preview`}
            className="pointer-events-none absolute inset-0 h-full w-full object-contain"
            draggable={false}
          />
        ) : (
          <PetVideoDoubleBuffer
            src={videoUrl}
            srcKey={resetKey}
            poster={pet.avatar}
            loop={videoLoop}
            className="pointer-events-none absolute inset-0 h-full w-full object-contain"
            ariaLabel={`${pet.breedLabel} ${t(actionLabelKey)} preview`}
            videoRef={videoRef}
            onReady={markGeometryReady}
            onEnded={onVideoEnded}
            onError={() => setMediaFailed(true)}
          />
        )}
      </div>
    </button>
  );

  const actionItems = logicalMenuItems.map((item, index, list) => {
    const prev = list[index - 1];
    const separatorBefore = Boolean(prev && prev.group !== item.group);
    return {
      id: item.id,
      label: t(LOGICAL_LABEL_KEYS[item.id]),
      active: logicalActionId === item.id,
      disabled: Boolean(item.disabled),
      separatorBefore,
    };
  });

  return (
    <PetActionMenu
      trigger={companion}
      menuTestId="selected-cat-context-menu"
      items={[
        ...actionItems,
        ...(onHide
          ? [
              {
                id: 'hide',
                label: t('hide'),
                separatorBefore: actionItems.length > 0,
              },
            ]
          : []),
      ]}
      onSelect={(id) => {
        if (id === 'hide') {
          onHide?.();
          return;
        }
        // Exit any active look-scrub so Sleep (lie_down → sleep_loop) can run.
        endPointerRef.current('mouse');
        resumeAutoplay();
        selectLogicalAction(id as Parameters<typeof selectLogicalAction>[0]);
      }}
    />
  );
}
