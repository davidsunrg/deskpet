'use client';

import { PetActionMenu } from '@/components/pets/pet-action-menu';
import { usePetActionAutoplay } from '@/components/pets/use-pet-action-autoplay';
import type { PlaygroundPet } from '@/utils/playground-pet';
import type { LogicalActionId } from '@/utils/pets/pet-action-sequence';
import type { WalkEdgeHit } from '@/utils/pets/pet-walk-motion';
import { useCallback, useMemo, useRef, useState, type RefObject } from 'react';
import { logicalActionLabel } from '@/components/playground/action-label';
import {
  PlaygroundPetStage,
  type PlaygroundPetStageHandle,
} from '@/components/playground/playground-pet-stage';
import {
  isPetActionMenuItem,
  PetActionMenuItem,
} from '@/enums/pet-action-menu-item';

const HERO_PET_HEIGHT = 320;
const HERO_PET_SIZE = {
  width: Math.round((HERO_PET_HEIGHT * 16) / 9),
  height: HERO_PET_HEIGHT,
} as const;

type HeroFloatingPetProps = {
  pet: PlaygroundPet;
  /** Bounds for walk clamping / placement (usually the hero section). */
  boundsRef: RefObject<HTMLElement | null>;
  side: 'left' | 'right';
};

/**
 * Home-page floating companion with playground interactions: drag, look-scrub,
 * right-click actions, and double-buffered clip playback.
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
  side,
}: HeroFloatingPetProps) {
  const petRef = useRef<PlaygroundPetStageHandle>(null);
  const [autoplayEnabled, setAutoplayEnabled] = useState(false);
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

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[60] overflow-hidden"
      data-testid="hero-floating-pet"
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
              windowSize={HERO_PET_SIZE}
              initialSide={side}
              persistLayout={false}
              videoLoop={videoLoop}
              playbackNonce={playbackNonce}
              onVideoEnded={onVideoEnded}
              onHitWalkEdge={onHitWalkEdge}
            />
          </div>
        }
        menuTestId="hero-pet-context-menu"
        items={actionMenuItems}
        onSelect={onSelectLogicalAction}
      />
    </div>
  );
}
