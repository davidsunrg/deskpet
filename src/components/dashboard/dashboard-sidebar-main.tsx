import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import type { MenuItemConfig } from '@/types';
import { Link, useRouterState } from '@tanstack/react-router';
import type { SessionUser } from '@/auth/types';
import { useMemo } from 'react';

function filterByRole(
  items: MenuItemConfig[],
  userRole?: string | null
): MenuItemConfig[] {
  return items
    .filter((item) => {
      if (!item.authorizeOnly) return true;
      if (!userRole) return false;
      return item.authorizeOnly.includes(userRole);
    })
    .map((item) => {
      if (item.items && item.items.length > 0) {
        const filteredItems = filterByRole(item.items, userRole);
        return filteredItems.length > 0
          ? { ...item, items: filteredItems }
          : null;
      }
      return item;
    })
    .filter((item): item is MenuItemConfig => item !== null);
}

type DashboardSidebarMainProps = {
  items: MenuItemConfig[];
  user?: SessionUser | null;
};

export function DashboardSidebarMain({
  items,
  user,
}: DashboardSidebarMainProps) {
  const visibleItems = useMemo(
    () => filterByRole(items, user?.role),
    [items, user?.role]
  );
  const pathname = useRouterState({ select: (s) => s.location.pathname }) ?? '';
  const { isMobile, setOpenMobile } = useSidebar();

  const closeMobileSidebar = () => {
    if (isMobile) setOpenMobile(false);
  };

  const isActive = (href: string | undefined): boolean => {
    if (!href) return false;
    const p = pathname.replace(/\/$/, '') || '/';
    const h = href.replace(/\/$/, '') || '/';
    return p === h || p.startsWith(`${h}/`);
  };

  return (
    <>
      {visibleItems.map((item) => {
        if (item.items && item.items.length > 0) {
          return (
            <SidebarGroup key={item.title}>
              <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
              <SidebarGroupContent className="flex flex-col gap-0.5">
                <SidebarMenu>
                  {item.items.map((sub) => {
                    const SubIcon = sub.icon;
                    return (
                      <SidebarMenuItem key={sub.title} className="py-1">
                        <SidebarMenuButton
                          render={
                            <Link
                              to={sub.href ?? '#'}
                              onClick={closeMobileSidebar}
                            >
                              {SubIcon ? (
                                <SubIcon className="size-4 shrink-0" />
                              ) : null}
                              <span className="truncate font-medium text-sm">
                                {sub.title}
                              </span>
                            </Link>
                          }
                          isActive={isActive(sub.href)}
                        />
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        }

        const Icon = item.icon;
        return (
          <SidebarGroup key={item.title}>
            <SidebarGroupContent className="flex flex-col gap-2">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={
                      <Link to={item.href ?? '#'} onClick={closeMobileSidebar}>
                        {Icon ? <Icon className="size-4 shrink-0" /> : null}
                        <span className="truncate font-medium text-sm">
                          {item.title}
                        </span>
                      </Link>
                    }
                    isActive={isActive(item.href)}
                  />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        );
      })}
    </>
  );
}
