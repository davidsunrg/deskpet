import { Routes } from '@/lib/routes';
import { ActionCards } from './action-cards';
import { DesktopPetCard, RecentCreations } from './hero-section';
import { MemoriesCard } from './memories-card';
import { PetHeader } from './pet-header';
import { InteractivePetCard, MemorialCard } from './right-column';
import { StudioPageShell } from './studio-page-shell';
import { StudioShell } from './studio-shell';

export function StudioDashboard() {
  return (
    <StudioShell>
      <StudioPageShell
        breadcrumbs={[
          { label: 'Studio', href: Routes.Studio },
          { label: 'Mochi', isCurrentPage: true },
        ]}
      >
        <div className="flex flex-col gap-4 md:gap-5">
          <PetHeader />
          <ActionCards />

          <div className="grid grid-cols-1 items-start gap-4 md:gap-5 xl:grid-cols-12">
            <div className="flex flex-col gap-4 md:gap-5 xl:col-span-4">
              <DesktopPetCard />
              <RecentCreations />
            </div>
            <div className="xl:col-span-4">
              <MemoriesCard />
            </div>
            <div className="xl:col-span-4">
              <InteractivePetCard />
              <div className="mt-4 md:mt-5">
                <MemorialCard />
              </div>
            </div>
          </div>
        </div>
      </StudioPageShell>
    </StudioShell>
  );
}
