import { useEffect, useRef, type RefObject } from 'react';

export type LookPointerSource = 'mouse' | 'hand';

/** EMA for hand look control (mouse stays direct). */
export const HAND_EMA_ALPHA = 0.25;
/** Look window: left=0.25, front=0.5, right=0.75 of duration. */
export const LOOK_CENTER = 0.5;
export const LOOK_SPAN = 0.5;

/**
 * Force-visible fallback when metadata/canplay never arrives (VP9 WebM races,
 * stalled CDN decode). Keeps floating pets from staying at opacity 0 forever.
 */
export const VIDEO_READY_FALLBACK_MS = 800;

export function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function lookProgressFromInputX(inputX: number) {
  return LOOK_CENTER + (clamp01(inputX) - 0.5) * LOOK_SPAN;
}

type UseLookVideoScrubOptions = {
  videoRef: RefObject<HTMLVideoElement | null>;
  /** True when the current clip uses look-scrub interaction. */
  enabled: boolean;
  /** Re-bind video listeners when pet/action/url identity changes. */
  resetKey: string;
  /**
   * Whether non-scrub / resumed playback should HTML-loop.
   * Autoplay sequencers that advance on `ended` should pass false.
   */
  loop?: boolean;
  /** Fired once the clip can be shown (dimensions known, playing, or timeout). */
  onReady?: (video: HTMLVideoElement) => void;
};

type UseLookVideoScrubResult = {
  handlePointerX: (normalizedX: number, source: LookPointerSource) => void;
  endPointer: (source: LookPointerSource) => void;
};

function hasPlayableSource(video: HTMLVideoElement) {
  const src = video.currentSrc || video.getAttribute('src') || '';
  return src.length > 0 && !video.error;
}

function hasVideoDimensions(video: HTMLVideoElement) {
  return video.videoWidth > 0 && video.videoHeight > 0;
}

/** `play()` returns a promise — sync try/catch does not catch NotSupportedError. */
function playVideo(video: HTMLVideoElement) {
  if (!hasPlayableSource(video)) {
    return;
  }
  try {
    const playPromise = video.play();
    if (playPromise !== undefined) {
      void playPromise.catch(() => {
        /* AbortError / NotSupportedError during src swaps — ignore. */
      });
    }
  } catch {
    /* ignore */
  }
}

/**
 * Shared look-scrub controller: loop until interaction, then seek from X;
 * ending the pointer resumes loop autoplay.
 */
