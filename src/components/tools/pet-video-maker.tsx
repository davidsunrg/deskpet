'use client';

import { notifyPetVideoInterest } from '@/api/notify-pet-video-interest';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { FileDropzone } from '@/components/ui/file-dropzone';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from '@/lib/deskpet-i18n';
import { cn } from '@/utils/cn';
import {
  ClapperboardIcon,
  Clock3Icon,
  ImageIcon,
  MonitorPlayIcon,
  XIcon,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const DURATION_OPTIONS = ['5s', '10s', '15s'] as const;
const RESOLUTION_OPTIONS = ['480p', '720p', '1080p'] as const;

/** Credits charged per second of generated video. */
const CREDITS_PER_SECOND: Record<(typeof RESOLUTION_OPTIONS)[number], number> =
  {
    '480p': 4,
    '720p': 9,
    '1080p': 32,
  };

type DurationOption = (typeof DURATION_OPTIONS)[number];
type ResolutionOption = (typeof RESOLUTION_OPTIONS)[number];

function durationSeconds(duration: DurationOption): number {
  return Number.parseInt(duration, 10);
}

function creditsForSelection(
  duration: DurationOption,
  resolution: ResolutionOption
): number {
  return durationSeconds(duration) * CREDITS_PER_SECOND[resolution];
}

/** Public image-to-video tool shell (generation wiring still pending). */
export function PetVideoMaker() {
  const t = useTranslations('PetVideoMakerPage');
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState<DurationOption>('5s');
  const [resolution, setResolution] = useState<ResolutionOption>('480p');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const interestNotifiedRef = useRef(false);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const hasImage = Boolean(selectedFile);

  const notifyInterest = () => {
    if (interestNotifiedRef.current) return;
    interestNotifiedRef.current = true;
    void notifyPetVideoInterest({
      data: {
        duration,
        resolution,
        audioEnabled,
        prompt,
        hasImage: true,
      },
    });
  };

  const optionChipClass = (active: boolean) =>
    cn(
      'inline-flex min-h-9 cursor-pointer items-center justify-center rounded-full border-2 px-3.5 text-sm font-black transition-colors',
      active
        ? 'border-deskpet-ink bg-deskpet-mint text-[#133e31] shadow-[2px_2px_0_0_rgba(55,39,51,0.12)]'
        : 'border-deskpet-ink/20 bg-white text-deskpet-ink hover:border-deskpet-ink hover:bg-deskpet-mint-soft'
    );

  const credits = useMemo(
    () => creditsForSelection(duration, resolution),
    [duration, resolution]
  );

  const statusItems = useMemo(
    () => [
      {
        id: 'photo',
        label: hasImage
          ? t('preview.statusImageReady')
          : t('preview.statusImageEmpty'),
        Icon: ImageIcon,
      },
      {
        id: 'duration',
        label: t('preview.statusDuration', { duration }),
        Icon: Clock3Icon,
      },
      {
        id: 'resolution',
        label: t('preview.statusResolution', { resolution }),
        Icon: MonitorPlayIcon,
      },
    ],
    [duration, hasImage, resolution, t]
  );

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start">
      <section
        aria-labelledby="pet-video-create-title"
        className="rounded-[28px] border-2 border-deskpet-ink bg-deskpet-paper p-5 shadow-[6px_6px_0_0_rgba(55,39,51,0.11)] sm:p-6 dark:border-border dark:bg-card"
      >
        <h2
          id="pet-video-create-title"
          className="m-0 text-2xl font-black tracking-tight text-deskpet-ink dark:text-foreground"
        >
          {t('create.title')}
        </h2>

        <div className="mt-5 space-y-5">
          <div className="space-y-2">
            <FileDropzone
              accept="image/png,image/jpeg,image/webp"
              multiple={false}
              title={t('create.uploadTitle')}
              hint={t('create.uploadHint')}
              onFiles={(files) => {
                const next = files[0];
                if (next) setSelectedFile(next);
              }}
              className="[&_button]:min-h-[160px] [&_button]:rounded-2xl [&_button]:border-2 [&_button]:border-dashed [&_button]:border-deskpet-ink/30 [&_button]:bg-white [&_button]:shadow-none"
            />
            {selectedFile ? (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-deskpet-ink/10 bg-white px-3 py-2 text-sm font-medium text-deskpet-ink">
                <span className="min-w-0 truncate">
                  {t('create.uploadSelected', { name: selectedFile.name })}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="inline-flex items-center gap-1 rounded-full border-2 border-deskpet-ink/15 px-2.5 py-1 text-xs font-black hover:bg-deskpet-mint-soft"
                >
                  <XIcon className="size-3.5" aria-hidden />
                  {t('create.uploadClear')}
                </button>
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pet-video-prompt">{t('create.promptLabel')}</Label>
            <Textarea
              id="pet-video-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder={t('create.promptPlaceholder')}
              rows={4}
              className="min-h-28 rounded-2xl border-2 border-deskpet-ink/15 bg-white px-3.5 py-3 text-sm font-medium text-deskpet-ink placeholder:text-deskpet-muted focus-visible:border-deskpet-ink"
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-deskpet-ink">
              {t('create.durationLabel')}
            </legend>
            <RadioGroup
              value={duration}
              onValueChange={(value) => setDuration(value as DurationOption)}
              className="flex flex-wrap gap-2"
              aria-label={t('create.durationLabel')}
            >
              {DURATION_OPTIONS.map((option) => (
                <div key={option} className="relative">
                  <RadioGroupItem
                    value={option}
                    id={`duration-${option}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`duration-${option}`}
                    className={optionChipClass(duration === option)}
                  >
                    {t(`create.durationOptions.${option}`)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-deskpet-ink">
              {t('create.resolutionLabel')}
            </legend>
            <RadioGroup
              value={resolution}
              onValueChange={(value) =>
                setResolution(value as ResolutionOption)
              }
              className="flex flex-wrap gap-2"
              aria-label={t('create.resolutionLabel')}
            >
              {RESOLUTION_OPTIONS.map((option) => (
                <div key={option} className="relative">
                  <RadioGroupItem
                    value={option}
                    id={`resolution-${option}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`resolution-${option}`}
                    className={optionChipClass(resolution === option)}
                  >
                    {t(`create.resolutionOptions.${option}`)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </fieldset>

          <div className="flex items-start justify-between gap-3 rounded-2xl border-2 border-deskpet-ink/10 bg-white p-3.5">
            <div className="min-w-0">
              <Label htmlFor="pet-video-audio" className="text-sm font-black">
                {t('create.audioLabel')}
              </Label>
              <p className="mt-1 text-xs font-medium text-deskpet-muted">
                {t('create.audioHint')}
              </p>
            </div>
            <Switch
              id="pet-video-audio"
              checked={audioEnabled}
              onCheckedChange={setAudioEnabled}
              aria-label={t('create.audioLabel')}
            />
          </div>

          <Button
            type="button"
            size="lg"
            variant="brutal"
            disabled={!hasImage}
            aria-disabled={!hasImage}
            className="h-12 w-full px-6 text-sm sm:w-auto"
            onClick={() => {
              setComingSoonOpen(true);
              notifyInterest();
            }}
          >
            {t('create.cta', { credits })}
          </Button>
        </div>
      </section>

      <AlertDialog open={comingSoonOpen} onOpenChange={setComingSoonOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('comingSoon.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('comingSoon.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setComingSoonOpen(false)}>
              {t('comingSoon.close')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <section
        aria-labelledby="pet-video-preview-title"
        className="rounded-[28px] border-2 border-deskpet-ink bg-deskpet-paper p-5 shadow-[6px_6px_0_0_rgba(55,39,51,0.11)] sm:p-6 dark:border-border dark:bg-card"
      >
        <h2
          id="pet-video-preview-title"
          className="m-0 text-2xl font-black tracking-tight text-deskpet-ink dark:text-foreground"
        >
          {t('preview.title')}
        </h2>

        <div
          className={cn(
            'mt-5 overflow-hidden rounded-[24px] border-2 border-deskpet-ink/15',
            previewUrl
              ? 'bg-deskpet-ink/90'
              : 'bg-linear-to-br from-deskpet-mint-soft via-white to-deskpet-sun/40'
          )}
        >
          <div className="relative aspect-video w-full">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={selectedFile?.name ?? t('preview.emptyTitle')}
                className="absolute inset-0 size-full object-contain"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
                <span className="grid size-16 place-items-center rounded-full border-2 border-deskpet-ink bg-deskpet-mint text-deskpet-ink shadow-[3px_3px_0_0_rgba(55,39,51,0.12)]">
                  <ClapperboardIcon className="size-7" aria-hidden />
                </span>
                <div className="max-w-sm space-y-1.5">
                  <p className="m-0 text-base font-black text-deskpet-ink">
                    {t('preview.emptyTitle')}
                  </p>
                  <p className="m-0 text-sm font-medium leading-5 text-deskpet-muted">
                    {t('preview.emptyDescription')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <ul className="mt-4 flex flex-wrap gap-2">
          {statusItems.map(({ id, label, Icon }) => (
            <li
              key={id}
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-deskpet-ink/10 bg-white px-3 py-1.5 text-xs font-black text-deskpet-ink shadow-[2px_2px_0_0_rgba(55,39,51,0.06)]"
            >
              <Icon className="size-3.5 text-[#18866d]" aria-hidden />
              {label}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
