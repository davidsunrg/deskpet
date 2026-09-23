import {
  IconBell,
  IconCalendar,
  IconCheck,
  IconChevronRight,
  IconClock,
  IconPlus,
} from '@tabler/icons-react';
import { LocaleLink } from '@/lib/i18n/navigation';
import { Routes } from '@/lib/routes';
import { StudioButton, StudioCardHeader } from './studio-card';

const careTasks = [
  { icon: '🥣', title: 'Breakfast', time: '8:00 AM', complete: true },
  { icon: '🪮', title: 'Morning brushing', time: '9:30 AM', complete: true },
  { icon: '🐾', title: 'Evening walk', time: '6:00 PM', complete: false },
] as const;

export function MochisDayCard({
  isNewUser = false,
  showViewAll = true,
}: {
  isNewUser?: boolean;
  showViewAll?: boolean;
}) {
  return (
    <section className="studio-card studio-care" aria-label="Mochi's day">
      <StudioCardHeader
        icon={<IconCalendar />}
        title="Mochi's Day"
        action={<time dateTime="2026-09-23">Sep 23</time>}
      />
      {isNewUser ? (
        <div className="studio-care-empty">
          <span>
            <IconBell />
          </span>
          <h3>Never miss an important care task</h3>
          <p>
            Add Mochi's first reminder for meals, medicine, grooming, or vet
            visits.
          </p>
          <StudioButton primary>
            <IconPlus />
            Add first reminder
          </StudioButton>
        </div>
      ) : (
        <>
          <div className="studio-care-weight">
            <div className="studio-care-weight-copy">
              <div>
                <small>Weight</small>
                <strong>28.4 kg</strong>
              </div>
              <span>↓ 0.3 kg this month</span>
            </div>
            <svg
              viewBox="0 0 240 64"
              role="img"
              aria-label="Mochi's weight decreased gradually from 28.7 to 28.4 kilograms this month"
            >
              <path d="M4 13 C28 15 40 20 62 19 S96 29 120 27 S152 34 176 37 S208 46 236 48" />
              <circle cx="236" cy="48" r="4" />
            </svg>
            <div className="studio-care-weight-range">
              <span>Sep 2</span>
              <span>Sep 23</span>
            </div>
          </div>
          <div className="studio-care-section-heading">
            <div>
              <h3>Today</h3>
              <p>2 of 3 completed</p>
            </div>
            <span className="studio-care-progress" aria-hidden="true">
              <i />
            </span>
          </div>
          <ul className="studio-care-tasks">
            {careTasks.map((task) => (
              <li
                key={task.title}
                className={task.complete ? 'studio-care-task-complete' : ''}
              >
                <span className="studio-care-task-icon">{task.icon}</span>
                <span>
                  <strong>{task.title}</strong>
                  <small>{task.time}</small>
                </span>
                <span className="studio-care-check">
                  {task.complete ? <IconCheck /> : <IconClock />}
                </span>
              </li>
            ))}
          </ul>
          <div className="studio-care-summary">
            <div className="studio-care-summary-row">
              <span className="studio-care-summary-icon studio-care-reminder-icon">
                <IconBell />
              </span>
              <div>
                <small>Next reminder</small>
                <strong>Vet checkup</strong>
                <p>Tomorrow · 10:00 AM</p>
              </div>
              <IconChevronRight />
            </div>
            <div className="studio-care-summary-row">
              <span className="studio-care-summary-icon">🛁</span>
              <div>
                <small>Recent activity</small>
                <strong>Grooming completed</strong>
                <p>Sep 20 · Routine care</p>
              </div>
              <IconChevronRight />
            </div>
          </div>
          <div className="studio-care-actions">
            <StudioButton primary>
              <IconPlus />
              Add reminder
            </StudioButton>
            {showViewAll ? (
              <LocaleLink
                href={`${Routes.Studio}/care`}
                className="studio-button"
              >
                View all
              </LocaleLink>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}
