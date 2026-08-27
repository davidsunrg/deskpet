import {
  actionConfig,
  type ActionClipKey,
  type ActionMenuItemKey,
  type ActionPosture,
} from '@/config/action-config';
import { createActionEngine } from './action-engine';

export type {
  ActionClipRef,
  ActionEngine,
  ActionEngineClipMeta,
  ActionEngineConfig,
  ActionEngineTransition,
  ActionMenuState,
  ExpandedAction,
} from './action-engine';
export {
  createActionEngine,
  validateActionConfig,
} from './action-engine';
export {
  resolvePresetPetActions,
  resolvePresetShowcaseActions,
  validatePetResourceRegistry,
} from './resolve-preset-pet-actions';
export type { ResolvePresetPetActionsInput } from './resolve-preset-pet-actions';

export type ActionEngineClipKey = ActionClipKey;
export type ActionEngineMenuItemKey = ActionMenuItemKey;
export type ActionEnginePosture = ActionPosture;

export const actionEngine = createActionEngine<
  ActionEngineClipKey,
  ActionEngineMenuItemKey,
  ActionEnginePosture
>(actionConfig);

export const availableClipKeys = actionEngine.availableClipKeys;
export const initialClipKey = actionEngine.initialClipKey;
export const postureFromClipKey = actionEngine.postureFromClipKey;
export const plannerPostureFromClipKey = actionEngine.plannerPostureFromClipKey;
export const isLoopClip = actionEngine.isLoopClip;
export const logicalActionFromClipKey = actionEngine.logicalActionFromClipKey;
export const expandMenuAction = actionEngine.expandMenuAction;
export const listMenuItems = actionEngine.listMenuItems;
export const listAutoplayMenuItems = actionEngine.listAutoplayMenuItems;
export const pickAutoplayMenuItem = actionEngine.pickAutoplayMenuItem;
export const defaultDwellLoops = actionEngine.defaultDwellLoops;
export const shouldHoldManualTerminalLoop =
  actionEngine.shouldHoldManualTerminalLoop;
export const isLegalClipSequence = actionEngine.isLegalClipSequence;
