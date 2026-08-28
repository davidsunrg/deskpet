import {
  dashboardCardClass,
  DashboardCardHeader,
} from '@/components/dashboard/dashboard-card';
import { PetAvatar } from '@/components/pets/pet-avatar';
import { formatDate, formatDateTime } from '@/lib/formatter';
import { useTranslations } from '@/lib/deskpet-i18n';
import { cn } from '@/lib/utils';
import { PawPrintIcon } from 'lucide-react';

type DashboardPetDetailBasicsStepProps = {
  avatarUrl: string | null;
  name: string;
  sexLabel: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export function DashboardPetDetailBasicsStep({
  avatarUrl,
  name,
  sexLabel,
  createdAt,
  updatedAt,
}: DashboardPetDetailBasicsStepProps) {
  const t = useTranslations('DashboardPetDetail');

  return (
    <section
      className={cn(
        dashboardCardClass,
        'flex min-h-0 flex-1 flex-col p-5 sm:p-6'
      )}
    >
      <DashboardCardHeader
        icon={<PawPrintIcon className="size-[18px]" />}
        accent="bg-[#fff2c8]"
        title={t('basics.title')}
        description={t('basics.description')}
      />
      <div className="grid gap-6">
        <div className="flex items-start gap-4">
          <PetAvatar src={avatarUrl} alt={name} size="lg" />
          <div className="min-w-0 grid gap-2">
            <div>
              <p className="m-0 text-xs font-bold uppercase tracking-wide text-deskpet-muted">
                {t('profile.nameLabel')}
              </p>
              <p className="m-0 mt-1 text-xl font-black text-deskpet-ink">
                {name}
              </p>
            </div>
            {sexLabel ? (
              <div>
                <p className="m-0 text-xs font-bold uppercase tracking-wide text-deskpet-muted">
                  {t('profile.sexLabel')}
                </p>
                <p className="m-0 mt-1 text-sm font-semibold text-deskpet-ink">
                  {sexLabel}
                </p>
              </div>
            ) : null}
          </div>
        </div>
        <dl className="m-0 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-deskpet-muted">
              Created
            </dt>
            <dd className="m-0 mt-1 text-sm font-semibold text-deskpet-ink">
              {formatDate(createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-deskpet-muted">
              Updated
            </dt>
            <dd className="m-0 mt-1 text-sm font-semibold text-deskpet-ink">
              {formatDateTime(updatedAt)}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
