/**
 * Pure placement math for fitting a detected subject into the final pose frame.
 */
import {
  ACTION_POSE_FRAME_HEIGHT,
  ACTION_POSE_FRAME_WIDTH,
  canonicalizeActionPoseType,
  type ActionPoseType,
} from '@/utils/pets/action-pose';

export type PoseFrameCropBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PoseFrameVerticalBias = 'center' | 'ground' | 'lower';

/** Inset from frame edges as a fraction of frame size. */
export const POSE_FRAME_SUBJECT_PADDING_RATIO = 0.08;

/**
 * Sleep Right: leave a bit more green above than below so the curled mass
 * sits slightly lower while staying horizontally centered.
 */
export const POSE_FRAME_SLEEP_VERTICAL_BIAS = 0.58;

export function poseFrameVerticalBias(
  poseType?: string | null
): PoseFrameVerticalBias {
  const canonical = poseType ? canonicalizeActionPoseType(poseType) : null;
  if (canonical === 'sleep_right') return 'lower';
  if (canonical === 'walk_left' || canonical === 'walk_right') return 'ground';
  return 'center';
}

export type ComputePoseFramePlacementInput = {
  subjectWidth: number;
  subjectHeight: number;
  frameWidth?: number;
  frameHeight?: number;
  poseType?: ActionPoseType | string | null;
  paddingRatio?: number;
  sleepVerticalBias?: number;
};

export type ComputePoseFramePlacementResult = {
  scale: number;
  placement: PoseFrameCropBox;
  verticalBias: PoseFrameVerticalBias;
};

/**
 * Scale a subject bbox into the frame with padding and pose-aware vertical bias.
 * Always centers horizontally.
 */
export function computePoseFramePlacement(
  input: ComputePoseFramePlacementInput
): ComputePoseFramePlacementResult {
  const frameWidth = input.frameWidth ?? ACTION_POSE_FRAME_WIDTH;
  const frameHeight = input.frameHeight ?? ACTION_POSE_FRAME_HEIGHT;
  const paddingRatio = input.paddingRatio ?? POSE_FRAME_SUBJECT_PADDING_RATIO;
  const sleepBias = input.sleepVerticalBias ?? POSE_FRAME_SLEEP_VERTICAL_BIAS;
  const verticalBias = poseFrameVerticalBias(input.poseType);

  const subjectWidth = Math.max(1, Math.round(input.subjectWidth));
  const subjectHeight = Math.max(1, Math.round(input.subjectHeight));
  const padX = Math.max(0, Math.round(frameWidth * paddingRatio));
  const padY = Math.max(0, Math.round(frameHeight * paddingRatio));
  const maxW = Math.max(1, frameWidth - padX * 2);
  const maxH = Math.max(1, frameHeight - padY * 2);

  const scale = Math.min(maxW / subjectWidth, maxH / subjectHeight);
  const placedWidth = Math.max(1, Math.round(subjectWidth * scale));
  const placedHeight = Math.max(1, Math.round(subjectHeight * scale));
  const x = Math.round((frameWidth - placedWidth) / 2);

  let y: number;
  if (verticalBias === 'ground') {
    y = frameHeight - padY - placedHeight;
  } else if (verticalBias === 'lower') {
    const leftover = frameHeight - placedHeight;
    y = Math.round(leftover * sleepBias);
  } else {
    y = Math.round((frameHeight - placedHeight) / 2);
  }
  y = Math.max(padY, Math.min(y, frameHeight - placedHeight - padY));

  return {
    scale,
    placement: {
      x,
      y,
      width: placedWidth,
      height: placedHeight,
    },
    verticalBias,
  };
}
