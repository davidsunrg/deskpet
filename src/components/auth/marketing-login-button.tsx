'use client';

import { LoginWrapper } from '@/components/auth/login-wrapper';
import { authClient } from '@/auth/client';
import { isRealSignedInUser } from '@/lib/auth/session-identity';
import { Routes } from '@/lib/routes';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { m } from '@/locale/paraglide/messages';
import { useRouter } from '@tanstack/react-router';

interface MarketingLoginButtonProps {
  className?: string;
  callbackUrl?: string;
}

export function MarketingLoginButton({
  className,
  callbackUrl,
}: MarketingLoginButtonProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const isSignedIn = isRealSignedInUser(session?.user);
  const loginLabel = m.auth_common_login();

  const loginButtonClass = cn(
    buttonVariants({
      variant: 'outline',
      size: 'sm',
    }),
    // Match hero Cat/Dog badges: mono + black weight
    'cursor-pointer font-mono font-black',
    className
  );

  if (isSignedIn) {
    return (
      <button
        type="button"
        className={loginButtonClass}
        onClick={() => router.navigate({ to: Routes.Dashboard })}
      >
        {loginLabel}
      </button>
    );
  }

  return (
    <LoginWrapper mode="modal" asChild callbackUrl={callbackUrl}>
      <button type="button" className={loginButtonClass}>
        {loginLabel}
      </button>
    </LoginWrapper>
  );
}
