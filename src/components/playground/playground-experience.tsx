import { PetActionMenu } from '@/components/pets/pet-action-menu';
import { usePetActionAutoplay } from '@/components/pets/use-pet-action-autoplay';
import {
  isPetActionMenuItem,
  PetActionMenuItem,
} from '@/enums/pet-action-menu-item';
import { useLocaleRouter } from '@/lib/i18n/navigation';
import { playgroundRoute } from '@/lib/routes';
import type { PlaygroundPet } from '@/utils/playground-pet';
import type { LogicalActionId } from '@/utils/pets/pet-action-sequence';
import type { WalkEdgeHit } from '@/utils/pets/pet-walk-motion';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { logicalActionLabel } from './action-label';
import { ActionSelectionPanel } from './action-selection-panel';
import {
  PlaygroundPetStage,
  type PlaygroundPetStageHandle,
} from './playground-pet-stage';
import { PetSelectionPanel } from './pet-selection-panel';
import type { WallpaperId } from './wallpapers';

function resolvePresetPetKey(
  presetPets: readonly PlaygroundPet[],
  petKey: string | null | undefined
): string {
  if (petKey && presetPets.some((pet) => pet.key === petKey)) {
    return petKey;
  }
  return presetPets[0]?.key ?? '';
}

function resolveInitialPet(
  presetPets: readonly PlaygroundPet[],
  initialPetKey: string | null | undefined
): PlaygroundPet | null {
  const key = resolvePresetPetKey(presetPets, initialPetKey);
  return presetPets.find((pet) => pet.key === key) ?? presetPets[0] ?? null;
}

type PlaygroundExperienceProps = {
  /** Public pets loaded from the resource registry. */
  presetPets: readonly PlaygroundPet[];
  /** Registry pet key from `?pet=`. */
  initialPetKey?: string | null;
  /** Server-known admin flag for clip debug tooltip. */
  isAdmin?: boolean;
  /** Wallpaper owned by the outer shell (bg paints before this mounts). */
  wallpaperId: WallpaperId;
  onWallpaperChange: (id: WallpaperId) => void;
  /** Bounds root from the outer wallpaper shell. */
  rootRef: RefObject<HTMLElement | null>;
};

export type { PlaygroundExperienceProps };

/**
 * `/playground` look-control experience with pet picker.
 * Logical actions are chosen via right-click / Actions panel; autoplay expands
 * them into raw clip sequences. Mouse and hand share absolute horizontal look
 * mapping (latest input wins).
 *
 * Wallpaper chrome is owned by `PlaygroundExperienceClient` so the background
 * can paint before this interactive layer mounts.
 */
export function PlaygroundExperience({
  presetPets,
  initialPetKey = null,
  rootRef,
}: PlaygroundExperienceProps) {
  const router = useLocaleRouter();
  const petRef = useRef<PlaygroundPetStageHandle>(null);

  const [selectedPetKey, setSelectedPetKey] = useState(
    () => resolveInitialPet(presetPets, initialPetKey)?.key ?? ''
  );

  const syncPlaygroundQuery = useCallback(
    (pet: PlaygroundPet) => {
      router.replace(playgroundRoute({ petKey: pet.key }), {
        scroll: false,
      });
    },
    [router]
  );

  // Deep-link updates (client navigations / refresh with ?pet=).
  useEffect(() => {
    const nextPet = resolveInitialPet(presetPets, initialPetKey);
    if (!nextPet) {
      setSelectedPetKey('');
      return;
    }
    setSelectedPetKey(nextPet.key);
  }, [presetPets, initialPetKey]);

  const availablePets = useMemo(() => [...presetPets], [presetPets]);

  const selectedPet = useMemo(
    () =>
      availablePets.find((pet) => pet.key === selectedPetKey) ??
      availablePets[0] ??
      null,
    [availablePets, selectedPetKey]
  );

  const {
    actionKey,
    selectedAction,
    logicalActionId,
    logicalMenuItems,
    videoLoop,
    playbackNonce,
    onVideoEnded,
    selectLogicalAction,
    resumeAutoplay,
  } = usePetActionAutoplay({
    actions: selectedPet?.actions ?? [],
  });

  // Action selection is in-memory only. Strip legacy ?action= without a
  // Next navigation so the pet does not remount during initial playback.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (!url.searchParams.has('action')) return;
    url.searchParams.delete('action');
    window.history.replaceState(
      window.history.state,
      '',
      `${url.pathname}${url.search}${url.hash}`
    );
  }, [initialPetKey]);

  const [petStartupReady, setPetStartupReady] = useState(false);
  useEffect(() => {
    setPetStartupReady(false);
  }, [selectedPet?.key]);
  const onPetStartupReady = useCallback(() => {
    setPetStartupReady(true);
  }, []);

  const onSelectPet = useCallback(
    (petKey: string) => {
      const nextPet = availablePets.find((pet) => pet.key === petKey);
      if (!nextPet) {
        return;
      }
      setSelectedPetKey(nextPet.key);
      syncPlaygroundQuery(nextPet);
    },
    [availablePets, syncPlaygroundQuery]
  );

  const onSelectLogicalAction = useCallback(
    (actionId: string) => {
      if (!selectedPet) return;
      if (!isPetActionMenuItem(actionId)) return;
      const menuItem = logicalMenuItems.find((item) => item.id === actionId);
      if (menuItem?.disabled) return;
      // Clear hover look-scrub pause so chained clips (lie_down → sleep_loop) advance.
      petRef.current?.endPointer('mouse');
      petRef.current?.endPointer('hand');
      resumeAutoplay();
      selectLogicalAction(actionId as LogicalActionId);
    },
    [selectedPet, selectLogicalAction, resumeAutoplay, logicalMenuItems]
  );

  const onHitWalkEdge = useCallback(
    (edge: WalkEdgeHit) => {
      // Prefer in-place turn; if turn clips are missing, sit via walk_to_sit.
      const logical = edge === 'left' ? 'walk_right' : 'walk_left';
      if (!selectLogicalAction(logical)) {
        selectLogicalAction(PetActionMenuItem.SitDown);
      }
    },
    [selectLogicalAction]
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

  return (
    <>
      {selectedPet && selectedAction ? (
        <PetActionMenu
          trigger={
            // `display: contents` wrapper takes the context-menu trigger props;
            // PlaygroundPetStage owns its own root div props (drag/look handlers).
            <div className="contents">
              <PlaygroundPetStage
                ref={petRef}
                pet={selectedPet}
                action={selectedAction}
                boundsRef={rootRef}
                videoLoop={videoLoop}
                playbackNonce={playbackNonce}
                onVideoEnded={onVideoEnded}
                onHitWalkEdge={onHitWalkEdge}
                onStartupReady={onPetStartupReady}
              />
            </div>
          }
          menuTestId="playground-pet-context-menu"
          items={actionMenuItems}
          onSelect={onSelectLogicalAction}
        />
      ) : null}

      {/* Wallpaper / theme select temporarily hidden — locked to night. */}

      {petStartupReady ? (
        <PetSelectionPanel
          mode="rail"
          pets={availablePets}
          selectedPetKey={selectedPetKey}
          onSelectPet={onSelectPet}
        />
      ) : null}

      {selectedPet && petStartupReady ? (
        <ActionSelectionPanel
          mode="rail"
          items={logicalMenuItems}
          selectedLogicalActionId={logicalActionId}
          onSelectLogicalAction={onSelectLogicalAction}
        />
      ) : null}

      {/* Keep actionKey referenced for a11y/debug without URL churn. */}
      <span className="sr-only" data-pet-action={actionKey} />
    </>
  );
}
