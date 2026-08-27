import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import type { SquareCropPixels } from '@/utils/compress-square-avatar';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/lib/deskpet-i18n';
import { useCallback, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';

type PetAvatarCropDialogProps = {
  open: boolean;
  imageSrc: string;
  busy?: boolean;
  preventTranslation?: boolean;
  onCancel: () => void;
  onConfirm: (crop: SquareCropPixels) => void;
};

/**
 * Square avatar crop modal (react-easy-crop). Shown alone — hide the profile
 * dialog while this is open so two modals never stack.
 */
export function PetAvatarCropDialog({
  open,
  imageSrc,
  busy = false,
  preventTranslation = false,
  onCancel,
  onConfirm,
}: PetAvatarCropDialogProps) {
  const t = useTranslations('PetsPage.profile');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<SquareCropPixels | null>(null);

  const handleCropComplete = useCallback((_croppedArea: Area, pixels: Area) => {
    setCroppedAreaPixels({
      x: pixels.x,
      y: pixels.y,
      width: pixels.width,
      height: pixels.height,
    });
  }, []);

  const handleOpenChange = (next: boolean) => {
    if (!next && !busy) {
      onCancel();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        translate={preventTranslation ? 'no' : undefined}
        data-google-translate={preventTranslation ? 'no' : undefined}
        className={cn('sm:max-w-lg', preventTranslation && 'notranslate')}
      >
        <DialogHeader>
          <DialogTitle>{t('avatarCropTitle')}</DialogTitle>
          <DialogDescription>{t('avatarCropDescription')}</DialogDescription>
        </DialogHeader>

        <div className="relative h-72 w-full overflow-hidden rounded-lg bg-muted">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="rect"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pet-avatar-zoom">{t('avatarCropZoom')}</Label>
          <Slider
            id="pet-avatar-zoom"
            min={1}
            max={3}
            step={0.05}
            value={[zoom]}
            onValueChange={(value) => setZoom(value[0] ?? 1)}
            disabled={busy}
          />
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            type="button"
            variant="brutalOutline"
            size="lg"
            className="min-h-11 gap-2 px-4 text-[13px]"
            onClick={onCancel}
            disabled={busy}
          >
            {t('avatarCropCancel')}
          </Button>
          <Button
            type="button"
            variant="brutal"
            size="lg"
            className="min-h-11 gap-2 px-4 text-[13px]"
            disabled={busy || !croppedAreaPixels}
            onClick={() => {
              if (croppedAreaPixels) {
                onConfirm(croppedAreaPixels);
              }
            }}
          >
            {busy ? t('avatarUploading') : t('avatarCropConfirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
