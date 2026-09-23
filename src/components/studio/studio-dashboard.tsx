import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { ActionCards } from './action-cards';
import { DesktopPetCard, RecentCreations } from './hero-section';
import { MemoriesCard } from './memories-card';
import { PetHeader } from './pet-header';
import { InteractivePetCard, MemorialCard } from './right-column';
import { StudioSidebar } from './studio-sidebar';

export function StudioDashboard() {
  return (
    <div className="bg-[#faf7f1] text-[#2b2622]">
      <SidebarProvider
        className="mx-auto max-w-[1500px]"
        style={
          {
            '--sidebar-width': '208px',
            '--sidebar': '#faf7f1',
          } as React.CSSProperties
        }
      >
        <StudioSidebar />

        <SidebarInset className="min-w-0 bg-[#faf7f1]">
          <div className="px-4 pt-4 pb-6 sm:px-6 sm:pt-5 lg:px-7">
            <SidebarTrigger
              aria-label="Open menu"
              className="size-9 rounded-full bg-white text-[#6f655c] shadow-[0_1px_4px_rgba(43,38,34,0.08)] ring-1 ring-[#f0eae0] hover:bg-[#faf7f1] md:hidden"
            />

            <div className="mt-4 flex flex-col gap-5 md:mt-0">
              <PetHeader />
              <ActionCards />

              <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
                <div className="flex flex-col gap-5 xl:col-span-4">
                  <DesktopPetCard />
                  <RecentCreations />
                </div>
                <div className="xl:col-span-4">
                  <MemoriesCard />
                </div>
                <div className="xl:col-span-4">
                  <InteractivePetCard />
                  <div className="mt-5">
                    <MemorialCard />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
