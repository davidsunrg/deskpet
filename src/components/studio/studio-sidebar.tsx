'use client';

import { UserAvatar } from '@/components/shared/user-avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Routes } from '@/lib/routes';
import {
  IconHeart,
  IconHome,
  IconLogout,
  IconMessageCircle,
  IconMicrophone,
  IconPhoto,
  IconPlus,
  IconSelector,
  IconSettings,
  IconSettings2,
  IconShare,
  IconSparkles,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';

type Pet = {
  name: string;
  breed: string;
  avatar: string;
};

const pets: Pet[] = [
  {
    name: 'Mochi',
    breed: 'Golden Retriever',
    avatar: 'https://placehold.co/64x64/f2d8b3/8a6b3f?text=M',
  },
  {
    name: 'Bella',
    breed: 'Corgi',
    avatar: 'https://placehold.co/64x64/f7d9e3/a86b84?text=B',
  },
  {
    name: 'Coco',
    breed: 'Persian Cat',
    avatar: 'https://placehold.co/64x64/d7e8f7/5f7d99?text=C',
  },
];

/** Team-switcher style pet picker (sidebar-07 pattern, dashboard tokens). */
function PetSwitcher() {
  const { isMobile } = useSidebar();
  const [activePet, setActivePet] = useState<Pet>(pets[0]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <img
                src={activePet.avatar}
                alt={activePet.name}
                className="size-8 shrink-0 rounded-lg border object-cover"
              />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{activePet.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {activePet.breed}
                </span>
              </div>
              <IconSelector className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              My Pets
            </DropdownMenuLabel>
            {pets.map((pet, index) => (
              <DropdownMenuItem
                key={pet.name}
                onClick={() => setActivePet(pet)}
                className="gap-2 p-2"
              >
                <img
                  src={pet.avatar}
                  alt={pet.name}
                  className="size-6 shrink-0 rounded-md border object-cover"
                />
                <span className="truncate">{pet.name}</span>
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <IconPlus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add pet</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

const navItems = [
  { title: 'Home', icon: IconHome, href: Routes.Studio, active: true },
  { title: 'Create', icon: IconSparkles, href: '#' },
  { title: 'Memories', icon: IconPhoto, href: '#' },
  { title: 'AI Generation', icon: IconSparkles, href: '#' },
  { title: 'Voice', icon: IconMicrophone, href: '#' },
  { title: 'Chat', icon: IconMessageCircle, href: '#' },
  { title: 'Memorial', icon: IconHeart, href: '#' },
  { title: 'Gallery', icon: IconPhoto, href: '#' },
  { title: 'Share', icon: IconShare, href: '#' },
  { title: 'Settings', icon: IconSettings, href: '#' },
];

function StudioSidebarMain() {
  const { isMobile, setOpenMobile } = useSidebar();
  const closeMobileSidebar = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-0.5">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.title} className="py-1">
              <SidebarMenuButton asChild isActive={item.active}>
                <Link to={item.href} onClick={closeMobileSidebar}>
                  <item.icon className="size-4 shrink-0" />
                  <span className="truncate font-medium text-sm">
                    {item.title}
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

/** Static placeholder user block mirroring `SidebarUser` (no auth on /studio). */
function StudioUser() {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu className="border-t pt-4">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="bg-sidebar-accent/60 text-sidebar-accent-foreground hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserAvatar
                name="Daniel"
                image="https://placehold.co/72x72/e8d5c4/7a5c3f?text=D"
                className="size-8 border"
              />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Daniel</span>
                <span className="truncate text-xs text-muted-foreground">
                  daniel@deskpet.app
                </span>
              </div>
              <IconSelector className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <Link to={Routes.SettingsProfile} className="block">
              <DropdownMenuItem>
                <IconSettings2 className="mr-2 size-4" />
                Settings
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <IconLogout className="mr-2 size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function StudioSidebar() {
  return (
    <Sidebar collapsible="offcanvas" className="border-r-0">
      <SidebarHeader className="gap-[10px] px-[18px] pt-[18px] pb-2">
        <PetSwitcher />
      </SidebarHeader>

      <SidebarContent className="px-[18px] pt-0">
        <StudioSidebarMain />
      </SidebarContent>

      <SidebarFooter className="mt-auto gap-[10px] px-[18px] pb-[22px]">
        <StudioUser />
      </SidebarFooter>
    </Sidebar>
  );
}
