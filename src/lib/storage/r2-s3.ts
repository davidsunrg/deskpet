import { env } from 'cloudflare:workers';
import { AwsClient } from 'aws4fetch';
import { websiteConfig } from '@/config/website';
import { serverEnv } from '@/env/server';
import { DEFAULT_R2_BUCKET_NAME } from '@/storage/constants';
import {
  ConfigurationError,
  type R2BucketInterface,
  StorageError,
} from '@/storage/types';

type R2Config = {
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
  bucketName: string;
};

let awsClient: AwsClient | null = null;

export function isR2S3Configured(): boolean {
  return Boolean(
    serverEnv.R2_ACCESS_KEY_ID &&
      serverEnv.R2_SECRET_ACCESS_KEY &&
      websiteConfig.storage?.s3ApiEndpoint
  );
}

function getR2Config(): R2Config {
  const accessKeyId = serverEnv.R2_ACCESS_KEY_ID;
  const secretAccessKey = serverEnv.R2_SECRET_ACCESS_KEY;
  const endpoint = websiteConfig.storage?.s3ApiEndpoint;
  const bucketName =
    websiteConfig.storage?.bucketName ?? DEFAULT_R2_BUCKET_NAME;

  if (!accessKeyId || !secretAccessKey) {
    throw new ConfigurationError('R2 credentials are not configured');
  }
  if (!endpoint) {
    throw new ConfigurationError('R2 S3 API endpoint is not configured');
  }

  return { accessKeyId, secretAccessKey, endpoint, bucketName };
}

function getAwsClient(): AwsClient {
  if (awsClient) return awsClient;

  const { accessKeyId, secretAccessKey } = getR2Config();
  awsClient = new AwsClient({
    accessKeyId,
    secretAccessKey,
    service: 's3',
    region: 'auto',
  });
  return awsClient;
}

function getBucketBinding(): R2BucketInterface {
  const bucket = env.BUCKET;
  if (!bucket) {
    throw new ConfigurationError('R2 bucket binding BUCKET is not configured.');
  }
  return bucket;
}

function objectUrl(key: string): string {
  const { endpoint, bucketName } = getR2Config();
  const base = endpoint.replace(/\/$/, '');
  return `${base}/${bucketName}/${key}`;
}

export type GetPresignedUploadUrlParams = {
  key: string;
  contentType: string;
  expiresIn?: number;
  /** Same-origin proxy when R2 S3 API credentials are unavailable (local dev). */
  proxyOrigin?: string;
};

export type GetPresignedDownloadUrlParams = {
  key: string;
  expiresIn?: number;
};

export type HeadObjectMetadata = {
  contentLength: number;
  contentType?: string;
};

export type GetObjectResult = {
  body: Uint8Array;
  contentType?: string;
  contentLength?: number;
};

export async function getPresignedUploadUrl(
  params: GetPresignedUploadUrlParams
): Promise<string> {
  if (!isR2S3Configured()) {
    if (!params.proxyOrigin) {
      throw new ConfigurationError('R2 credentials are not configured');
    }
    return `${params.proxyOrigin.replace(/\/$/, '')}/api/storage/upload?key=${encodeURIComponent(params.key)}`;
  }

  const client = getAwsClient();
  const expiresIn = params.expiresIn ?? 3600;
  const url = `${objectUrl(params.key)}?X-Amz-Expires=${expiresIn}`;
  const signed = await client.sign(
    new Request(url, {
      method: 'PUT',
      headers: { 'Content-Type': params.contentType },
    }),
    { aws: { signQuery: true } }
  );
  return signed.url;
}

export async function getPresignedDownloadUrl(
  params: GetPresignedDownloadUrlParams
): Promise<string> {
  if (!isR2S3Configured()) {
    throw new ConfigurationError('R2 S3 API is required for presigned downloads');
  }

  const client = getAwsClient();
  const expiresIn = params.expiresIn ?? 3600;
  const url = `${objectUrl(params.key)}?X-Amz-Expires=${expiresIn}`;
  const signed = await client.sign(new Request(url, { method: 'GET' }), {
    aws: { signQuery: true },
  });
  return signed.url;
}

export async function headObject(key: string): Promise<HeadObjectMetadata> {
  if (!isR2S3Configured()) {
    const head = await getBucketBinding().head(key);
    if (!head) {
      throw new StorageError(`HEAD object failed (404): ${key}`);
    }
    return {
      contentLength: head.size ?? 0,
      contentType: head.httpMetadata?.contentType,
    };
  }

  const client = getAwsClient();
  const response = await client.fetch(objectUrl(key), { method: 'HEAD' });
  if (!response.ok) {
    throw new StorageError(`HEAD object failed (${response.status}): ${key}`);
  }

  const contentLengthHeader = response.headers.get('content-length');
  if (!contentLengthHeader) {
    throw new StorageError(`HEAD object missing Content-Length: ${key}`);
  }

  const contentLength = Number.parseInt(contentLengthHeader, 10);
  if (!Number.isFinite(contentLength)) {
    throw new StorageError(`HEAD object invalid Content-Length: ${key}`);
  }

  return {
    contentLength,
    contentType: response.headers.get('content-type') ?? undefined,
  };
}

export async function getObject(key: string): Promise<GetObjectResult> {
  if (!isR2S3Configured()) {
    const object = await getBucketBinding().get(key);
    if (!object?.body) {
      throw new StorageError(`GET object failed (404): ${key}`);
    }
    const body = new Uint8Array(await object.body.arrayBuffer());
    return {
      body,
      contentType: object.httpMetadata?.contentType,
      contentLength: body.byteLength,
    };
  }

  const client = getAwsClient();
  const response = await client.fetch(objectUrl(key), { method: 'GET' });
  if (!response.ok) {
    throw new StorageError(`GET object failed (${response.status}): ${key}`);
  }

  const body = new Uint8Array(await response.arrayBuffer());
  const contentLengthHeader = response.headers.get('content-length');
  const contentLength = contentLengthHeader
    ? Number.parseInt(contentLengthHeader, 10)
    : body.byteLength;

  return {
    body,
    contentType: response.headers.get('content-type') ?? undefined,
    contentLength: Number.isFinite(contentLength)
      ? contentLength
      : body.byteLength,
  };
}

export async function deleteObject(key: string): Promise<void> {
  if (!isR2S3Configured()) {
    await getBucketBinding().delete(key);
    return;
  }

  const client = getAwsClient();
  const response = await client.fetch(objectUrl(key), { method: 'DELETE' });
  if (!response.ok && response.status !== 404) {
    throw new StorageError(`DELETE object failed (${response.status}): ${key}`);
  }
}

export async function putObject(input: {
  key: string;
  body: Uint8Array;
  contentType: string;
}): Promise<void> {
  if (!isR2S3Configured()) {
    await getBucketBinding().put(input.key, input.body, {
      httpMetadata: { contentType: input.contentType },
    });
    return;
  }

  const client = getAwsClient();
  const response = await client.fetch(objectUrl(input.key), {
    method: 'PUT',
    body: input.body,
    headers: { 'Content-Type': input.contentType },
  });
  if (!response.ok) {
    throw new StorageError(`PUT object failed (${response.status}): ${input.key}`);
  }
}

export async function copyObject(input: {
  sourceKey: string;
  destinationKey: string;
  contentType?: string;
}): Promise<void> {
  const { body, contentType } = await getObject(input.sourceKey);
  await putObject({
    key: input.destinationKey,
    body,
    contentType: input.contentType ?? contentType ?? 'application/octet-stream',
  });
}
