import { serverEnv } from '@/env/server';
import {
  getArkSeedModel,
  resolveArkSeedModelId,
  type ArkSeedModelId,
} from '@/lib/ai/ark-seed-models';
import { parseJsonObjectFromText } from '@/lib/ai/parse-json-object-from-text';

const DEFAULT_ARK_BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3';

export type ArkImageInput = {
  mimeType: string;
  base64: string;
};

type ArkResponsesPayload = {
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
};

export { parseJsonObjectFromText };

function extractOutputText(payload: ArkResponsesPayload): string {
  const direct = payload.output_text?.trim();
  if (direct) return direct;

  const chunks: string[] = [];
  for (const item of payload.output ?? []) {
    for (const part of item.content ?? []) {
      if (
        (part.type === 'output_text' || part.type === 'text') &&
        typeof part.text === 'string' &&
        part.text.trim()
      ) {
        chunks.push(part.text.trim());
      }
    }
  }
  return chunks.join('\n').trim();
}

/**
 * Send one or more images to Ark and parse a JSON object from the reply.
 * Uses fetch so it works on Cloudflare Workers (no Node OpenAI SDK).
 */
export async function arkJsonFromImages(input: {
  images: ArkImageInput[];
  prompt: string;
  system?: string;
  /** Ark endpoint id; defaults via {@link resolveArkSeedModelId}. */
  model?: string | null;
}): Promise<{ data: unknown; rawText: string; model: ArkSeedModelId }> {
  if (input.images.length === 0) {
    throw new Error('At least one image is required.');
  }

  const apiKey = serverEnv.ARK_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      'ARK_API_KEY is not set. Add it to .env.local / Worker secrets.'
    );
  }

  const baseURL = DEFAULT_ARK_BASE_URL;
  const model = resolveArkSeedModelId(input.model);

  const userContent = [
    { type: 'input_text' as const, text: input.prompt },
    ...input.images.map((image) => ({
      type: 'input_image' as const,
      detail: 'auto' as const,
      image_url: `data:${image.mimeType};base64,${image.base64}`,
    })),
  ];

  const response = await fetch(`${baseURL.replace(/\/$/, '')}/responses`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: [
        ...(input.system
          ? [{ role: 'system' as const, content: input.system }]
          : []),
        { role: 'user' as const, content: userContent },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(
      `Ark request failed (${response.status}): ${errorText.slice(0, 300) || response.statusText}`
    );
  }

  const payload = (await response.json()) as ArkResponsesPayload;
  const rawText = extractOutputText(payload);
  if (!rawText) {
    throw new Error('Ark returned an empty response.');
  }

  return {
    data: parseJsonObjectFromText(rawText),
    rawText,
    model,
  };
}

export function resolveRecognitionModelMeta(modelId: string): {
  model: ArkSeedModelId;
  modelLabel: string;
} {
  const model = resolveArkSeedModelId(modelId);
  return {
    model,
    modelLabel: getArkSeedModel(model)?.label ?? model,
  };
}

export function isArkApiConfigured(): boolean {
  return Boolean(serverEnv.ARK_API_KEY?.trim());
}
