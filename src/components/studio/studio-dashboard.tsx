import { ActionCards } from './action-cards';
import { DesktopPetCard, RecentCreations } from './hero-section';
import { MomentsCard } from './moments-card';
import { MochisDayCard } from './right-column';
import { StudioPageShell } from './studio-page-shell';
export function StudioDashboard() {
  return (
    <StudioPageShell>
      <ActionCards />
      <div className="studio-workspace">
        <div className="studio-left-column">
          <DesktopPetCard />
          <RecentCreations />
        </div>
        <MomentsCard />
        <div className="studio-right-column">
          <MochisDayCard />
        </div>
      </div>
    </StudioPageShell>
  );
}
