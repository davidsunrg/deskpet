/**
 * Return active pose ids that should be deactivated when replacing the given
 * pose types (call only after all new frames pass QA).
 */
import {
  ACTION_POSE_STRIP_TYPES,
  canonicalizeActionPoseType,
  type ActionPoseType,
} from '@/utils/pets/action-pose';

export function poseIdsToDeactivateForTypes(input: {
  existingPoses: Array<{ id: string; isActive: boolean; poseType: string }>;
  poseTypes: readonly string[];
}): string[] {
  const typeSet = new Set(input.poseTypes);
  return input.existingPoses
    .filter((pose) => pose.isActive && typeSet.has(pose.poseType))
    .map((pose) => pose.id);
}

/** @deprecated Use {@link poseIdsToDeactivateForTypes}. */
export const poseIdsToDeactivateForStrip = poseIdsToDeactivateForTypes;

/**
 * True when the given stored pose_type values cover every strip slot
 * (legacy `side` / `sleep` count toward walk_left / sleep_right).
 * Walk Right is not a strip cut.
 */
export function stripHasAllCanonicalPoses(
  poseTypes: readonly string[]
): boolean {
  const present = new Set<ActionPoseType>();
  for (const poseType of poseTypes) {
    const canonical = canonicalizeActionPoseType(poseType);
    if (canonical) present.add(canonical);
  }
  return ACTION_POSE_STRIP_TYPES.every((poseType) => present.has(poseType));
}

/**
 * Collect unique `pet_file` ids owned by strip pose rows (frame, cutout, raw).
 */
export function collectPetFileIdsFromStripPoses(
  poses: ReadonlyArray<{
    fileId: string;
    cutoutFileId: string | null;
    sourceImgFileId: string | null;
  }>
): string[] {
  const ids = new Set<string>();
  for (const pose of poses) {
    ids.add(pose.fileId);
    if (pose.cutoutFileId) ids.add(pose.cutoutFileId);
    if (pose.sourceImgFileId) ids.add(pose.sourceImgFileId);
  }
  return [...ids];
}

/** True when a history strip can be activated (complete and not already active). */
export function canActivatePoseStrip(item: {
  isActive: boolean;
  cutCount: number;
  expectedCutCount: number;
}): boolean {
  return (
    !item.isActive &&
    item.cutCount >= item.expectedCutCount &&
    item.expectedCutCount > 0
  );
}

/** True when a history strip can be deleted (must not be the active strip). */
export function canDeletePoseStrip(item: { isActive: boolean }): boolean {
  return !item.isActive;
}
