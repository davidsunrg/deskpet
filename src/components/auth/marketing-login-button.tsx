'use client';

import { LoginWrapper } from '@/components/auth/login-wrapper';
import { authClient } from '@/auth/client';
import { isRealSignedInUser } from '@/lib/auth/session-identity';
import { Routes } from '@/lib/routes';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from '@tanstack/react-router';

interface MarketingLoginButtonProps {
  className?: string;
  callbackUrl?: string;
}

const signInLabel = 'Sign In';

export function MarketingLoginButton({
  className,
  callbackUrl,
}: MarketingLoginButtonProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const isSignedIn = isRealSignedInUser(session?.user);

  const buttonClassName = cn(
    buttonVariants({ variant: 'outline', size: 'sm' }),
    'cursor-pointer text-[15px] font-bold font-sans',
    className
  );

  if (isSignedIn) {
    return (
      <button
        type="button"
        className={buttonClassName}
        onClick={() => router.navigate({ to: Routes.Dashboard })}
      >
        {signInLabel}
      </button>
    );
  }

  return (
    <LoginWrapper mode="modal" asChild callbackUrl={callbackUrl}>
      <button type="button" className={buttonClassName}>
        {signInLabel}
      </button>
    </LoginWrapper>
  );
}
