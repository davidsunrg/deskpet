import {
  dashboardCardClass,
  DashboardCardHeader,
} from '@/components/dashboard/dashboard-card';
import { useTranslations } from '@/lib/deskpet-i18n';
import { cn } from '@/lib/utils';
import { ImageIcon } from 'lucide-react';

type DashboardPetDetailPhotosStepProps = {
  photoKeys: string[];
  photoUrls: string[];
};

export function DashboardPetDetailPhotosStep({
  photoKeys,
  photoUrls,
}: DashboardPetDetailPhotosStepProps) {
  const t = useTranslations('DashboardPetDetail');

  return (
    <section
      className={cn(
        dashboardCardClass,
        'flex min-h-0 flex-1 flex-col p-5 sm:p-6'
      )}
    >
      <DashboardCardHeader
        icon={<ImageIcon className="size-[18px]" />}
        accent="bg-deskpet-mint-soft"
        title={t('photos.title')}
        description={t('photos.description')}
      />
      {photoUrls.length === 0 ? (
        <p className="m-0 text-sm text-deskpet-muted">
          No reference photos saved for this pet.
        </p>
      ) : (
        <ul className="mt-4 m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-4">
          {photoUrls.map((url, index) => (
            <li key={photoKeys[index] ?? index} className="min-w-0">
              <div className="aspect-square overflow-hidden rounded-2xl border-2 border-deskpet-ink/12 bg-deskpet-paper">
                <img
                  src={url}
                  alt={`Reference ${index + 1}`}
                  className="size-full object-contain"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
