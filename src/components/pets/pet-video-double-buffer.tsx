import { cn } from '@/lib/utils';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MutableRefObject,
} from 'react';

type PetVideoDoubleBufferProps = {
  src: string;
  /** Changes when the clip identity or a dwell replay should restart. */
  srcKey: string;
  poster: string;
  loop: boolean;
  className?: string;
  ariaLabel: string;
  videoRef: MutableRefObject<HTMLVideoElement | null>;
  onReady: (video: HTMLVideoElement) => void;
  onEnded: () => void;
  onError: () => void;
};

/** play() rejects with AbortError when pause()/load interrupts it — expected during swaps. */
function safePlay(video: HTMLVideoElement) {
  try {
    const result = video.play();
    if (result && typeof result.catch === 'function') {
      void result.catch(() => {
        /* AbortError / NotAllowedError during src swaps */
      });
    }
  } catch {
    /* ignore synchronous play failures */
  }
}

function safePause(video: HTMLVideoElement) {
  try {
    video.pause();
  } catch {
    /* ignore pause races during src swaps */
  }
}

function safeSeek(video: HTMLVideoElement, time: number) {
  try {
    video.currentTime = time;
  } catch {
    /* ignore seek races */
  }
}

/** Pin near the last decoded frame so ended WebMs do not flash frame 0. */
function holdLastFrame(video: HTMLVideoElement) {
  safePause(video);
  if (Number.isFinite(video.duration) && video.duration > 0) {
    safeSeek(video, Math.max(0, video.duration - 0.05));
  }
}

/** Wait until the browser has painted a decoded video frame. */
function whenFramePainted(video: HTMLVideoElement, callback: () => void) {
  const withFrameCb = video as HTMLVideoElement & {
    requestVideoFrameCallback?: (
      cb: (now: number, meta: unknown) => void
    ) => number;
  };
  if (typeof withFrameCb.requestVideoFrameCallback === 'function') {
    withFrameCb.requestVideoFrameCallback(() => {
      callback();
    });
    return;
  }
  requestAnimationFrame(() => {
    requestAnimationFrame(callback);
  });
}

/**
 * Keeps two permanently mounted `<video>` nodes and swaps clips imperatively.
 *
 * React never remounts the video DOM when `src` changes. The hidden buffer
 * loads the next clip, paints a decoded frame, rises above the outgoing clip,
 * then the outgoing layer is retired after two animation frames.
 */
