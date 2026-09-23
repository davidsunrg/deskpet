import { MochisDayCard } from './right-column';
import { StudioPageShell } from './studio-page-shell';

export function StudioCarePage() {
  return (
    <StudioPageShell>
      <div className="studio-care-page">
        <MochisDayCard showViewAll={false} />
      </div>
    </StudioPageShell>
  );
}
