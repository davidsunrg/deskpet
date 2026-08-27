/**
 * Thin import facade over the config-driven web action engine.
 * Prefer `@/lib/action-engine` for new call sites.
 */
import type {
  actionConfig,
  ActionMenuItemKey,
  ActionPosture,
} from '@/config/action-config';
import {
  availableClipKeys as engineAvailableClipKeys,
  defaultDwellLoops as engineDefaultDwellLoops,
  expandMenuAction,
  initialClipKey as engineInitialClipKey,
  isLegalClipSequence,
  isLoopClip,
  listAutoplayMenuItems,
  listMenuItems,
  logicalActionFromClipKey,
  pickAutoplayMenuItem,
  plannerPostureFromClipKey,
  postureFromClipKey,
  type ActionClipRef,
} from '@/lib/action-engine';

export type PetPosture = ActionPosture;
export type LogicalActionId = ActionMenuItemKey;
export type { ActionClipRef };

export type LogicalActionMenuItem = {
  id: LogicalActionId;
  labelKey: string;
  label: string;
  group: (typeof actionConfig.menuItems)[ActionMenuItemKey]['group'];
  disabled?: boolean;
};

export type ExpandLogicalActionResult = {
  clips: string[];
  endingPosture: PetPosture;
};

export {
  isLegalClipSequence,
  isLoopClip,
  logicalActionFromClipKey,
  plannerPostureFromClipKey,
  postureFromClipKey,
};

export function expandLogicalAction(
  logical: LogicalActionId,
  posture: PetPosture,
  available: ReadonlySet<string>
): ExpandLogicalActionResult | null {
  const expanded = expandMenuAction(logical, posture, available);
  if (!expanded) return null;
  return {
    clips: [...expanded.clips],
    endingPosture: expanded.endingPosture,
  };
}

export function listLogicalMenuItems(
  available: ReadonlySet<string>,
  posture: PetPosture
): LogicalActionMenuItem[] {
  return listMenuItems(available, posture) as LogicalActionMenuItem[];
}

export function listAutoplayLogicalActions(
  available: ReadonlySet<string>,
  posture: PetPosture
): LogicalActionId[] {
  return listAutoplayMenuItems(available, posture);
}

export function pickRandomLogicalAction(
  available: ReadonlySet<string>,
  posture: PetPosture,
  previous: LogicalActionId | null,
  random: () => number = Math.random
): LogicalActionId | null {
  return pickAutoplayMenuItem(available, posture, previous, random);
}

export function defaultDwellLoops(clipKey: string): number {
  return engineDefaultDwellLoops(clipKey);
}

export function availableClipKeys(
  actions: readonly ActionClipRef[]
): Set<string> {
  return new Set(engineAvailableClipKeys(actions));
}

export function initialClipKey(
  actions: readonly ActionClipRef[]
): string | null {
  return engineInitialClipKey(actions);
}
