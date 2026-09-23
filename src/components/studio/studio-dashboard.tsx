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
      <StudioPageShell>
        <PetHeader />
        <ActionCards />
        <div className="studio-workspace">
          <div className="studio-left-column">
            <DesktopPetCard />
            <RecentCreations />
          </div>
          <MemoriesCard />
          <div className="studio-right-column">
            <InteractivePetCard />
            <MemorialCard />
          </div>
        </div>
      </StudioPageShell>
    </StudioShell>
  );
}
