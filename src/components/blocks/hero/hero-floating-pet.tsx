'use client';

import { HeroExampleActionButtons } from '@/components/blocks/hero/hero-example-action-buttons';
import { PetActionMenu } from '@/components/pets/pet-action-menu';
import { usePetActionAutoplay } from '@/components/pets/use-pet-action-autoplay';
import { logicalActionLabel } from '@/components/playground/action-label';
import {
  PlaygroundPetStage,
  type PlaygroundPetStageHandle,
} from '@/components/playground/playground-pet-stage';
import {
  isPetActionMenuItem,
  PetActionMenuItem,
} from '@/enums/pet-action-menu-item';
import type { LogicalActionId } from '@/utils/pets/pet-action-sequence';
import type { WalkEdgeHit } from '@/utils/pets/pet-walk-motion';
import type { PlaygroundPet } from '@/utils/playground-pet';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';

const HERO_PET_HEIGHT = 320;
const HERO_PET_SIZE = {
  width: Math.round((HERO_PET_HEIGHT * 16) / 9),
  height: HERO_PET_HEIGHT,
} as const;

type HeroFloatingPetProps = {
  pet: PlaygroundPet;
  /** Bounds for walk clamping / placement (usually the hero section). */
  boundsRef: RefObject<HTMLElement | null>;
  /**
   * Root for photo anchors + action button slots. Defaults to `boundsRef`.
   * Use when walk bounds are a fixed viewport overlay.
   */
  contentRootRef?: RefObject<HTMLElement | null>;
  /**
   * Render the pet layer into `boundsRef` via portal (needed for fixed
   * fullscreen walk layers that are not a DOM ancestor of this component).
   */
  portalToBounds?: boolean;
  /** Sit on this side of the matching hero example photo. */
  side: 'left' | 'right';
  /** Showcase / registry pet id used by `data-hero-photo-anchor`. */
  photoPetId: string;
  /** Example pet display name (e.g. Cooper), not the breed label. */
  displayPetName: string;
};

/**
 * Home-page floating companion with playground interactions: drag, look-scrub,
 * right-click actions, visible action buttons under the photo, and
 * double-buffered clip playback.
 *
 * Starts on sit_idle and stays put until the user picks an action; then random
 * autoplay can resume like the playground.
 *
 * The outer layer is `pointer-events-none` so hero cards stay clickable; the
 * companion itself re-enables pointer events via PlaygroundPetStage.
 */
export function HeroFloatingPet({
  pet,
  boundsRef,
  contentRootRef,
  portalToBounds = false,
  side,
  photoPetId,
  displayPetName,
}: HeroFloatingPetProps) {
  const petRef = useRef<PlaygroundPetStageHandle>(null);
  const [autoplayEnabled, setAutoplayEnabled] = useState(false);
  const [actionsSlot, setActionsSlot] = useState<HTMLElement | null>(null);
  const [boundsPortalEl, setBoundsPortalEl] = useState<HTMLElement | null>(
    null
  );
  const {
    selectedAction,
    logicalActionId,
    logicalMenuItems,
    videoLoop,
    playbackNonce,
    onVideoEnded,
    selectLogicalAction,
    resumeAutoplay,
  } = usePetActionAutoplay({
    actions: pet.actions,
    enabled: autoplayEnabled,
  });

  useEffect(() => {
    if (!portalToBounds) {
      setBoundsPortalEl(null);
      return;
    }

    const sync = () => {
      setBoundsPortalEl(boundsRef.current);
    };
    sync();

    const observer =
      typeof MutationObserver !== 'undefined'
        ? new MutationObserver(sync)
        : null;
    observer?.observe(document.body, { childList: true, subtree: true });
    return () => observer?.disconnect();
  }, [boundsRef, portalToBounds]);

  useEffect(() => {
    const root = contentRootRef?.current ?? boundsRef.current;
    if (!root) return;

    const resolveSlot = () => {
      const next = root.querySelector(
        `[data-hero-actions-slot="${photoPetId}"]`
      );
      setActionsSlot(next instanceof HTMLElement ? next : null);
    };

    resolveSlot();

    const observer =
      typeof MutationObserver !== 'undefined'
        ? new MutationObserver(resolveSlot)
        : null;
    observer?.observe(root, { childList: true, subtree: true });

    return () => observer?.disconnect();
  }, [boundsRef, contentRootRef, photoPetId]);

  const onHitWalkEdge = useCallback(
    (edge: WalkEdgeHit) => {
      const logical = edge === 'left' ? 'walk_right' : 'walk_left';
      if (!selectLogicalAction(logical)) {
        selectLogicalAction(PetActionMenuItem.SitDown);
      }
    },
    [selectLogicalAction]
  );

  const onSelectLogicalAction = useCallback(
    (actionId: string) => {
      if (!isPetActionMenuItem(actionId)) return;
      const menuItem = logicalMenuItems.find((item) => item.id === actionId);
      if (menuItem?.disabled) return;
      // Clear hover look-scrub pause so chained clips (lie_down → sleep_loop) advance.
      petRef.current?.endPointer('mouse');
      petRef.current?.endPointer('hand');
      setAutoplayEnabled(true);
      resumeAutoplay();
      selectLogicalAction(actionId as LogicalActionId);
    },
    [logicalMenuItems, resumeAutoplay, selectLogicalAction]
  );

  const actionMenuItems = useMemo(() => {
    return logicalMenuItems.map((item, index, list) => {
      const prev = list[index - 1];
      return {
        id: item.id,
        label: logicalActionLabel(item),
        active: logicalActionId === item.id,
        disabled: Boolean(item.disabled),
        separatorBefore: Boolean(prev && prev.group !== item.group),
      };
    });
  }, [logicalMenuItems, logicalActionId]);

  if (!selectedAction) {
    return null;
  }

  const layer = (
    <div
      className="pointer-events-none absolute inset-0 z-[60] overflow-hidden"
      data-testid={`hero-floating-pet-${pet.key}`}
    >
      <PetActionMenu
        trigger={
          // `display: contents` wrapper takes the context-menu trigger props;
          // PlaygroundPetStage owns its own root div props (drag/look handlers).
          <div className="contents">
            <PlaygroundPetStage
              ref={petRef}
              pet={pet}
              action={selectedAction}
              boundsRef={boundsRef}
              anchorRootRef={contentRootRef}
              windowSize={HERO_PET_SIZE}
              initialSide={side}
              anchorSelector={`[data-hero-photo-anchor="${photoPetId}"]`}
              anchorSide={side}
              anchorPlacement="above"
              persistLayout={false}
              videoLoop={videoLoop}
              playbackNonce={playbackNonce}
              onVideoEnded={onVideoEnded}
              onHitWalkEdge={onHitWalkEdge}
              horizontalWrap
            />
          </div>
        }
        menuTestId={`hero-pet-context-menu-${pet.key}`}
        items={actionMenuItems}
        onSelect={onSelectLogicalAction}
      />
    </div>
  );

  return (
    <>
      {portalToBounds
        ? boundsPortalEl
          ? createPortal(layer, boundsPortalEl)
          : null
        : layer}

      {actionsSlot
        ? createPortal(
            <HeroExampleActionButtons
              petName={displayPetName}
              petId={photoPetId}
              items={logicalMenuItems}
              selectedLogicalActionId={logicalActionId}
              onSelectLogicalAction={onSelectLogicalAction}
            />,
            actionsSlot
          )
        : null}
    </>
  );
}
