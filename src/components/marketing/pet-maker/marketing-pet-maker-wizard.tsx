'use client';

import { AuthDialog } from '@/components/auth/auth-dialog';
import { MarketingPetMakerBasicsStep } from '@/components/marketing/pet-maker/marketing-pet-maker-basics-step';
import { MarketingPetMakerDetailsStep } from '@/components/marketing/pet-maker/marketing-pet-maker-details-step';
import { MarketingPetMakerPhotosStep } from '@/components/marketing/pet-maker/marketing-pet-maker-photos-step';
import { MarketingPetMakerStepNav } from '@/components/marketing/pet-maker/marketing-pet-maker-step-nav';
import { useMarketingPetMaker } from '@/components/marketing/pet-maker/use-marketing-pet-maker';
import {
  dashboardCardClass,
  DashboardCardHeader,
} from '@/components/dashboard/dashboard-card';
import { PetAvatarCropDialog } from '@/components/pets/pet-avatar-crop-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { CtaButton } from '@/components/ui/cta-button';
import { useTranslations } from '@/lib/deskpet-i18n';
import { cn } from '@/lib/utils';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  LoaderIcon,
  PawPrintIcon,
} from 'lucide-react';

export function MarketingPetMakerWizard() {
  const t = useTranslations('MarketingPetMaker');
  const maker = useMarketingPetMaker();

  if (maker.resumingCreateAfterAuth) {
    return (
      <div
        translate="no"
        data-google-translate="no"
        className="notranslate mx-auto flex max-w-7xl flex-col gap-6 pb-12"
      >
        <header className="text-center">
          <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-deskpet-muted">
            {t('eyebrow')}
          </p>
          <h1 className="font-sans text-[clamp(2rem,5vw,4rem)] font-black tracking-tight text-deskpet-ink">
            {t('title')}
          </h1>
        </header>

        <section
          className={cn(
            dashboardCardClass,
            'mx-auto flex w-full max-w-lg flex-col items-center gap-4 p-8 text-center'
          )}
        >
          <DashboardCardHeader
            icon={<PawPrintIcon className="size-[18px]" />}
            accent="bg-deskpet-mint-soft"
            title={t('profile.resumeCreatingTitle')}
            description={t('profile.resumeCreatingDescription')}
          />
          <LoaderIcon className="size-8 animate-spin text-deskpet-ink" />
        </section>

        <AuthDialog
          open={maker.authOpen}
          onOpenChange={maker.setAuthOpen}
          callbackUrl={maker.makerCallbackHref}
          onAuthenticated={maker.handleAuthAuthenticated}
          preventTranslation
        />
      </div>
    );
  }

  return (
    <div
      translate="no"
      data-google-translate="no"
      className="notranslate mx-auto flex max-w-7xl flex-col gap-6 pb-12"
    >
      <header className="text-center">
        <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-deskpet-muted">
          {t('eyebrow')}
        </p>
        <h1 className="font-sans text-[clamp(2rem,5vw,4rem)] font-black tracking-tight text-deskpet-ink">
          {t('title')}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-deskpet-muted">
          {t('description')}
        </p>
      </header>

      <MarketingPetMakerStepNav
        step={maker.step}
        currentIndex={maker.currentIndex}
        isStepUnlocked={maker.isStepUnlocked}
        onStepChange={maker.goToStep}
      />

      {maker.step === 'photos' ? (
        <MarketingPetMakerPhotosStep
          photos={maker.photos}
          inputRef={maker.inputRef}
          photoPickerButtonRef={maker.photoPickerButtonRef}
          accept={maker.imageAccept}
          maxPhotos={maker.maxPhotos}
          onFilesSelected={maker.handleFiles}
          onRemovePhoto={maker.removePhoto}
          onRetryPhoto={maker.retryPhotoUpload}
        />
      ) : null}

      {maker.step === 'basics' ? (
        <>
          <MarketingPetMakerBasicsStep
            displayAvatarUrl={maker.displayAvatarUrl}
            petName={maker.petName}
            sex={maker.sex}
            avatarEnabled={maker.avatarEnabled}
            croppingAvatar={maker.croppingAvatar}
            onUpdateAvatar={maker.openAvatarUpdate}
            onPetNameChange={maker.setPetName}
            onSexChange={maker.setSex}
          />
          {maker.avatarEnabled ? (
            <input
              ref={maker.avatarInputRef}
              type="file"
              accept={maker.imageAccept}
              className="hidden"
              onChange={(event) => {
                maker.handleAvatarFile(event.target.files?.[0]);
              }}
            />
          ) : null}
        </>
      ) : null}

      {maker.step === 'details' ? (
        <MarketingPetMakerDetailsStep
          displayAvatarUrl={maker.displayAvatarUrl}
          petName={maker.petName.trim()}
          sex={maker.sex}
          species={maker.species}
          breed={maker.breed}
          onSpeciesChange={maker.handleSpeciesChange}
          onBreedChange={maker.setBreed}
        />
      ) : null}

      <footer className="flex flex-wrap justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={maker.currentIndex === 0}
            onClick={maker.handleBack}
          >
            <ArrowLeftIcon className="size-4" />
            {t('nav.back')}
          </Button>
        </div>
        <CtaButton
          type="button"
          disabled={
            !maker.canContinue ||
            maker.creatingPet ||
            maker.waitingForRecognition ||
            maker.uploadingPhotos
          }
          onClick={maker.handleContinue}
        >
          {maker.creatingPet || maker.waitingForRecognition ? (
            <LoaderIcon className="size-4 animate-spin" />
          ) : null}
          {maker.creatingPet
            ? t('profile.creating')
            : maker.waitingForRecognition
              ? t('basics.waitingForRecognition')
              : maker.step === 'details'
                ? t('nav.createPet')
                : t('nav.continue')}
          {maker.creatingPet || maker.waitingForRecognition ? null : (
            <ArrowRightIcon className="size-4" />
          )}
        </CtaButton>
      </footer>

      <AlertDialog
        open={maker.unsupportedRecognitionOpen}
        onOpenChange={maker.setUnsupportedRecognitionOpen}
      >
        <AlertDialogContent
          translate="no"
          data-google-translate="no"
          className="notranslate"
        >
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('recognition.unsupportedTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('recognition.unsupportedBody')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => maker.setUnsupportedRecognitionOpen(false)}
            >
              {t('recognition.close')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={maker.handleChooseDifferentPhotos}>
              {t('recognition.chooseDifferentPhotos')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {maker.avatarEnabled && maker.cropImageSrc ? (
        <PetAvatarCropDialog
          open={maker.cropOpen}
          imageSrc={maker.cropImageSrc}
          busy={maker.croppingAvatar}
          preventTranslation
          onCancel={maker.handleCropCancel}
          onConfirm={(crop) => {
            void maker.handleCropConfirm(crop);
          }}
        />
      ) : null}

      <AuthDialog
        open={maker.authOpen}
        onOpenChange={maker.setAuthOpen}
        callbackUrl={maker.makerCallbackHref}
        onAuthenticated={maker.handleAuthAuthenticated}
        preventTranslation
      />
    </div>
  );
}
