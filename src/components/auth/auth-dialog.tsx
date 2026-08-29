import { m } from '@/locale/paraglide/messages';
import { LoginForm } from '@/components/auth/login-form';
import { SignupForm } from '@/components/auth/signup-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useLocation } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

export type AuthDialogMode = 'login' | 'signup';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callbackUrl?: string;
  initialView?: AuthDialogMode;
  defaultMode?: AuthDialogMode;
  onAuthenticated?: () => void;
  preventTranslation?: boolean;
}

export function AuthDialog({
  open,
  onOpenChange,
  callbackUrl,
  initialView,
  defaultMode = 'login',
  onAuthenticated,
  preventTranslation = false,
}: AuthDialogProps) {
  const resolvedDefaultMode = initialView ?? defaultMode;
  const location = useLocation();
  const [mode, setMode] = useState<AuthDialogMode>(resolvedDefaultMode);
  const wasOpenRef = useRef(false);

  const search = location.searchStr?.replace(/^\?/, '') ?? '';
  const currentReturnPath = search
    ? `${location.pathname}?${search}`
    : location.pathname;
  const resolvedCallbackUrl = callbackUrl ?? currentReturnPath;

  // Reset login/signup mode only when the dialog opens from closed — not on
  // every parent re-render while it stays open (e.g. session refetch).
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setMode(resolvedDefaultMode);
    }
    wasOpenRef.current = open;
  }, [open, resolvedDefaultMode]);

  const handleAuthenticated = () => {
    if (onAuthenticated) {
      onAuthenticated();
      return;
    }
    onOpenChange(false);
  };

  // Switching to the email tab blurs the page; Radix may treat that as
  // "interact/focus outside" and close the dialog, wiping the OTP step.
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && typeof document !== 'undefined') {
      if (document.visibilityState === 'hidden') return;
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          'gap-0 p-6 pt-8 sm:max-w-[400px]',
          preventTranslation && 'notranslate'
        )}
        onFocusOutside={(event) => {
          event.preventDefault();
        }}
        {...(preventTranslation
          ? {
              translate: 'no' as const,
              'data-google-translate': 'no',
            }
          : {})}
      >
        <DialogHeader className="hidden">
          <DialogTitle>
            {mode === 'login'
              ? m.auth_login_welcome_back()
              : m.auth_signup_create_account()}
          </DialogTitle>
        </DialogHeader>
        {mode === 'login' ? (
          <LoginForm
            callbackUrl={resolvedCallbackUrl}
            onAuthenticated={handleAuthenticated}
            onSwitchToSignup={() => setMode('signup')}
          />
        ) : (
          <SignupForm
            callbackUrl={resolvedCallbackUrl}
            onAuthenticated={handleAuthenticated}
            onSwitchToLogin={() => setMode('login')}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export function LoginDialog({
  open,
  onOpenChange,
  callbackUrl,
  onAuthenticated,
  preventTranslation,
}: Omit<AuthDialogProps, 'defaultMode' | 'initialView'>) {
  return (
    <AuthDialog
      open={open}
      onOpenChange={onOpenChange}
      callbackUrl={callbackUrl}
      onAuthenticated={onAuthenticated}
      defaultMode="login"
      preventTranslation={preventTranslation}
    />
  );
}
