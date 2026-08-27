import { Button } from '@/components/ui/button';
import { handConfig } from '@/config/hand-config';
import type {
  DrawingUtils as DrawingUtilsType,
  GestureRecognizer as GestureRecognizerType,
  HandLandmarker as HandLandmarkerType,
  HandLandmarkerResult,
} from '@mediapipe/tasks-vision';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { PlaygroundFloatingPanel } from './playground-floating-panel';
import type { PanelPosition } from './use-panel-drag';

const ENABLE_GESTURE_RECOGNITION = handConfig.enableGestureRecognition;

type HandLandmarkerModule =
  typeof import('@mediapipe/tasks-vision').HandLandmarker;

const MEDIAPIPE_VERSION = '0.10.35';
const WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;
const HAND_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const GESTURE_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task';

const CAMERA_CONSTRAINTS: MediaStreamConstraints = {
  video: { width: 640, height: 480, facingMode: 'user' },
  audio: false,
};

/** MediaPipe index fingertip landmark. */
const INDEX_FINGERTIP = 8;

const ALLOWED_GESTURES = [
  'Closed_Fist',
  'Open_Palm',
  'Pointing_Up',
  'Victory',
] as const;

type AllowedGesture = (typeof ALLOWED_GESTURES)[number];

const GESTURE_LABEL: Record<AllowedGesture, string> = {
  Closed_Fist: 'Closed Fist',
  Open_Palm: 'Open Palm',
  Pointing_Up: 'Pointing Up',
  Victory: 'Victory',
};

const NO_GESTURE_LABEL = 'No gesture';

type DetectionStatus =
  | 'idle'
  | 'loading_model'
  | 'waiting_for_camera'
  | 'hand_detected'
  | 'no_hand'
  | 'camera_unavailable';

const STATUS_LABEL: Record<DetectionStatus, string> = {
  idle: 'Ready',
  loading_model: 'Loading model',
  waiting_for_camera: 'Waiting for camera',
  hand_detected: 'Hand detected',
  no_hand: 'No hand',
  camera_unavailable: 'Camera unavailable',
};

type CameraHandPreviewProps = {
  /** Mirrored normalized fingertip X in 0..1. */
  onHandPointerX?: (normalizedX: number) => void;
  /** Fired when the hand leaves the frame. */
  onHandPointerLost?: () => void;
  boundsRef: RefObject<HTMLElement | null>;
  position: PanelPosition | null;
  onPositionChange: (position: PanelPosition) => void;
  onClose: () => void;
};

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function isAllowedGesture(name: string): name is AllowedGesture {
  return (ALLOWED_GESTURES as readonly string[]).includes(name);
}

function labelForGestureCategory(categoryName: string | undefined) {
  if (!categoryName || !isAllowedGesture(categoryName)) {
    return NO_GESTURE_LABEL;
  }
  return GESTURE_LABEL[categoryName];
}

/** MediaPipe/TFLite logs INFO via console.error; Next overlays treat that as a failure. */
function isTfliteDelegateInfo(args: unknown[]) {
  return args.some((arg) => {
    const text = typeof arg === 'string' ? arg : String(arg);
    return (
      text.includes('TensorFlow Lite') ||
      text.includes('XNNPACK') ||
      text.includes('Created TensorFlow')
    );
  });
}

type ConsoleMethod = (...args: unknown[]) => void;

let tfliteNoiseFilterDepth = 0;
let originalConsole: {
  error: ConsoleMethod;
  warn: ConsoleMethod;
  info: ConsoleMethod;
  log: ConsoleMethod;
} | null = null;

function installTfliteNoiseFilter() {
  if (tfliteNoiseFilterDepth === 0) {
    originalConsole = {
      error: console.error,
      warn: console.warn,
      info: console.info,
      log: console.log,
    };
    const wrap =
      (method: ConsoleMethod) =>
      (...args: unknown[]) => {
        if (isTfliteDelegateInfo(args)) {
          return;
        }
        method(...args);
      };
    console.error = wrap(originalConsole.error);
    console.warn = wrap(originalConsole.warn);
    console.info = wrap(originalConsole.info);
    console.log = wrap(originalConsole.log);
  }
  tfliteNoiseFilterDepth += 1;
}

