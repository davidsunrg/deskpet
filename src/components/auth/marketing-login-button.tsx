import { m } from '@/locale/paraglide/messages';
import { LoginWrapper } from '@/components/auth/login-wrapper';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MarketingLoginButtonProps {
  className?: string;
  callbackUrl?: string;
}

export function MarketingLoginButton({
  className,
  callbackUrl,
}: MarketingLoginButtonProps) {
  return (
    <LoginWrapper mode="modal" asChild callbackUrl={callbackUrl}>
      <button
        type="button"
        className={cn(
          buttonVariants({ variant: 'outline', size: 'sm' }),
          'cursor-pointer font-mono font-black',
          className
        )}
      >
        {m.auth_common_login()}
      </button>
    </LoginWrapper>
  );
}
