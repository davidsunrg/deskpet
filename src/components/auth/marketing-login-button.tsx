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
          'cursor-pointer border-deskpet-ink/20 bg-white font-mono font-black text-deskpet-ink hover:bg-deskpet-mint-soft',
          className
        )}
      >
        {m.auth_common_login()}
      </button>
    </LoginWrapper>
  );
}
