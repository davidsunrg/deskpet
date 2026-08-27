/**
 * Pure helpers for resolving / validating I2V first+last pose frames.
 */

import {
  ACTION_POSE_FRAME_HEIGHT,
  ACTION_POSE_FRAME_WIDTH,
  type ActionPoseType,
} from '@/utils/pets/action-pose';
import {
  resolveActionFramePoseTypes,
  type PetGeneratedActionDefinition,
} from '@/utils/pets/pet-generated-action';

export type LoadedActionPoseFrame = {
  poseId: string;
  poseType: ActionPoseType;
  fileKey: string;
  filename: string | null;
  mimeType: string;
  width: number | null;
  height: number | null;
};

export function isExactActionPoseFrameSize(
  width: number | null | undefined,
  height: number | null | undefined
): boolean {
  return (
    width === ACTION_POSE_FRAME_WIDTH && height === ACTION_POSE_FRAME_HEIGHT
  );
}

export function isActionPoseFrameImage(
  mimeType: string | null | undefined
): boolean {
  const normalized = mimeType?.trim().toLowerCase();
  return (
    normalized === 'image/png' ||
    normalized === 'image/jpeg' ||
    normalized === 'image/jpg'
  );
}

export function isUsableActionPoseFrame(
  pose: Pick<LoadedActionPoseFrame, 'width' | 'height' | 'mimeType'> | null
): boolean {
  if (!pose) return false;
  return (
    isExactActionPoseFrameSize(pose.width, pose.height) &&
    isActionPoseFrameImage(pose.mimeType)
  );
}

/** Unique pose types required for an action's first/last frames (order: first, then last if different). */
export function requiredActionFramePoseTypes(
  definition: Pick<
    PetGeneratedActionDefinition,
    'firstFramePoseType' | 'lastFramePoseType'
  >
): ActionPoseType[] {
  const { firstFramePoseType, lastFramePoseType } =
    resolveActionFramePoseTypes(definition);
  if (firstFramePoseType === lastFramePoseType) {
    return [firstFramePoseType];
  }
  return [firstFramePoseType, lastFramePoseType];
}

export function actionPoseNeedsRegeneration(input: {
  forceRegeneratePoses?: boolean;
  firstPose: LoadedActionPoseFrame | null;
  lastPose: LoadedActionPoseFrame | null;
  firstFramePoseType: ActionPoseType;
  lastFramePoseType: ActionPoseType;
}): boolean {
  if (input.forceRegeneratePoses) return true;
  if (!isUsableActionPoseFrame(input.firstPose)) return true;
  if (input.firstFramePoseType === input.lastFramePoseType) {
    return false;
  }
  return !isUsableActionPoseFrame(input.lastPose);
}

export function poseTypeLabel(poseType: ActionPoseType): string {
  switch (poseType) {
    case 'front':
      return 'Front pose';
    case 'walk_left':
      return 'Walk Left pose';
    case 'walk_right':
      return 'Walk Right pose';
    case 'sleep_right':
      return 'Sleep Right pose';
  }
}
