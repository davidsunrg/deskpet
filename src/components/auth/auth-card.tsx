import { BottomLink } from '@/components/auth/bottom-link';
import { BrandName } from '@/components/layout/brand-name';
import { Logo } from '@/components/layout/logo';
import { LocaleLink } from '@/lib/i18n/navigation';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface AuthCardProps {
  children: React.ReactNode;
  headerLabel: ReactNode;
  bottomButtonLabel: string;
  bottomButtonHref?: string;
  bottomButtonPrefix?: string;
  onBottomButtonClick?: () => void;
  className?: string;
  headerClassName?: string;
  showBrand?: boolean;
}

export function AuthCard({
  children,
  headerLabel,
  bottomButtonLabel,
  bottomButtonHref,
  bottomButtonPrefix,
  onBottomButtonClick,
  className,
  headerClassName,
  showBrand = true,
}: AuthCardProps) {
  return (
    <div className={cn('flex w-full flex-col gap-6', className)}>
      <div className="flex flex-col items-center gap-2">
        {showBrand ? (
          <LocaleLink
            href="/"
            aria-label="Home"
            className="mb-2 flex items-center gap-3"
          >
            <Logo />
            <BrandName />
          </LocaleLink>
        ) : null}
        {headerLabel ? (
          showBrand ? (
            <p className="text-sm text-muted-foreground">{headerLabel}</p>
          ) : (
            <h1
              className={cn(
                'text-center text-xl font-semibold tracking-tight text-[#382A35] dark:text-foreground',
                headerClassName
              )}
            >
              {headerLabel}
            </h1>
          )
        ) : null}
      </div>
      <div>{children}</div>
      <BottomLink
        label={bottomButtonLabel}
        href={bottomButtonHref}
        prefix={bottomButtonPrefix}
        onClick={onBottomButtonClick}
      />
    </div>
  );
}
