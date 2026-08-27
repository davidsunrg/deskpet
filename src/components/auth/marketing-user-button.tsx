import { getMarketingAvatarLinks } from '@/config/marketing-avatar-config';
import type { MarketingNavbarIdentity } from '@/lib/auth/marketing-identity';
import { m } from '@/locale/paraglide/messages';
import { authClient } from '@/auth/client';
import { IconLogout } from '@tabler/icons-react';
import { Link, useRouter } from '@tanstack/react-router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PetAvatar } from '@/components/pets/pet-avatar';
import { Logo } from '@/components/shared/logo';
import { useState } from 'react';
import { toast } from 'sonner';
import { sessionUserDisplayName } from '@/lib/auth/session-identity';

interface MarketingUserButtonProps {
  identity: MarketingNavbarIdentity;
}

export function MarketingUserButton({ identity }: MarketingUserButtonProps) {
  const router = useRouter();
  const avatarLinks = getMarketingAvatarLinks();
  const [open, setOpen] = useState(false);
  const user = identity.user;
  const displayName = sessionUserDisplayName(user, 'Guest');
  const petName = identity.pet?.name ?? displayName;

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          setOpen(false);
          router.navigate({ to: '/' });
          void router.invalidate();
        },
        onError: (err) => {
          toast.error(m.auth_common_logout_failed());
          console.error('sign out error:', err);
        },
      },
    });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        aria-label={m.common_user_menu()}
        className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {identity.pet?.avatar ? (
          <PetAvatar
            src={identity.pet.avatar}
            alt={petName}
            size="sm"
            className="border"
          />
        ) : (
          <div className="flex size-8 items-center justify-center overflow-hidden rounded-full border bg-background">
            <Logo className="size-6 rounded-none" />
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="flex items-center gap-2 p-2">
          <div className="flex min-w-0 flex-col space-y-1 leading-none">
            <p className="truncate font-medium">{petName}</p>
            {user?.email ? (
              <p className="truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            ) : null}
          </div>
        </div>
        <DropdownMenuSeparator />
        {avatarLinks.map((item) =>
          item.href ? (
            <Link key={item.title} to={item.href} className="block">
              <DropdownMenuItem>
                {item.icon ? <item.icon className="mr-2 size-4" /> : null}
                {item.title}
              </DropdownMenuItem>
            </Link>
          ) : null
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async (event) => {
            event.preventDefault();
            setOpen(false);
            await handleSignOut();
          }}
        >
          <IconLogout className="mr-2 size-4" />
          {m.auth_common_logout()}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
