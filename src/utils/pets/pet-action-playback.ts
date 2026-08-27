/**
 * Pure playback sequencer for pet action queues.
 *
 * {@link usePetActionAutoplay} wires React state around these helpers so
 * current-state → next-clip behavior can be unit-tested without a hook harness.
 */

import {
  type ActionClipRef,
  type ActionEngineMenuItemKey,
  type ActionEnginePosture,
  defaultDwellLoops,
  expandMenuAction,
  initialClipKey,
  isLoopClip,
  logicalActionFromClipKey,
  pickAutoplayMenuItem,
  plannerPostureFromClipKey,
  postureFromClipKey,
  shouldHoldManualTerminalLoop,
} from '@/lib/action-engine';

type LogicalActionId = ActionEngineMenuItemKey;
type PetPosture = ActionEnginePosture;

export type PlaybackQueue = {
  clips: string[];
  index: number;
  logical: LogicalActionId | null;
  endingPosture: PetPosture;
  /** Remaining full plays of the current clip including the one in progress. */
  dwellRemaining: number;
  manual: boolean;
  /** Keep replaying the final sustained clip until another action replaces it. */
  holdTerminalLoop: boolean;
};

export type PlaybackState = {
  actionKey: string;
  logicalActionId: LogicalActionId | null;
  posture: PetPosture;
  queue: PlaybackQueue | null;
  previousLogical: LogicalActionId | null;
  playbackNonce: number;
  paused: boolean;
  enabled: boolean;
};

/** Stable planner posture for the clip currently on screen. */
export function plannerPostureNow(
  clipKey: string | null | undefined
): PetPosture {
  return plannerPostureFromClipKey(clipKey ?? '');
}

/**
 * True while a multi-clip queue is still before its final target clip.
 * Final-clip dwell loops are not transitions and do not lock the menu.
 */
export function isPlaybackTransitioning(
  state: Pick<PlaybackState, 'queue'>
): boolean {
  const queue = state.queue;
  return queue !== null && queue.index < queue.clips.length - 1;
}

function normalizeDwell(dwell: number): number {
  return Number.isFinite(dwell) ? Math.max(1, dwell) : Number.MAX_SAFE_INTEGER;
}

/**
 * Expand a logical intent into a fresh queue starting at clip 0.
 * Returns null when the intent is illegal or required clips are missing.
 */
export function startPlaybackQueue(
  logical: LogicalActionId,
  posture: PetPosture,
  available: ReadonlySet<string>,
  manual: boolean,
  dwellLoops: (clipKey: string) => number = defaultDwellLoops
): PlaybackQueue | null {
  const expanded = expandMenuAction(logical, posture, available);
  if (!expanded || expanded.clips.length === 0) {
    return null;
  }

  const first = expanded.clips[0]!;
  const finalClip = expanded.clips[expanded.clips.length - 1]!;
  const isTerminalOnly = expanded.clips.length === 1;
  const dwell =
    isLoopClip(first) && isTerminalOnly
      ? dwellLoops(first)
      : isLoopClip(first)
        ? 1
        : 1;

  return {
    clips: expanded.clips,
    index: 0,
    logical,
    endingPosture: expanded.endingPosture,
    dwellRemaining: normalizeDwell(dwell),
    manual,
    holdTerminalLoop: shouldHoldManualTerminalLoop(manual, logical, finalClip),
  };
}

/** Apply a queue as the active playback clip (bumps nonce). */
export function applyPlaybackQueue(
  state: PlaybackState,
  queue: PlaybackQueue
): PlaybackState {
  const clip = queue.clips[queue.index];
  if (!clip) return state;
  return {
    ...state,
    queue,
    previousLogical: queue.logical,
    logicalActionId: queue.logical ?? state.logicalActionId,
    actionKey: clip,
    posture: plannerPostureNow(clip),
    playbackNonce: state.playbackNonce + 1,
  };
}

/**
 * Initial mount / catalog-reset state. Prefers the configured default and
 * starts a dwell queue only when the initial clip is a sustained loop.
 */
export function createInitialPlaybackState(
  actions: readonly ActionClipRef[],
  options: { enabled?: boolean; dwellLoops?: (clipKey: string) => number } = {}
): PlaybackState {
  const enabled = options.enabled ?? true;
  const dwellLoops = options.dwellLoops ?? defaultDwellLoops;
  const nextKey = initialClipKey(actions) ?? actions[0]?.key ?? '';
  const base: PlaybackState = {
    actionKey: nextKey,
    logicalActionId: logicalActionFromClipKey(nextKey),
    posture: plannerPostureNow(nextKey),
    queue: null,
    previousLogical: null,
    playbackNonce: 0,
    paused: false,
    enabled,
  };

  if (!nextKey || !isLoopClip(nextKey)) {
    return base;
  }

  const dwell = dwellLoops(nextKey);
  return {
    ...base,
    queue: {
      clips: [nextKey],
      index: 0,
      logical: logicalActionFromClipKey(nextKey),
      endingPosture: postureFromClipKey(nextKey),
      dwellRemaining: normalizeDwell(dwell),
      manual: false,
      // Keep the default idle looping until autoplay (or a manual pick) takes over.
      holdTerminalLoop: !enabled,
    },
  };
}

