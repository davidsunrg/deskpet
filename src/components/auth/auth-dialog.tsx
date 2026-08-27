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
import { useEffect, useState } from 'react';

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

  const search = location.searchStr?.replace(/^\?/, '') ?? '';
  const currentReturnPath = search
    ? `${location.pathname}?${search}`
    : location.pathname;
  const resolvedCallbackUrl = callbackUrl ?? currentReturnPath;

  useEffect(() => {
    if (open) {
      setMode(resolvedDefaultMode);
    }
  }, [open, resolvedDefaultMode]);

  const handleAuthenticated = () => {
    if (onAuthenticated) {
      onAuthenticated();
      return;
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'gap-0 p-6 pt-8 sm:max-w-[400px]',
          preventTranslation && 'notranslate'
        )}
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
