import { m } from '@/locale/paraglide/messages';
import { LoginForm } from '@/components/auth/login-form';
import { SignupForm } from '@/components/auth/signup-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';

type AuthView = 'login' | 'signup';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callbackUrl?: string;
  initialView?: AuthView;
  onAuthenticated?: () => void;
  preventTranslation?: boolean;
}

export function AuthDialog({
  open,
  onOpenChange,
  callbackUrl,
  initialView = 'login',
  onAuthenticated,
  preventTranslation,
}: AuthDialogProps) {
  const [view, setView] = useState<AuthView>(initialView);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setView(initialView);
    }
    onOpenChange(nextOpen);
  };

  const handleSuccess = () => {
    onOpenChange(false);
    setView(initialView);
    onAuthenticated?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="gap-0 p-6 pt-8 sm:max-w-[400px]"
        {...(preventTranslation
          ? {
              translate: 'no' as const,
              'data-google-translate': 'no',
            }
          : {})}
      >
        <DialogHeader className="hidden">
          <DialogTitle>
            {view === 'login'
              ? m.auth_login_welcome_back()
              : m.auth_signup_create_account()}
          </DialogTitle>
        </DialogHeader>
        {view === 'login' ? (
          <LoginForm
            callbackUrl={callbackUrl}
            onSuccess={handleSuccess}
            onSwitchToSignup={() => setView('signup')}
          />
        ) : (
          <SignupForm
            callbackUrl={callbackUrl}
            onSuccess={handleSuccess}
            onSwitchToLogin={() => setView('login')}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
