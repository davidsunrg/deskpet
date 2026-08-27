import {
  advancePlaybackOnEnded,
  createInitialPlaybackState,
  isPlaybackTransitioning,
  plannerPostureNow,
  selectLogicalPlayback,
  type PlaybackQueue,
} from '@/utils/pets/pet-action-playback';
import {
  availableClipKeys,
  initialClipKey,
  listMenuItems,
  logicalActionFromClipKey,
  type ActionEngineMenuItemKey,
  type ActionEnginePosture,
} from '@/lib/action-engine';
import type { LogicalActionMenuItem } from '@/utils/pets/pet-action-sequence';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type LogicalActionId = ActionEngineMenuItemKey;
type PetPosture = ActionEnginePosture;

export type AutoplableAction = {
  key: string;
  mediaUrl: string;
  displayScale: number;
  interaction?: 'look-scrub' | 'loop' | string;
};

export type UsePetActionAutoplayOptions<T extends AutoplableAction> = {
  actions: readonly T[];
  /** When false, stay on the current clip without random advances. */
  enabled?: boolean;
};

export type UsePetActionAutoplayResult<T extends AutoplableAction> = {
  actionKey: string;
  selectedAction: T | null;
  logicalActionId: LogicalActionId | null;
  logicalMenuItems: LogicalActionMenuItem[];
  /**
   * True while a multi-clip queue is still before its final target clip.
   * Menus should disable all pet actions during this window.
   */
  isTransitioning: boolean;
  /**
   * Always false for sequenced playback: dwell loops replay via `ended` +
   * `playbackNonce`. Hover look-scrub still works through `interaction`.
   */
  videoLoop: boolean;
  /**
   * Bumps when the same clip should replay (dwell). Bind as part of the video
   * `key` or seek(0)+play when it changes while `actionKey` is unchanged.
   */
  playbackNonce: number;
  onVideoEnded: () => void;
  /** Returns false when the intent cannot be expanded from the current posture. */
  selectLogicalAction: (id: LogicalActionId) => boolean;
  pauseAutoplay: () => void;
  resumeAutoplay: () => void;
};

function findAction<T extends AutoplableAction>(
  actions: readonly T[],
  key: string | null | undefined
): T | null {
  if (!key) return null;
  return actions.find((action) => action.key === key) ?? null;
}

/**
 * Shared homepage / playground autoplay sequencer.
 * Menus select logical intents; this hook plays the expanded raw clip queue.
 * Queue / ended transitions live in {@link '@/utils/pets/pet-action-playback'}.
 */
