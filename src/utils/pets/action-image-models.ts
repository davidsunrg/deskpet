/**
 * Client-safe catalog of image models selectable on the Actions poses step.
 * IDs must match registered image adapters in `src/lib/models`.
 */
import {
  DEFAULT_MODEL_PROVIDER,
  listRuntimeModelOptions,
  type ModelProvider,
} from '@/lib/models/catalog';

export const ACTION_IMAGE_MODEL_IDS = [
  'bytedance/seedream-5.0-pro',
  'bytedance/seedream-5.0-lite',
  'google/gemini-3.1-flash-image',
  'google/gemini-3.1-flash-lite-image',
  'xai/grok-imagine-image',
] as const;

export type ActionImageModelId = (typeof ACTION_IMAGE_MODEL_IDS)[number];

export const ACTION_IMAGE_MODEL_OPTIONS = listRuntimeModelOptions({
  kind: 'image',
}) as Array<{
  id: ActionImageModelId;
  label: string;
  providers: readonly ModelProvider[];
}>;

export const DEFAULT_ACTION_IMAGE_MODEL_ID: ActionImageModelId =
  'bytedance/seedream-5.0-pro';

export const ACTION_IMAGE_MODEL_STORAGE_KEY =
  'petnet.dashboard.actions.imageModel';

const ACTION_IMAGE_MODEL_ID_SET = new Set<string>(ACTION_IMAGE_MODEL_IDS);

export function isActionImageModelId(
  value: string
): value is ActionImageModelId {
  return ACTION_IMAGE_MODEL_ID_SET.has(value);
}

export function parseActionImageModelId(
  value: string | null | undefined
): ActionImageModelId {
  if (value && isActionImageModelId(value)) {
    return value;
  }
  return DEFAULT_ACTION_IMAGE_MODEL_ID;
}

export function listActionImageModelOptionsForProvider(
  provider: ModelProvider = DEFAULT_MODEL_PROVIDER
): typeof ACTION_IMAGE_MODEL_OPTIONS {
  return ACTION_IMAGE_MODEL_OPTIONS.filter((option) =>
    option.providers.includes(provider)
  );
}

export function defaultActionImageModelIdForProvider(
  provider: ModelProvider = DEFAULT_MODEL_PROVIDER
): ActionImageModelId {
  return (
    listActionImageModelOptionsForProvider(provider)[0]?.id ??
    DEFAULT_ACTION_IMAGE_MODEL_ID
  );
}
