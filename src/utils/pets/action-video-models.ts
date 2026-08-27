/**
 * Client-safe catalog of video models selectable on the Actions page.
 * IDs must match registered video adapters in `src/lib/models`.
 *
 * Seedance 2.0 options:
 * @see https://ai-sdk.dev/providers/ai-sdk-providers/bytedance#bytedance-provider
 */
import {
  DEFAULT_MODEL_PROVIDER,
  listRuntimeModelOptions,
  type ModelProvider,
} from '@/lib/models/catalog';

export const ACTION_VIDEO_MODEL_IDS = [
  'google/veo-3.0-fast-generate-001',
  'google/veo-3.1-fast-generate-001',
  'bytedance/seedance-1.0-pro',
  'bytedance/seedance-v1.0-pro',
  'bytedance/seedance-v1.0-pro-fast',
  'bytedance/seedance-2.0',
  'bytedance/seedance-2.0-fast',
  'klingai/kling-v3.0-i2v',
  'alibaba/wan-v2.7-r2v',
  'xai/grok-imagine-video-1.5',
] as const;

export type ActionVideoModelId = (typeof ACTION_VIDEO_MODEL_IDS)[number];

export const ACTION_VIDEO_MODEL_OPTIONS = listRuntimeModelOptions({
  kind: 'video',
}) as Array<{
  id: ActionVideoModelId;
  label: string;
  providers: readonly ModelProvider[];
}>;

export const DEFAULT_ACTION_VIDEO_MODEL_ID: ActionVideoModelId =
  'google/veo-3.1-fast-generate-001';

export const ACTION_VIDEO_MODEL_STORAGE_KEY =
  'petnet.dashboard.actions.videoModel';

const ACTION_VIDEO_MODEL_ID_SET = new Set<string>(ACTION_VIDEO_MODEL_IDS);

export function isActionVideoModelId(
  value: string
): value is ActionVideoModelId {
  return ACTION_VIDEO_MODEL_ID_SET.has(value);
}

export function parseActionVideoModelId(
  value: string | null | undefined
): ActionVideoModelId {
  if (value && isActionVideoModelId(value)) {
    return value;
  }
  return DEFAULT_ACTION_VIDEO_MODEL_ID;
}

export function listActionVideoModelOptionsForProvider(
  provider: ModelProvider = DEFAULT_MODEL_PROVIDER
): typeof ACTION_VIDEO_MODEL_OPTIONS {
  return ACTION_VIDEO_MODEL_OPTIONS.filter((option) =>
    option.providers.includes(provider)
  );
}

export function defaultActionVideoModelIdForProvider(
  provider: ModelProvider = DEFAULT_MODEL_PROVIDER
): ActionVideoModelId {
  return (
    listActionVideoModelOptionsForProvider(provider)[0]?.id ??
    DEFAULT_ACTION_VIDEO_MODEL_ID
  );
}
