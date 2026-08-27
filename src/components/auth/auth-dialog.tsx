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
}

export function AuthDialog({
  open,
  onOpenChange,
  callbackUrl,
  initialView = 'login',
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
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-100 border-0 p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {view === 'login'
              ? m.auth_login_sign_in()
              : m.auth_register_sign_up()}
          </DialogTitle>
        </DialogHeader>
        {view === 'login' ? (
          <LoginForm
            callbackUrl={callbackUrl}
            onSuccess={handleSuccess}
            onSwitchToSignup={() => setView('signup')}
            className="border-0 shadow-none"
          />
        ) : (
          <SignupForm
            callbackUrl={callbackUrl}
            onSuccess={handleSuccess}
            onSwitchToLogin={() => setView('login')}
            className="border-0 shadow-none"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
