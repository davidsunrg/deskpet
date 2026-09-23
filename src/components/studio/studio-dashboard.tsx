import { ActionCards } from './action-cards';
import { DesktopPetCard, RecentCreations } from './hero-section';
import { MochisDayCard } from './right-column';
import { StudioPageShell } from './studio-page-shell';
import { TimelineCard } from './timeline-card';
export function StudioDashboard() {
  return (
    <StudioPageShell>
      <ActionCards />
      <div className="studio-workspace">
        <div className="studio-left-column">
          <DesktopPetCard />
          <RecentCreations />
        </div>
        <TimelineCard />
        <div className="studio-right-column">
          <MochisDayCard />
        </div>
      </div>
    </StudioPageShell>
  );
}
