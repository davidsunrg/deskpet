import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import type { SessionUser } from '@/auth/types';
import { IconSelector } from '@tabler/icons-react';
import { UserAccountMenu } from '@/components/shared/user-account-menu';
import { UserAvatar } from '@/components/shared/user-avatar';

interface SidebarUserProps {
  user: SessionUser;
  className?: string;
}

export function SidebarUser({ user }: SidebarUserProps) {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu className="border-t pt-4">
      <SidebarMenuItem>
        <UserAccountMenu
          user={user}
          side={isMobile ? 'bottom' : 'right'}
          trigger={
            <SidebarMenuButton
              size="lg"
              className="bg-sidebar-accent/60 text-sidebar-accent-foreground hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserAvatar
                name={user.name ?? null}
                image={user.image ?? null}
                className="size-8 border"
              />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <IconSelector className="ml-auto size-4" />
            </SidebarMenuButton>
          }
        />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
