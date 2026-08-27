import { useCallback, useEffect, useRef, useState } from 'react';
import {
  readPlaygroundLayout,
  writePlaygroundTimer,
  type CountdownTimerState,
} from './playground-layout-storage';

export const DEFAULT_COUNTDOWN_MS = 5 * 60 * 1000;

export const COUNTDOWN_PRESETS_MS = [
  1 * 60 * 1000,
  5 * 60 * 1000,
  10 * 60 * 1000,
  25 * 60 * 1000,
] as const;

function clampRemaining(ms: number) {
  return Math.max(0, Math.ceil(ms / 1000) * 1000);
}

function hydrateInitial(): {
  durationMs: number;
  remainingMs: number;
  isRunning: boolean;
  endsAt: number | null;
} {
  const stored = readPlaygroundLayout()?.timer;
  if (!stored) {
    return {
      durationMs: DEFAULT_COUNTDOWN_MS,
      remainingMs: DEFAULT_COUNTDOWN_MS,
      isRunning: false,
      endsAt: null,
    };
  }

  if (stored.isRunning && stored.endsAt != null) {
    const left = stored.endsAt - Date.now();
    if (left <= 0) {
      return {
        durationMs: stored.durationMs,
        remainingMs: 0,
        isRunning: false,
        endsAt: null,
      };
    }
    return {
      durationMs: stored.durationMs,
      remainingMs: clampRemaining(left),
      isRunning: true,
      endsAt: stored.endsAt,
    };
  }

  return {
    durationMs: stored.durationMs,
    remainingMs: Math.min(stored.remainingMs, stored.durationMs),
    isRunning: false,
    endsAt: null,
  };
}

/**
 * Deadline-based countdown timer for the playground Widgets panel.
 */
export function useCountdownTimer() {
  const [durationMs, setDurationMsState] = useState(DEFAULT_COUNTDOWN_MS);
  const [remainingMs, setRemainingMs] = useState(DEFAULT_COUNTDOWN_MS);
  const [isRunning, setIsRunning] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const endsAtRef = useRef<number | null>(null);

  useEffect(() => {
    const initial = hydrateInitial();
    setDurationMsState(initial.durationMs);
    setRemainingMs(initial.remainingMs);
    setIsRunning(initial.isRunning);
    endsAtRef.current = initial.endsAt;
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    const payload: CountdownTimerState = {
      durationMs,
      remainingMs,
      isRunning,
      endsAt: endsAtRef.current,
    };
    writePlaygroundTimer(payload);
  }, [durationMs, remainingMs, isRunning, hydrated]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const tick = () => {
      const endsAt = endsAtRef.current;
      if (endsAt == null) {
        return;
      }
      const left = endsAt - Date.now();
      if (left <= 0) {
        endsAtRef.current = null;
        setRemainingMs(0);
        setIsRunning(false);
        return;
      }
      setRemainingMs(clampRemaining(left));
    };

    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [isRunning]);

  const start = useCallback(() => {
    if (isRunning) {
      return;
    }
    const left = remainingMs > 0 ? remainingMs : durationMs;
    if (left <= 0) {
      return;
    }
    endsAtRef.current = Date.now() + left;
    setRemainingMs(left);
    setIsRunning(true);
  }, [durationMs, isRunning, remainingMs]);

  const pause = useCallback(() => {
    if (!isRunning) {
      return;
    }
    const endsAt = endsAtRef.current;
    if (endsAt != null) {
      setRemainingMs(clampRemaining(endsAt - Date.now()));
    }
    endsAtRef.current = null;
    setIsRunning(false);
  }, [isRunning]);

  const reset = useCallback(() => {
    endsAtRef.current = null;
    setIsRunning(false);
    setRemainingMs(durationMs);
  }, [durationMs]);

  const setDurationMs = useCallback(
    (next: number) => {
      if (isRunning) {
        return;
      }
      const clamped = Math.max(
        1000,
        Math.min(99 * 60 * 1000, Math.round(next))
      );
      setDurationMsState(clamped);
      setRemainingMs(clamped);
      endsAtRef.current = null;
    },
    [isRunning]
  );

  return {
    durationMs,
    remainingMs,
    isRunning,
    isDone: !isRunning && remainingMs === 0 && durationMs > 0,
    start,
    pause,
    reset,
    setDurationMs,
  };
}

export function formatCountdownClock(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