export function usePetActionAutoplay<T extends AutoplableAction>({
  actions,
  enabled = true,
}: UsePetActionAutoplayOptions<T>): UsePetActionAutoplayResult<T> {
  const actionKeysSignature = useMemo(
    () => actions.map((action) => action.key).join('|'),
    [actions]
  );
  const available = useMemo(
    () => availableClipKeys(actions),
    // Parents often pass a new `actions` array each render; key off content.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- signature tracks content
    [actionKeysSignature]
  );

  const [actionKey, setActionKey] = useState(
    () => initialClipKey(actions) ?? actions[0]?.key ?? ''
  );
  const [logicalActionId, setLogicalActionId] =
    useState<LogicalActionId | null>(() =>
      logicalActionFromClipKey(initialClipKey(actions) ?? '')
    );
  const [posture, setPosture] = useState<PetPosture>(() =>
    plannerPostureNow(initialClipKey(actions))
  );
  const [playbackNonce, setPlaybackNonce] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const queueRef = useRef<PlaybackQueue | null>(null);
  const pausedRef = useRef(false);
  const previousLogicalRef = useRef<LogicalActionId | null>(null);
  const postureRef = useRef(posture);
  postureRef.current = posture;
  const actionKeyRef = useRef(actionKey);
  actionKeyRef.current = actionKey;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const availableRef = useRef(available);
  availableRef.current = available;
  const actionsRef = useRef(actions);
  actionsRef.current = actions;
  const logicalActionIdRef = useRef(logicalActionId);
  logicalActionIdRef.current = logicalActionId;
  const playbackNonceRef = useRef(playbackNonce);
  playbackNonceRef.current = playbackNonce;
  const isTransitioningRef = useRef(isTransitioning);
  isTransitioningRef.current = isTransitioning;

  const syncQueueState = (queue: PlaybackQueue | null) => {
    queueRef.current = queue;
    setIsTransitioning(isPlaybackTransitioning({ queue }));
  };

  // Reset when the pet's action catalog changes (by key content, not array identity).
  useEffect(() => {
    const catalog = actionsRef.current;
    const initial = createInitialPlaybackState(catalog, {
      enabled: enabledRef.current,
    });
    setActionKey(initial.actionKey);
    setLogicalActionId(initial.logicalActionId);
    setPosture(initial.posture);
    setPlaybackNonce(initial.playbackNonce);
    syncQueueState(initial.queue);
    previousLogicalRef.current = initial.previousLogical;
    pausedRef.current = initial.paused;
    actionKeyRef.current = initial.actionKey;
  }, [actionKeysSignature]);

  const logicalMenuItems = useMemo(() => {
    const items = listMenuItems(available, posture) as LogicalActionMenuItem[];
    if (!isTransitioning) return items;
    return items.map((item) => ({ ...item, disabled: true }));
  }, [available, posture, isTransitioning]);

  const selectedAction = findAction(actions, actionKey);

  const beginLogical = useCallback(
    (logical: LogicalActionId, manual: boolean): boolean => {
      if (isTransitioningRef.current) return false;
      const snapshot = {
        actionKey: actionKeyRef.current,
        logicalActionId: logicalActionIdRef.current,
        posture: postureRef.current,
        queue: queueRef.current,
        previousLogical: previousLogicalRef.current,
        playbackNonce: playbackNonceRef.current,
        paused: pausedRef.current,
        enabled: enabledRef.current,
      };
      const next = selectLogicalPlayback(
        snapshot,
        logical,
        availableRef.current,
        { manual }
      );
      if (!next) return false;
      syncQueueState(next.queue);
      previousLogicalRef.current = next.previousLogical;
      actionKeyRef.current = next.actionKey;
      pausedRef.current = next.paused;
      setLogicalActionId(next.logicalActionId);
      setActionKey(next.actionKey);
      setPosture(next.posture);
      setPlaybackNonce(next.playbackNonce);
      playbackNonceRef.current = next.playbackNonce;
      return true;
    },
    []
  );

  const selectLogicalAction = useCallback(
    (id: LogicalActionId): boolean => beginLogical(id, true),
    [beginLogical]
  );

  const onVideoEnded = useCallback(() => {
    const snapshot = {
      actionKey: actionKeyRef.current,
      logicalActionId: logicalActionIdRef.current,
      posture: postureRef.current,
      queue: queueRef.current,
      previousLogical: previousLogicalRef.current,
      playbackNonce: playbackNonceRef.current,
      paused: pausedRef.current,
      enabled: enabledRef.current,
    };
    const next = advancePlaybackOnEnded(snapshot, availableRef.current);
    syncQueueState(next.queue);
    previousLogicalRef.current = next.previousLogical;
    actionKeyRef.current = next.actionKey;
    pausedRef.current = next.paused;
    setLogicalActionId(next.logicalActionId);
    setActionKey(next.actionKey);
    setPosture(next.posture);
    setPlaybackNonce(next.playbackNonce);
    playbackNonceRef.current = next.playbackNonce;
  }, []);

  const pauseAutoplay = useCallback(() => {
    pausedRef.current = true;
  }, []);

  const resumeAutoplay = useCallback(() => {
    pausedRef.current = false;
  }, []);

  return {
    actionKey,
    selectedAction,
    logicalActionId,
    logicalMenuItems,
    isTransitioning,
    videoLoop: false,
    playbackNonce,
    onVideoEnded,
    selectLogicalAction,
    pauseAutoplay,
    resumeAutoplay,
  };
}
