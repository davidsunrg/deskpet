'use client';

import { clientEnv } from '@/env/client';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';

/**
 * PostHog Analytics
 *
 * https://posthog.com
 * https://posthog.com/docs/libraries/react
 * Aligned with references/deskpet-next PostHogProvider (Vite env prefix).
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const posthogKey = clientEnv.VITE_POSTHOG_KEY;
  const posthogHost = clientEnv.VITE_POSTHOG_HOST;
  const isPostHogEnabled = Boolean(
    posthogKey && posthogHost && import.meta.env.PROD
  );

  useEffect(() => {
    if (!isPostHogEnabled || !posthogKey || !posthogHost) return;

    posthog.init(posthogKey, {
      api_host: posthogHost,
      defaults: '2025-05-24',
      autocapture: true,
      capture_pageview: 'history_change',
      capture_pageleave: 'if_capture_pageview',
      disable_session_recording: false,
      session_recording: {
        maskAllInputs: true,
      },
      loaded: (instance) => {
        instance.startSessionRecording();
      },
    });
  }, [isPostHogEnabled, posthogKey, posthogHost]);

  if (!isPostHogEnabled) {
    return <>{children}</>;
  }

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