function uninstallTfliteNoiseFilter() {
  if (tfliteNoiseFilterDepth === 0) {
    return;
  }
  tfliteNoiseFilterDepth -= 1;
  if (tfliteNoiseFilterDepth === 0 && originalConsole) {
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;
    console.log = originalConsole.log;
    originalConsole = null;
  }
}

/**
 * Bottom-right webcam + MediaPipe landmarks + gesture labels.
 * Sends mirrored index-tip X for pet look-direction control.
 */
export function CameraHandPreview({
  onHandPointerX,
  onHandPointerLost,
  boundsRef,
  position,
  onPositionChange,
  onClose,
}: CameraHandPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<HandLandmarkerType | null>(null);
  const gestureRecognizerRef = useRef<GestureRecognizerType | null>(null);
  const drawingUtilsRef = useRef<DrawingUtilsType | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const runningRef = useRef(false);
  const statusRef = useRef<DetectionStatus>('idle');
  const hadHandRef = useRef(false);
  const gestureLabelRef = useRef(NO_GESTURE_LABEL);

  const onHandPointerXRef = useRef(onHandPointerX);
  const onHandPointerLostRef = useRef(onHandPointerLost);
  onHandPointerXRef.current = onHandPointerX;
  onHandPointerLostRef.current = onHandPointerLost;

  const [status, setStatus] = useState<DetectionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [gestureLabel, setGestureLabel] = useState(NO_GESTURE_LABEL);

  const updateStatus = (next: DetectionStatus) => {
    if (statusRef.current === next) {
      return;
    }
    statusRef.current = next;
    setStatus(next);
  };

  const updateGestureLabel = (next: string) => {
    if (gestureLabelRef.current === next) {
      return;
    }
    gestureLabelRef.current = next;
    setGestureLabel(next);
  };

  const closeVisionTasks = () => {
    const landmarker = landmarkerRef.current;
    if (landmarker) {
      landmarker.close();
      landmarkerRef.current = null;
    }
    const gestureRecognizer = gestureRecognizerRef.current;
    if (gestureRecognizer) {
      gestureRecognizer.close();
      gestureRecognizerRef.current = null;
    }
    drawingUtilsRef.current = null;
  };

  const emitHandLost = () => {
    updateGestureLabel(NO_GESTURE_LABEL);
    if (!hadHandRef.current) {
      return;
    }
    hadHandRef.current = false;
    onHandPointerLostRef.current?.();
  };

  const stopDetection = () => {
    runningRef.current = false;

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const stream = streamRef.current;
    if (stream) {
      for (const track of stream.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }

    const video = videoRef.current;
    if (video) {
      video.srcObject = null;
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }

    closeVisionTasks();
    lastVideoTimeRef.current = -1;
    emitHandLost();
    if (ENABLE_GESTURE_RECOGNITION) {
      uninstallTfliteNoiseFilter();
    }

    setIsRunning(false);
    updateStatus('idle');
    setErrorMessage(null);
  };

  useEffect(() => {
    return () => {
      runningRef.current = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      const stream = streamRef.current;
      if (stream) {
        for (const track of stream.getTracks()) {
          track.stop();
        }
        streamRef.current = null;
      }
      const video = videoRef.current;
      if (video) {
        video.srcObject = null;
      }
      const landmarker = landmarkerRef.current;
      if (landmarker) {
        landmarker.close();
        landmarkerRef.current = null;
      }
      const gestureRecognizer = gestureRecognizerRef.current;
      if (gestureRecognizer) {
        gestureRecognizer.close();
        gestureRecognizerRef.current = null;
      }
      drawingUtilsRef.current = null;
      if (ENABLE_GESTURE_RECOGNITION) {
        uninstallTfliteNoiseFilter();
      }
      if (hadHandRef.current) {
        hadHandRef.current = false;
        onHandPointerLostRef.current?.();
      }
    };
  }, []);

  const drawResults = (
    result: HandLandmarkerResult,
    HandLandmarker: HandLandmarkerModule
  ) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const drawingUtils = drawingUtilsRef.current;
    if (!video || !canvas || !drawingUtils) {
      return;
    }

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) {
      return;
    }

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, width, height);

    for (const landmarks of result.landmarks) {
      drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
        color: '#22c55e',
        lineWidth: 3,
      });
      drawingUtils.drawLandmarks(landmarks, {
        color: '#ef4444',
        lineWidth: 1,
        radius: 3,
      });
    }
  };

  const detectFrame = (HandLandmarker: HandLandmarkerModule) => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    if (!runningRef.current || !video || !landmarker) {
      return;
    }

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      if (video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;
        // Separate timestamps per task — MediaPipe requires each runner’s
        // VIDEO timestamps to increase independently.
        const landmarkTs = performance.now();
        const result = landmarker.detectForVideo(video, landmarkTs);
        const hand = result.landmarks[0];
        const tip = hand?.[INDEX_FINGERTIP];
        const hasHand = Boolean(tip);

        updateStatus(hasHand ? 'hand_detected' : 'no_hand');
        drawResults(result, HandLandmarker);

        let gestureCategory: string | undefined;
        if (ENABLE_GESTURE_RECOGNITION) {
          const gestureRecognizer = gestureRecognizerRef.current;
          if (gestureRecognizer) {
            try {
              const gestureResult = gestureRecognizer.recognizeForVideo(
                video,
                performance.now()
              );
              gestureCategory = gestureResult.gestures[0]?.[0]?.categoryName;
            } catch {
              // Gesture model can throw on a bad frame; keep landmarks/look alive.
              gestureCategory = undefined;
            }
          }
        }

        if (hasHand && tip) {
          hadHandRef.current = true;
          // Mirrored camera: user-left → low X, user-right → high X.
          onHandPointerXRef.current?.(clamp01(1 - tip.x));
          if (ENABLE_GESTURE_RECOGNITION) {
            updateGestureLabel(labelForGestureCategory(gestureCategory));
          }
        } else {
          emitHandLost();
        }
      }
    }

    rafRef.current = requestAnimationFrame(() => detectFrame(HandLandmarker));
  };

  const startDetection = async () => {
    setErrorMessage(null);
    updateStatus('loading_model');
    setIsRunning(true);
    runningRef.current = true;
    updateGestureLabel(NO_GESTURE_LABEL);
    if (ENABLE_GESTURE_RECOGNITION) {
      installTfliteNoiseFilter();
    }

    try {
      const visionModule = await import('@mediapipe/tasks-vision');
      const { DrawingUtils, FilesetResolver, HandLandmarker } = visionModule;

      const vision = await FilesetResolver.forVisionTasks(WASM_URL);
      const landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: HAND_MODEL_URL,
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 1,
      });

      let gestureRecognizer: GestureRecognizerType | null = null;
      if (ENABLE_GESTURE_RECOGNITION) {
        gestureRecognizer =
          await visionModule.GestureRecognizer.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: GESTURE_MODEL_URL,
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numHands: 1,
          });
      }

      if (!runningRef.current) {
        landmarker.close();
        gestureRecognizer?.close();
        if (ENABLE_GESTURE_RECOGNITION) {
          uninstallTfliteNoiseFilter();
        }
        return;
      }

      landmarkerRef.current = landmarker;
      gestureRecognizerRef.current = gestureRecognizer;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas is unavailable');
      }
      drawingUtilsRef.current = new DrawingUtils(ctx);

      updateStatus('waiting_for_camera');

      const stream =
        await navigator.mediaDevices.getUserMedia(CAMERA_CONSTRAINTS);

      if (!runningRef.current) {
        for (const track of stream.getTracks()) {
          track.stop();
        }
        landmarker.close();
        gestureRecognizer?.close();
        landmarkerRef.current = null;
        gestureRecognizerRef.current = null;
        if (ENABLE_GESTURE_RECOGNITION) {
          uninstallTfliteNoiseFilter();
        }
        return;
      }

      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) {
        throw new Error('Video element is unavailable');
      }

      video.srcObject = stream;
      await video.play();

      // Warm up runners after the first frame is available so TFLite
      // delegate setup happens during start, not inside the RAF loop.
      await new Promise<void>((resolve) => {
        const warm = () => {
          if (!runningRef.current) {
            resolve();
            return;
          }
          if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            try {
              landmarker.detectForVideo(video, performance.now());
            } catch {
              /* ignore warm-up failures */
            }
            if (gestureRecognizer) {
              try {
                gestureRecognizer.recognizeForVideo(video, performance.now());
              } catch {
                /* ignore warm-up failures */
              }
            }
            resolve();
            return;
          }
          requestAnimationFrame(warm);
        };
        requestAnimationFrame(warm);
      });

      if (!runningRef.current) {
        if (ENABLE_GESTURE_RECOGNITION) {
          uninstallTfliteNoiseFilter();
        }
        return;
      }

      lastVideoTimeRef.current = -1;
      rafRef.current = requestAnimationFrame(() => detectFrame(HandLandmarker));
    } catch (error) {
      runningRef.current = false;
      setIsRunning(false);
      updateStatus('camera_unavailable');
      updateGestureLabel(NO_GESTURE_LABEL);

      const message =
        error instanceof DOMException &&
        (error.name === 'NotAllowedError' ||
          error.name === 'PermissionDeniedError')
          ? 'Camera permission denied'
          : error instanceof Error
            ? error.message
            : 'Camera unavailable';
      setErrorMessage(message);

      const stream = streamRef.current;
      if (stream) {
        for (const track of stream.getTracks()) {
          track.stop();
        }
        streamRef.current = null;
      }
      const video = videoRef.current;
      if (video) {
        video.srcObject = null;
      }
      closeVisionTasks();
      emitHandLost();
      if (ENABLE_GESTURE_RECOGNITION) {
        uninstallTfliteNoiseFilter();
      }
    }
  };

  return (
    <PlaygroundFloatingPanel
      title="Camera"
      anchor="bottom-right"
      boundsRef={boundsRef}
      position={position}
      onPositionChange={onPositionChange}
      onClose={onClose}
      className="w-[320px]"
      zIndexClassName="z-50"
      contentClassName="!p-0"
    >
      <div className="flex cursor-auto flex-col gap-0">
        <div className="overflow-hidden rounded-b-lg bg-black/80">
          <div className="relative aspect-[4/3] w-full bg-zinc-900">
            <div className="absolute inset-0 origin-center [transform:scaleX(-1)]">
              <video
                ref={videoRef}
                className="absolute inset-0 size-full object-cover"
                playsInline
                muted
                autoPlay
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 size-full object-cover"
              />
            </div>
            {isRunning && ENABLE_GESTURE_RECOGNITION ? (
              <div
                className="pointer-events-none absolute bottom-2 left-2 z-10 max-w-[calc(100%-1rem)] rounded-md bg-black/65 px-2 py-1 text-[11px] font-medium text-white shadow-sm backdrop-blur-sm"
                aria-live="polite"
              >
                Gesture: {gestureLabel}
              </div>
            ) : null}
            {!isRunning ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 p-3 text-center">
                <p className="text-sm font-medium text-white">Camera preview</p>
                <p className="text-xs text-white/75">
                  Start the camera, then move left/right to steer the pet&apos;s
                  look.
                </p>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-white/15 px-3 py-2">
            <div className="min-w-0">
              <output
                className="truncate text-xs font-medium text-white"
                aria-live="polite"
              >
                {STATUS_LABEL[status]}
              </output>
              {errorMessage ? (
                <p className="truncate text-[11px] text-red-300">
                  {errorMessage}
                </p>
              ) : null}
            </div>
            {!isRunning ? (
              <Button
                type="button"
                size="sm"
                className="h-8 shrink-0 px-3 text-xs"
                onClick={startDetection}
              >
                Start camera
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-8 shrink-0 px-3 text-xs"
                onClick={stopDetection}
              >
                Stop
              </Button>
            )}
          </div>
        </div>
      </div>
    </PlaygroundFloatingPanel>
  );
}
