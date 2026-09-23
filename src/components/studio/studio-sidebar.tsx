import {
  IconCrown,
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
  IconUser,
} from '@tabler/icons-react';
import { useState } from 'react';
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
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navItemClass =
  'flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium text-[#6f655c] transition-colors hover:bg-white hover:text-[#2b2622]';

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        navItemClass,
        active &&
          'bg-white text-[#2b2622] shadow-[0_1px_3px_rgba(43,38,34,0.06)]'
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function NavDivider() {
  return <div className="my-3 h-px bg-[#eee7dc]" />;
}

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

function PetSwitcher() {
  const { isMobile } = useSidebar();
  const [activePet, setActivePet] = useState<Pet>(pets[0]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-2xl bg-white p-2.5 text-left shadow-[0_1px_4px_rgba(43,38,34,0.08)] ring-1 ring-[#f0eae0] transition-colors hover:bg-[#fdfaf5] data-[state=open]:ring-[#e4dccc]"
        >
          <img
            src={activePet.avatar}
            alt={activePet.name}
            className="size-9 shrink-0 rounded-xl object-cover"
          />
          <span className="grid min-w-0 flex-1 leading-tight">
            <span className="truncate text-[14px] font-bold text-[#2b2622]">
              {activePet.name}
            </span>
            <span className="truncate text-[11px] text-[#a2978b]">
              {activePet.breed}
            </span>
          </span>
          <IconSelector className="size-4 shrink-0 text-[#b3a89b]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl"
        align="start"
        side={isMobile ? 'bottom' : 'right'}
        sideOffset={4}
      >
        <DropdownMenuLabel className="text-xs text-[#a2978b]">
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
              className="size-6 shrink-0 rounded-md object-cover"
            />
            <span className="truncate">{pet.name}</span>
            <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 p-2">
          <div className="flex size-6 items-center justify-center rounded-md border border-[#e9e2d6] bg-transparent">
            <IconPlus className="size-4" />
          </div>
          <div className="font-medium text-[#a2978b]">Add pet</div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function StudioSidebar() {
  const { isMobile, setOpenMobile } = useSidebar();
  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="offcanvas" className="border-r-0">
      <SidebarHeader className="px-5 pt-6 pb-0">
        <PetSwitcher />
      </SidebarHeader>

      <SidebarContent className="gap-0 px-5 pt-6">
        <nav className="flex flex-col gap-1">
          <NavItem
            icon={<IconHome className="size-[18px]" strokeWidth={1.8} />}
            label="Home"
            onClick={closeOnMobile}
          />
          <NavItem
            icon={<IconSparkles className="size-[18px]" strokeWidth={1.8} />}
            label="Create"
            onClick={closeOnMobile}
          />
          <NavItem
            icon={<IconPhoto className="size-[18px]" strokeWidth={1.8} />}
            label="Memories"
            onClick={closeOnMobile}
          />
          <NavItem
            icon={<IconSparkles className="size-[18px]" strokeWidth={1.8} />}
            label="AI Generation"
            onClick={closeOnMobile}
          />
          <NavItem
            icon={<IconMicrophone className="size-[18px]" strokeWidth={1.8} />}
            label="Voice"
            onClick={closeOnMobile}
          />
          <NavItem
            icon={
              <IconMessageCircle className="size-[18px]" strokeWidth={1.8} />
            }
            label="Chat"
            onClick={closeOnMobile}
          />
          <NavItem
            icon={<IconHeart className="size-[18px]" strokeWidth={1.8} />}
            label="Memorial"
            onClick={closeOnMobile}
          />
        </nav>

        <NavDivider />

        <nav className="flex flex-col gap-1">
          <NavItem
            icon={<IconPhoto className="size-[18px]" strokeWidth={1.8} />}
            label="Gallery"
            onClick={closeOnMobile}
          />
          <NavItem
            icon={<IconShare className="size-[18px]" strokeWidth={1.8} />}
            label="Share"
            onClick={closeOnMobile}
          />
        </nav>

        <NavDivider />

        <nav className="flex flex-col gap-1">
          <NavItem
            icon={<IconSettings className="size-[18px]" strokeWidth={1.8} />}
            label="Settings"
            onClick={closeOnMobile}
          />
        </nav>
      </SidebarContent>

      <SidebarFooter className="px-5 pt-4 pb-6">
        <div className="rounded-2xl bg-gradient-to-br from-[#f4f0ff] to-[#e7dfff] p-4">
          <div className="flex items-center gap-2">
            <IconCrown className="size-4 text-[#f2a03d]" />
            <span className="text-[13px] font-bold text-[#2b2622]">
              Upgrade to Pro
            </span>
          </div>
          <p className="mt-1.5 text-[11px] leading-snug text-[#8b7f9c]">
            More creations, more memories.
          </p>
        </div>

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="mt-3 flex w-full items-center gap-2.5 rounded-2xl bg-white p-2.5 text-left shadow-[0_1px_4px_rgba(43,38,34,0.08)] ring-1 ring-[#f0eae0] transition-colors hover:bg-[#fdfaF5] data-[state=open]:ring-[#e4dccc]"
            >
              <img
                src="https://placehold.co/72x72/e8d5c4/7a5c3f?text=D"
                alt="Daniel"
                className="size-8 shrink-0 rounded-full object-cover"
              />
              <span className="grid min-w-0 flex-1 leading-tight">
                <span className="truncate text-[13px] font-semibold text-[#2b2622]">
                  Daniel
                </span>
                <span className="truncate text-[11px] text-[#a2978b]">
                  daniel@deskpet.app
                </span>
              </span>
              <IconSelector className="size-4 shrink-0 text-[#b3a89b]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
          >
            <DropdownMenuItem>
              <IconUser className="mr-2 size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <IconSettings2 className="mr-2 size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <IconLogout className="mr-2 size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