export function useLookVideoScrub({
  videoRef,
  enabled,
  resetKey,
  loop = true,
  onReady,
}: UseLookVideoScrubOptions): UseLookVideoScrubResult {
  const targetTimeRef = useRef(0);
  const seekingRef = useRef(false);
  const activeSourceRef = useRef<LookPointerSource | null>(null);
  const handSmoothedXRef = useRef<number | null>(null);
  const durationRef = useRef(0);
  const lookScrubActiveRef = useRef(false);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const loopRef = useRef(loop);
  loopRef.current = loop;

  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  const seekApiRef = useRef<{
    seekToProgress: (progress: number) => void;
    resumeAutoplay: () => void;
  }>({
    seekToProgress: () => undefined,
    resumeAutoplay: () => undefined,
  });

  const enterLookScrub = () => {
    if (lookScrubActiveRef.current) {
      return;
    }
    lookScrubActiveRef.current = true;
    const video = videoRef.current;
    if (!video) {
      return;
    }
    video.loop = false;
    try {
      video.pause();
    } catch {
      /* ignore */
    }
  };

  const exitLookScrub = () => {
    if (!lookScrubActiveRef.current) {
      return;
    }
    lookScrubActiveRef.current = false;
    seekingRef.current = false;
    seekApiRef.current.resumeAutoplay();
  };

  const handlePointerX = (normalizedX: number, source: LookPointerSource) => {
    if (!enabledRef.current) {
      return;
    }

    enterLookScrub();

    let inputX = clamp01(normalizedX);

    if (source === 'hand') {
      if (handSmoothedXRef.current === null) {
        handSmoothedXRef.current = inputX;
      } else {
        handSmoothedXRef.current +=
          (inputX - handSmoothedXRef.current) * HAND_EMA_ALPHA;
      }
      inputX = handSmoothedXRef.current;
    } else {
      handSmoothedXRef.current = null;
    }

    activeSourceRef.current = source;
    seekApiRef.current.seekToProgress(lookProgressFromInputX(inputX));
  };

  const endPointer = (source: LookPointerSource) => {
    if (activeSourceRef.current !== source) {
      return;
    }
    if (source === 'hand') {
      handSmoothedXRef.current = null;
    }
    activeSourceRef.current = null;
    exitLookScrub();
  };

  const handlePointerXRef = useRef(handlePointerX);
  const endPointerRef = useRef(endPointer);
  handlePointerXRef.current = handlePointerX;
  endPointerRef.current = endPointer;

  useEffect(() => {
    durationRef.current = 0;
    targetTimeRef.current = 0;
    seekingRef.current = false;
    lookScrubActiveRef.current = false;
    handSmoothedXRef.current = null;
    activeSourceRef.current = null;
  }, [resetKey]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    let cancelled = false;
    let readyNotified = false;

    const resumeAutoplay = () => {
      if (cancelled) {
        return;
      }
      video.loop = loopRef.current;
      playVideo(video);
    };

    const notifyReady = () => {
      if (cancelled || readyNotified) {
        return;
      }
      readyNotified = true;
      onReadyRef.current?.(video);
    };

    /** Prefer showing once decode has dimensions; also accept playing/timeupdate. */
    const maybeReadyFromPlayback = () => {
      if (cancelled || readyNotified) {
        return;
      }
      if (
        hasVideoDimensions(video) ||
        video.readyState >= 2 ||
        !video.paused ||
        video.currentTime > 0
      ) {
        notifyReady();
      }
    };

    if (!enabled) {
      // Double-buffer owns playback for non-scrub clips. Do not play/pause here
      // or a menu pick (e.g. Sleep from idle) gets fought by resumeAutoplay on
      // the previous look-scrub element.
      lookScrubActiveRef.current = false;
      seekApiRef.current = {
        seekToProgress: () => undefined,
        resumeAutoplay: () => undefined,
      };

      const onDims = () => {
        if (
          !cancelled &&
          !readyNotified &&
          (hasVideoDimensions(video) || video.readyState >= 2)
        ) {
          notifyReady();
        }
      };

      if (hasVideoDimensions(video) || video.readyState >= 2) {
        notifyReady();
      } else {
        video.addEventListener('loadedmetadata', onDims);
        video.addEventListener('loadeddata', onDims);
      }

      return () => {
        cancelled = true;
        video.removeEventListener('loadedmetadata', onDims);
        video.removeEventListener('loadeddata', onDims);
      };
    }

    const requestSeek = () => {
      if (!lookScrubActiveRef.current || seekingRef.current || cancelled) {
        return;
      }
      const duration = durationRef.current;
      if (!Number.isFinite(duration) || duration <= 0) {
        return;
      }
      if (Math.abs(video.currentTime - targetTimeRef.current) < 0.001) {
        return;
      }
      seekingRef.current = true;
      try {
        video.currentTime = targetTimeRef.current;
      } catch {
        seekingRef.current = false;
      }
    };

    const onSeeked = () => {
      seekingRef.current = false;
      if (!lookScrubActiveRef.current || cancelled) {
        return;
      }
      if (Math.abs(video.currentTime - targetTimeRef.current) > 0.001) {
        requestSeek();
      }
    };

    seekApiRef.current = {
      seekToProgress: (progress) => {
        if (!lookScrubActiveRef.current || cancelled) {
          return;
        }
        const duration = durationRef.current;
        if (!Number.isFinite(duration) || duration <= 0) {
          return;
        }
        targetTimeRef.current = clamp01(progress) * duration;
        try {
          video.pause();
        } catch {
          /* ignore */
        }
        requestSeek();
      },
      resumeAutoplay,
    };

    video.addEventListener('seeked', onSeeked);

    const onDurationChange = () => {
      if (cancelled) {
        return;
      }
      const duration = video.duration;
      if (Number.isFinite(duration) && duration > 0) {
        durationRef.current = duration;
      }
    };

    const initFromMetadata = () => {
      if (cancelled) {
        return;
      }
      // WebM duration can be Infinity until more data arrives; still mark ready
      // so floating pets are not stuck at opacity 0 waiting for a scrub clock.
      onDurationChange();
      lookScrubActiveRef.current = false;
      resumeAutoplay();
      notifyReady();
    };

    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('loadedmetadata', initFromMetadata);
    video.addEventListener('loadeddata', maybeReadyFromPlayback);
    video.addEventListener('canplay', maybeReadyFromPlayback);
    video.addEventListener('playing', maybeReadyFromPlayback);
    video.addEventListener('timeupdate', maybeReadyFromPlayback);

    if (video.readyState >= 1 || hasVideoDimensions(video)) {
      initFromMetadata();
    } else {
      // Kick decode; autoPlay alone can stall until a layout/devtools wake-up.
      resumeAutoplay();
    }

    const fallbackTimer = window.setTimeout(() => {
      if (cancelled || readyNotified) {
        return;
      }
      onDurationChange();
      resumeAutoplay();
      notifyReady();
    }, VIDEO_READY_FALLBACK_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(fallbackTimer);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('loadedmetadata', initFromMetadata);
      video.removeEventListener('loadeddata', maybeReadyFromPlayback);
      video.removeEventListener('canplay', maybeReadyFromPlayback);
      video.removeEventListener('playing', maybeReadyFromPlayback);
      video.removeEventListener('timeupdate', maybeReadyFromPlayback);
      try {
        video.pause();
      } catch {
        /* ignore */
      }
    };
  }, [enabled, loop, resetKey, videoRef]);

  return {
    handlePointerX: (normalizedX, source) =>
      handlePointerXRef.current(normalizedX, source),
    endPointer: (source) => endPointerRef.current(source),
  };
}
