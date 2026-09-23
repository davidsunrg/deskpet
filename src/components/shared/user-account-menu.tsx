import {
  IconCreditCard,
  IconDeviceDesktop,
  IconLanguage,
  IconLogout,
  IconMoon,
  IconSettings2,
  IconSun,
} from '@tabler/icons-react';
import { Link, useRouter } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import { authClient } from '@/auth/client';
import type { SessionUser } from '@/auth/types';
import { useLocaleSwitcher } from '@/components/layout/locale-switcher';
import { useTheme } from '@/components/theme/theme-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { websiteConfig } from '@/config/website';
import {
  localeConfig,
  localeSwitchEnabled,
  locales,
  type Locale,
} from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { m } from '@/locale/paraglide/messages';
import { UserAvatar } from './user-avatar';

type UserAccountMenuProps = {
  user: SessionUser;
  trigger: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  contentClassName?: string;
};

export function UserAccountMenu({
  user,
  trigger,
  side = 'bottom',
  align = 'end',
  contentClassName,
}: UserAccountMenuProps) {
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const [open, setOpen] = useState(false);
  const { currentLocale, switchLocale } = useLocaleSwitcher({
    onLocaleChange: () => setOpen(false),
  });
  const showModeSwitch = websiteConfig.ui?.mode?.enableSwitch ?? false;
  const showLocaleSwitch = localeSwitchEnabled && locales.length > 1;
  const showBilling = websiteConfig.payment?.enable === true;
  const ThemeIcon =
    theme === 'system'
      ? IconDeviceDesktop
      : theme === 'dark'
        ? IconMoon
        : IconSun;

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.navigate({ to: '/' });
        },
        onError: (error) => {
          toast.error(m.auth_common_logout_failed());
          console.error('sign out error:', error);
        },
      },
    });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn(
          'w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg',
          contentClassName
        )}
        side={side}
        align={align}
        sideOffset={4}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <UserAvatar
                name={user.name ?? null}
                image={user.image ?? null}
                className="size-8 border"
              />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-foreground">
                  {user.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />
          {showBilling ? (
            <Link
              to={Routes.SettingsBilling}
              className="block"
              onClick={() => setOpen(false)}
            >
              <DropdownMenuItem>
                <IconCreditCard className="mr-2 size-4" />
                {m.dashboard_avatar_billing()}
              </DropdownMenuItem>
            </Link>
          ) : null}
          <Link
            to={Routes.SettingsProfile}
            className="block"
            onClick={() => setOpen(false)}
          >
            <DropdownMenuItem>
              <IconSettings2 className="mr-2 size-4" />
              {m.dashboard_avatar_settings()}
            </DropdownMenuItem>
          </Link>

          {showModeSwitch && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <ThemeIcon className="mr-2 size-4" />
                  {m.common_mode_theme()}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setTheme('light')}>
                    <IconSun className="mr-2 size-4" />
                    {m.common_mode_light()}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')}>
                    <IconMoon className="mr-2 size-4" />
                    {m.common_mode_dark()}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')}>
                    <IconDeviceDesktop className="mr-2 size-4" />
                    {m.common_mode_system()}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </>
          )}

          {showLocaleSwitch && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <IconLanguage className="mr-2 size-4" />
                {m.common_switch_language()}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {locales.map((locale: Locale) => (
                  <DropdownMenuItem
                    key={locale}
                    className="h-8 py-0.5"
                    onClick={() => switchLocale(locale)}
                    disabled={locale === currentLocale}
                  >
                    {localeConfig[locale].flag ? (
                      <span className="mr-2 text-base">
                        {localeConfig[locale].flag}
                      </span>
                    ) : null}
                    <span>{localeConfig[locale].name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
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
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
