import {
  dashboardCardClass,
  DashboardCardHeader,
} from '@/components/dashboard/dashboard-card';
import { Button } from '@/components/ui/button';
import type { MarketingPetMakerPhoto } from '@/components/marketing/pet-maker/use-marketing-pet-maker';
import { useTranslations } from '@/lib/deskpet-i18n';
import { cn } from '@/lib/utils';
import { ImageIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import type { ChangeEvent, RefObject } from 'react';

type MarketingPetMakerPhotosStepProps = {
  photos: MarketingPetMakerPhoto[];
  inputRef: RefObject<HTMLInputElement | null>;
  photoPickerButtonRef: RefObject<HTMLButtonElement | null>;
  accept: string;
  maxPhotos: number;
  onFilesSelected: (files: FileList | null) => void;
  onRemovePhoto: (id: string) => void;
  onRetryPhoto: (id: string) => void;
};

export function MarketingPetMakerPhotosStep({
  photos,
  inputRef,
  photoPickerButtonRef,
  accept,
  maxPhotos,
  onFilesSelected,
  onRemovePhoto,
  onRetryPhoto,
}: MarketingPetMakerPhotosStepProps) {
  const t = useTranslations('MarketingPetMaker');
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFilesSelected(event.target.files);
    event.target.value = '';
  };

  return (
    <section className={cn(dashboardCardClass, 'p-5 sm:p-6')}>
      <DashboardCardHeader
        icon={<ImageIcon className="size-[18px]" />}
        accent="bg-deskpet-mint-soft"
        title={t('photos.title')}
        description={t('photos.description')}
      />
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={handleChange}
      />
      <ul className="mt-4 m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo) => (
          <li key={photo.id} className="min-w-0">
            <div className="relative aspect-square overflow-hidden rounded-2xl border-2 border-deskpet-ink/12 bg-deskpet-paper">
              <img
                src={photo.displayUrl}
                alt={photo.name}
                className="size-full object-contain"
              />
              {photo.status === 'uploading' || photo.status === 'pending' ? (
                <div className="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-2 text-center text-xs font-bold text-white">
                  {t('photos.uploading', { progress: photo.progress })}
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/25">
                    <div
                      className="h-full rounded-full bg-deskpet-mint transition-[width]"
                      style={{ width: `${photo.progress}%` }}
                    />
                  </div>
                </div>
              ) : null}
              {photo.status === 'error' ? (
                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-black/65 px-2 py-2 text-center">
                  <p className="m-0 text-[11px] font-bold text-white">
                    {t('photos.uploadFailed')}
                  </p>
                  {photo.file ? (
                    <button
                      type="button"
                      className="text-[11px] font-black uppercase tracking-wide text-deskpet-mint"
                      onClick={() => onRetryPhoto(photo.id)}
                    >
                      {t('photos.retry')}
                    </button>
                  ) : null}
                </div>
              ) : null}
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                className="absolute top-2 right-2 size-8 rounded-full border border-deskpet-ink/12 bg-white/95 text-destructive shadow-sm hover:bg-white"
                aria-label={t('photos.remove')}
                disabled={
                  photo.status === 'uploading' || photo.status === 'pending'
                }
                onClick={() => onRemovePhoto(photo.id)}
              >
                <Trash2Icon className="size-3.5" />
              </Button>
            </div>
          </li>
        ))}
        <li>
          <button
            ref={photoPickerButtonRef}
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={photos.length >= maxPhotos}
            className="grid aspect-square w-full place-items-center rounded-2xl border-2 border-dashed border-deskpet-ink/25 bg-white text-center text-sm font-bold text-deskpet-muted transition-colors hover:bg-deskpet-mint-soft disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="grid gap-2 place-items-center">
              <PlusIcon className="size-7" />
              {t('photos.add')}
            </span>
          </button>
        </li>
      </ul>
    </section>
  );
}
