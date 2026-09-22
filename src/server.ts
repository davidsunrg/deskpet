// DO NOT DELETE THIS FILE!!!
// This file is a good smoke test to make sure the custom server entry is working
import handler from '@tanstack/react-start/server-entry';
import * as Sentry from '@sentry/cloudflare';
import { wrapFetchWithSentry } from '@sentry/tanstackstart-react';
import { localeMiddleware } from '@/locale/middleware';
import { serverEnv } from '@/env/server';
import {
  getTrustedExtensionOrigins,
  getTrustedOrigins,
  isTrustedExtensionOrigin,
} from '@/auth/trusted-origins';

/**
 * TanStack Start server entry
 * https://github.com/backpine/tanstack-start-on-cloudflare/blob/main/src/server.ts
 * Sentry: https://docs.sentry.io/platforms/javascript/guides/cloudflare/frameworks/tanstack-start/
 */
console.log("[server-entry]: using custom server entry in 'src/server.ts'");

/**
 * CORS support for the browser extension (mkext-template).
 * Extension requests arrive with `Origin: chrome-extension://<id>`. We only add
 * CORS headers for that origin so normal web/SSR traffic is completely unaffected.
 * Bearer-token auth is used (not cookies), so credentials are not required.
 */
const trustedExtensionOrigins = getTrustedExtensionOrigins(
  getTrustedOrigins(serverEnv.BETTER_AUTH_TRUSTED_ORIGINS)
);

function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Expose-Headers': 'set-auth-token',
    Vary: 'Origin',
  };
}

const startHandler = wrapFetchWithSentry(handler);

type WorkerEnv = {
  SENTRY_DSN?: string;
};

function resolveSentryDsn(env: WorkerEnv): string | undefined {
  const fromBinding = env.SENTRY_DSN?.trim();
  if (fromBinding) return fromBinding;
  return serverEnv.SENTRY_DSN?.trim() || undefined;
}

async function handleRequest(request: Request): Promise<Response> {
  const origin = request.headers.get('Origin');

  // Preflight from the extension: answer directly, don't hit the app handler.
  if (
    isTrustedExtensionOrigin(origin, trustedExtensionOrigins) &&
    request.method === 'OPTIONS'
  ) {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  const response = await localeMiddleware(request, () =>
    startHandler.fetch(request, {
      context: {
        fromFetch: true,
      },
    })
  );

  // Add CORS headers to extension responses (clone so headers stay mutable).
  if (isTrustedExtensionOrigin(origin, trustedExtensionOrigins)) {
    const headers = new Headers(response.headers);
    for (const [key, value] of Object.entries(corsHeaders(origin))) {
      headers.set(key, value);
    }
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  return response;
}

export default Sentry.withSentry(
  (env: WorkerEnv) => {
    const dsn = resolveSentryDsn(env);
    if (!dsn) {
      return { dsn: '', enabled: false };
    }

    return {
      dsn,
      enabled: true,
      environment: import.meta.env.PROD ? 'production' : 'development',
      // Keep volume modest in production; full sample locally when DSN is set.
      tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
    };
  },
  {
    async fetch(request) {
      return handleRequest(request);
    },
  }
);