/**
 * Manual (or autoplay) logical selection from the clip currently on screen.
 * Uses planner posture so mid-transition clips do not skip handoffs.
 * Returns null when the intent cannot expand (state unchanged by caller).
 */
export function selectLogicalPlayback(
  state: PlaybackState,
  logical: LogicalActionId,
  available: ReadonlySet<string>,
  options: {
    manual?: boolean;
    dwellLoops?: (clipKey: string) => number;
  } = {}
): PlaybackState | null {
  const manual = options.manual ?? true;
  const postureNow = plannerPostureNow(state.actionKey);
  const queue = startPlaybackQueue(
    logical,
    postureNow,
    available,
    manual,
    options.dwellLoops
  );
  if (!queue) return null;
  const next = applyPlaybackQueue(state, queue);
  // Manual picks clear hover look-scrub pause so chained clips can advance.
  return manual ? { ...next, paused: false } : next;
}

function startRandomFrom(
  state: PlaybackState,
  fromPosture: PetPosture,
  previous: LogicalActionId | null,
  available: ReadonlySet<string>,
  options: {
    random?: () => number;
    dwellLoops?: (clipKey: string) => number;
  }
): PlaybackState {
  if (!state.enabled || state.paused) {
    return state;
  }
  const next = pickAutoplayMenuItem(
    available,
    fromPosture,
    previous,
    options.random
  );
  if (!next) return state;
  const queue = startPlaybackQueue(
    next,
    fromPosture,
    available,
    false,
    options.dwellLoops
  );
  if (!queue) return state;
  return applyPlaybackQueue(state, queue);
}

/**
 * Advance playback when the current video fires `ended`.
 * Dwell loops bump nonce only; mid-queue advances the next clip; queue end
 * settles posture then optionally starts a random autoplay intent.
 */
export function advancePlaybackOnEnded(
  state: PlaybackState,
  available: ReadonlySet<string>,
  options: {
    random?: () => number;
    dwellLoops?: (clipKey: string) => number;
  } = {}
): PlaybackState {
  if (state.paused) {
    return state;
  }

  const dwellLoops = options.dwellLoops ?? defaultDwellLoops;
  const queue = state.queue;
  const currentClip = queue?.clips[queue.index] ?? state.actionKey;

  if (queue) {
    const isFinalClip = queue.index === queue.clips.length - 1;
    if (isFinalClip && queue.holdTerminalLoop && isLoopClip(currentClip)) {
      return {
        ...state,
        playbackNonce: state.playbackNonce + 1,
      };
    }

    // Still dwelling on this loop clip — replay it.
    if (isLoopClip(currentClip) && queue.dwellRemaining > 1) {
      return {
        ...state,
        queue: {
          ...queue,
          dwellRemaining: queue.dwellRemaining - 1,
        },
        playbackNonce: state.playbackNonce + 1,
      };
    }

    const nextIndex = queue.index + 1;
    if (nextIndex < queue.clips.length) {
      const nextClip = queue.clips[nextIndex]!;
      const isLast = nextIndex === queue.clips.length - 1;
      const nextDwell =
        isLoopClip(nextClip) && isLast
          ? dwellLoops(nextClip)
          : isLoopClip(nextClip)
            ? 1
            : 1;
      const nextQueue: PlaybackQueue = {
        ...queue,
        index: nextIndex,
        dwellRemaining: normalizeDwell(nextDwell),
      };
      return {
        ...state,
        queue: nextQueue,
        actionKey: nextClip,
        posture: plannerPostureNow(nextClip),
        playbackNonce: state.playbackNonce + 1,
      };
    }

    // Queue finished — settle posture and resume autoplay.
    const endingPosture = queue.endingPosture;
    const finishedLogical = queue.logical;
    const wasManual = queue.manual;
    const settled: PlaybackState = {
      ...state,
      queue: null,
      posture: endingPosture,
      logicalActionId: finishedLogical ?? state.logicalActionId,
    };

    return startRandomFrom(
      settled,
      endingPosture,
      wasManual ? finishedLogical : state.previousLogical,
      available,
      options
    );
  }

  // No queue (e.g. one-shot without planner) — try autoplay from posture.
  return startRandomFrom(
    state,
    state.posture,
    state.previousLogical,
    available,
    options
  );
}

/**
 * Simulate N consecutive `ended` events (e.g. drain a transition → loop).
 * Useful for table-driven tests of full chains.
 */
export function advancePlaybackUntil(
  state: PlaybackState,
  available: ReadonlySet<string>,
  predicate: (next: PlaybackState) => boolean,
  options: {
    random?: () => number;
    dwellLoops?: (clipKey: string) => number;
    maxSteps?: number;
  } = {}
): PlaybackState {
  const maxSteps = options.maxSteps ?? 32;
  let current = state;
  for (let i = 0; i < maxSteps; i += 1) {
    if (predicate(current)) return current;
    const next = advancePlaybackOnEnded(current, available, options);
    if (next === current || next.playbackNonce === current.playbackNonce) {
      // No progress (paused / disabled with nowhere to go).
      return next;
    }
    current = next;
  }
  return current;
}
