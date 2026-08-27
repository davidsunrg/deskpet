import { m } from '@/locale/paraglide/messages';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { Routes } from '@/lib/routes';
import { useRouter } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';

interface LoginWrapperProps {
  children: React.ReactNode;
  mode?: 'modal' | 'redirect';
  asChild?: boolean;
  callbackUrl?: string;
  initialView?: 'login' | 'signup';
}

export function LoginWrapper({
  children,
  mode = 'redirect',
  asChild,
  callbackUrl,
  initialView = 'login',
}: LoginWrapperProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRedirect = () => {
    router.navigate({
      to: initialView === 'signup' ? Routes.Signup : Routes.Login,
      search: callbackUrl ? { callbackUrl } : {},
    });
  };

  if (!mounted) {
    return <span>{children}</span>;
  }

  if (mode === 'modal') {
    return (
      <>
        {asChild && React.isValidElement(children) ? (
          React.cloneElement(children, {
            onClick: (event: React.MouseEvent) => {
              children.props.onClick?.(event);
              setOpen(true);
            },
          } as React.HTMLAttributes<HTMLElement>)
        ) : (
          <button type="button" onClick={() => setOpen(true)}>
            {children}
          </button>
        )}
        <AuthDialog
          open={open}
          onOpenChange={setOpen}
          callbackUrl={callbackUrl}
          initialView={initialView}
        />
      </>
    );
  }

  return (
    <button type="button" onClick={handleRedirect} className="inline">
      {children}
    </button>
  );
}
