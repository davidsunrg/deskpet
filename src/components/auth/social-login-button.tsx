import { m } from '@/locale/paraglide/messages';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { websiteConfig } from '@/config/website';
import { authClient } from '@/auth/client';
import { DEFAULT_LOGIN_REDIRECT, Routes } from '@/lib/routes';
import { getPathWithLocale } from '@/lib/urls';
import { IconLoader2 } from '@tabler/icons-react';

interface SocialLoginButtonProps {
  callbackUrl?: string;
  showDivider?: boolean;
  googleLabel?: string;
}

export function SocialLoginButton({
  callbackUrl: propCallbackUrl,
  showDivider = true,
  googleLabel,
}: SocialLoginButtonProps) {
  const paramCallbackUrl =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('callbackUrl')
      : null;
  const defaultCallbackUrl = getPathWithLocale(DEFAULT_LOGIN_REDIRECT);
  const callbackUrl =
    propCallbackUrl ??
    (paramCallbackUrl ? paramCallbackUrl : defaultCallbackUrl);
  const [isLoading, setIsLoading] = useState<'google' | null>(null);
  if (!websiteConfig.auth?.enableGoogleLogin) {
    return null;
  }
  const onClick = async (provider: 'google') => {
    await authClient.signIn.social(
      {
        provider,
        callbackURL: callbackUrl,
        errorCallbackURL: getPathWithLocale(Routes.AuthError),
      },
      {
        onRequest: () => setIsLoading(provider),
        onResponse: () => setIsLoading(null),
        onSuccess: () => setIsLoading(null),
        onError: () => setIsLoading(null),
      }
    );
  };
  return (
    <div className="flex w-full flex-col gap-4">
      {showDivider ? (
        <div className="w-full border-t border-border" aria-hidden />
      ) : null}
      <Button
        type="button"
        size="lg"
        className="w-full"
        variant="outline"
        onClick={() => onClick('google')}
        disabled={isLoading === 'google'}
      >
        {isLoading === 'google' ? (
          <IconLoader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <img
            src="/google.svg"
            alt=""
            aria-hidden
            className="mr-2 size-4"
          />
        )}
        <span>{googleLabel ?? m.auth_social_sign_in_with_google()}</span>
      </Button>
    </div>
  );
}
