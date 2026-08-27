import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { getSidebarLinks } from '@/config/sidebar-config';
import type { MenuItemConfig } from '@/types';
import { Link, useRouterState } from '@tanstack/react-router';
import type { SessionUser } from '@/auth/types';
import { isValidElement, useMemo, type ComponentType } from 'react';

function renderMenuIcon(icon: MenuItemConfig['icon']) {
  if (!icon) return null;
  if (isValidElement(icon)) return icon;
  const Icon = icon as ComponentType<{ className?: string }>;
  return <Icon className="size-4 shrink-0" />;
}

/**
 * Filters sidebar links based on user role (authorizeOnly)
 */
function useFilteredSidebarLinks(user: SessionUser): MenuItemConfig[] {
  const userRole = user.role;

  return useMemo(() => {
    const links = getSidebarLinks();
    const filterByRole = (items: MenuItemConfig[]): MenuItemConfig[] => {
      return items
        .filter((item) => {
          if (!item.authorizeOnly) return true;
          if (!userRole) return false;
          return item.authorizeOnly.includes(userRole);
        })
        .map((item) => {
          if (item.items && item.items.length > 0) {
            const filteredItems = filterByRole(item.items);
            return filteredItems.length > 0
              ? { ...item, items: filteredItems }
              : null;
          }
          return item;
        })
        .filter((item): item is MenuItemConfig => item !== null);
    };

    return filterByRole(links);
  }, [userRole]);
}

interface SidebarMainProps {
  user: SessionUser;
}

export function SidebarMain({ user }: SidebarMainProps) {
  const items = useFilteredSidebarLinks(user);
  const pathname = useRouterState({ select: (s) => s.location.pathname }) ?? '';
  const { isMobile, setOpenMobile } = useSidebar();

  const closeMobileSidebar = () => {
    if (isMobile) setOpenMobile(false);
  };

  const isActive = (href: string | undefined): boolean => {
    if (!href) return false;
    const p = pathname.replace(/\/$/, '') || '/';
    const h = href.replace(/\/$/, '') || '/';
    return p === h;
  };

  const renderItem = (item: MenuItemConfig, key: string) => {
    if (item.items && item.items.length > 0) {
      return (
        <SidebarGroup key={key}>
          <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-col gap-0.5">
            <SidebarMenu>
              {item.items.map((sub) => (
                <SidebarMenuItem key={sub.title} className="py-1">
                  <SidebarMenuButton asChild isActive={isActive(sub.href)}>
                    <Link to={sub.href ?? '#'} onClick={closeMobileSidebar}>
                      {renderMenuIcon(sub.icon)}
                      <span className="truncate font-medium text-sm">
                        {sub.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      );
    }
    return (
      <SidebarGroup key={key}>
        <SidebarGroupContent className="flex flex-col gap-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive(item.href)}>
                <Link to={item.href ?? '#'} onClick={closeMobileSidebar}>
                  {renderMenuIcon(item.icon)}
                  <span className="truncate font-medium text-sm">
                    {item.title}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  return (
    <>
      {items.map((item) =>
        renderItem(
          item,
          item.title + (item.items?.map((i) => i.title).join('-') ?? '')
        )
      )}
    </>
  );
}