export function PetVideoDoubleBuffer({
  src,
  srcKey,
  poster,
  loop,
  className,
  ariaLabel,
  videoRef,
  onReady,
  onEnded,
  onError,
}: PetVideoDoubleBufferProps) {
  const firstRef = useRef<HTMLVideoElement>(null);
  const secondRef = useRef<HTMLVideoElement>(null);
  const refs = [firstRef, secondRef] as const;

  const slotSrcRef = useRef<[string, string]>(['', '']);
  const visibleSlotRef = useRef(0);
  const pendingSlotRef = useRef<number | null>(null);
  const retiringSlotRef = useRef<number | null>(null);
  const holdingEndedSlotRef = useRef<number | null>(null);
  const endedForKeyRef = useRef<string | null>(null);
  const lastPlayedKeyRef = useRef<string | null>(null);
  const revealGenerationRef = useRef(0);
  const loadGenerationRef = useRef(0);
  const retireRafRef = useRef<number | null>(null);

  const srcRef = useRef(src);
  const srcKeyRef = useRef(srcKey);
  const loopRef = useRef(loop);
  const onReadyRef = useRef(onReady);
  const onEndedRef = useRef(onEnded);
  const onErrorRef = useRef(onError);

  // Minimal React state for className / aria updates only — never drives remounts.
  const [visibleSlot, setVisibleSlot] = useState(0);
  const [retiringSlot, setRetiringSlot] = useState<number | null>(null);
  const [slotHasSrc, setSlotHasSrc] = useState<[boolean, boolean]>([
    false,
    false,
  ]);

  useEffect(() => {
    srcRef.current = src;
    srcKeyRef.current = srcKey;
    loopRef.current = loop;
    onReadyRef.current = onReady;
    onEndedRef.current = onEnded;
    onErrorRef.current = onError;
  }, [src, srcKey, loop, onReady, onEnded, onError]);

  const cancelRetire = () => {
    if (retireRafRef.current != null) {
      cancelAnimationFrame(retireRafRef.current);
      retireRafRef.current = null;
    }
  };

  const syncSlotHasSrc = () => {
    setSlotHasSrc([
      Boolean(slotSrcRef.current[0]),
      Boolean(slotSrcRef.current[1]),
    ]);
  };

  const applyLoopFlags = (activeSlot: number) => {
    for (let index = 0; index < refs.length; index += 1) {
      const video = refs[index]?.current;
      if (!video) continue;
      video.loop = loopRef.current && index === activeSlot;
    }
  };

  const retireOutgoing = (outgoing: number) => {
    cancelRetire();
    retiringSlotRef.current = outgoing;
    setRetiringSlot(outgoing);

    // Keep the paused outgoing frame under the incoming clip for two frames so
    // the compositor never composites an empty hole during the handoff.
    retireRafRef.current = requestAnimationFrame(() => {
      retireRafRef.current = requestAnimationFrame(() => {
        retireRafRef.current = null;
        if (retiringSlotRef.current !== outgoing) return;
        const video = refs[outgoing]?.current;
        if (video) safePause(video);
        retiringSlotRef.current = null;
        setRetiringSlot(null);
      });
    });
  };

  const revealSlot = (slotIndex: number, video: HTMLVideoElement) => {
    if (slotSrcRef.current[slotIndex] !== srcRef.current) return;
    if (
      pendingSlotRef.current !== slotIndex &&
      visibleSlotRef.current !== slotIndex
    ) {
      return;
    }
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;

    const generation = ++revealGenerationRef.current;
    whenFramePainted(video, () => {
      if (generation !== revealGenerationRef.current) return;
      if (slotSrcRef.current[slotIndex] !== srcRef.current) return;

      try {
        video.removeAttribute('poster');
      } catch {
        /* ignore */
      }

      const previous = visibleSlotRef.current;
      holdingEndedSlotRef.current = null;
      endedForKeyRef.current = null;
      lastPlayedKeyRef.current = srcKeyRef.current;
      pendingSlotRef.current = null;
      visibleSlotRef.current = slotIndex;
      videoRef.current = video;
      applyLoopFlags(slotIndex);
      onReadyRef.current(video);
      setVisibleSlot(slotIndex);

      if (video.paused) {
        safePlay(video);
      }

      if (previous !== slotIndex && slotSrcRef.current[previous]) {
        retireOutgoing(previous);
      }
    });
  };

  const loadIntoSlot = (
    target: number,
    nextSrc: string,
    seekToStart: boolean
  ) => {
    const video = refs[target]?.current;
    if (!video) return;

    cancelRetire();
    if (retiringSlotRef.current === target) {
      retiringSlotRef.current = null;
      setRetiringSlot(null);
    }

    const generation = ++loadGenerationRef.current;
    pendingSlotRef.current = target;
    holdingEndedSlotRef.current = null;
    endedForKeyRef.current = null;

    const alreadyLoaded = slotSrcRef.current[target] === nextSrc;
    slotSrcRef.current[target] = nextSrc;
    syncSlotHasSrc();

    if (alreadyLoaded) {
      if (seekToStart) {
        safeSeek(video, 0);
      }
      safePlay(video);
      revealSlot(target, video);
      return;
    }

    try {
      video.removeAttribute('poster');
    } catch {
      /* ignore */
    }

    // Imperative src assignment — React never remounts this node.
    if (video.getAttribute('src') !== nextSrc) {
      video.setAttribute('src', nextSrc);
      try {
        video.load();
      } catch {
        /* ignore */
      }
    }

    const tryReveal = () => {
      if (generation !== loadGenerationRef.current) return;
      if (pendingSlotRef.current !== target) return;
      if (slotSrcRef.current[target] !== srcRef.current) return;
      safePlay(video);
      revealSlot(target, video);
    };

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      tryReveal();
      return;
    }

    const onLoadedData = () => {
      video.removeEventListener('loadeddata', onLoadedData);
      tryReveal();
    };
    video.addEventListener('loadeddata', onLoadedData);
  };

  // Drive clip swaps from props without remounting video nodes.
  useLayoutEffect(() => {
    if (!src) return;

    const visible = visibleSlotRef.current;
    const visibleSrc = slotSrcRef.current[visible];

    // Same clip already visible and already playing this key — nothing to do.
    if (visibleSrc === src && lastPlayedKeyRef.current === srcKey) {
      videoRef.current = refs[visible]?.current ?? null;
      applyLoopFlags(visible);
      return;
    }

    // First paint: load into the visible slot.
    if (lastPlayedKeyRef.current === null && !visibleSrc) {
      loadIntoSlot(visible, src, false);
      return;
    }

    // Same URL dwell/replay, or different clip: always use the hidden slot so
    // the visible decoded frame stays on screen until the handoff.
    const target = visibleSrc ? 1 - visible : visible;
    const seekToStart = slotSrcRef.current[target] === src;
    loadIntoSlot(target, src, seekToStart);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional prop-driven imperative controller
  }, [src, srcKey]);

  useEffect(() => {
    applyLoopFlags(visibleSlotRef.current);
  }, [loop]);

  useEffect(() => {
    return () => {
      cancelRetire();
      revealGenerationRef.current += 1;
      loadGenerationRef.current += 1;
    };
  }, []);

  // Optional first-mount poster only before any clip has been revealed.
  const showPoster =
    Boolean(poster) &&
    lastPlayedKeyRef.current === null &&
    !slotHasSrc[0] &&
    !slotHasSrc[1];

  return (
    <>
      {refs.map((ref, index) => {
        const isVisible = index === visibleSlot;
        const isRetiring = index === retiringSlot;
        const hasSrc = slotHasSrc[index];
        const showLayer = isVisible || isRetiring;

        return (
          <video
            key={`slot-${index}`}
            ref={ref}
            crossOrigin="anonymous"
            poster={showPoster && index === 0 ? poster : undefined}
            className={cn(
              className,
              showLayer
                ? isVisible
                  ? 'visible z-10'
                  : 'visible z-0'
                : 'invisible z-0'
            )}
            autoPlay={false}
            muted
            playsInline
            preload="auto"
            onLoadedData={(event) => {
              const video = event.currentTarget;
              if (holdingEndedSlotRef.current === index) {
                holdLastFrame(video);
                return;
              }
              if (
                pendingSlotRef.current === index ||
                (visibleSlotRef.current === index &&
                  pendingSlotRef.current === null)
              ) {
                safePlay(video);
                revealSlot(index, video);
              }
            }}
            onCanPlay={(event) => {
              const video = event.currentTarget;
              if (holdingEndedSlotRef.current === index) {
                holdLastFrame(video);
                return;
              }
              if (
                (visibleSlotRef.current === index ||
                  pendingSlotRef.current === index) &&
                video.paused
              ) {
                safePlay(video);
              }
            }}
            onPlaying={(event) => {
              if (holdingEndedSlotRef.current === index) {
                holdLastFrame(event.currentTarget);
                return;
              }
              if (pendingSlotRef.current === index) {
                revealSlot(index, event.currentTarget);
              }
            }}
            onEnded={() => {
              if (visibleSlotRef.current !== index) return;
              if (retiringSlotRef.current === index) return;
              const playKey = lastPlayedKeyRef.current;
              if (!playKey || endedForKeyRef.current === playKey) {
                const video = refs[index]?.current;
                if (video) holdLastFrame(video);
                return;
              }
              endedForKeyRef.current = playKey;
              holdingEndedSlotRef.current = index;
              const video = refs[index]?.current;
              if (video) holdLastFrame(video);
              onEndedRef.current();
            }}
            onError={() => {
              if (slotSrcRef.current[index] === srcRef.current) {
                onErrorRef.current();
              }
            }}
            aria-label={ariaLabel}
            aria-hidden={!isVisible}
            draggable={false}
            data-slot-has-src={hasSrc ? 'true' : 'false'}
          />
        );
      })}
    </>
  );
}
