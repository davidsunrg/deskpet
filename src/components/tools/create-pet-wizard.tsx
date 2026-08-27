'use client';

import {
  deletePetMakerStagingObjectFn,
  getPetMakerStagingUploadUrlFn,
} from '@/api/pet-maker-wizard';
import { AuthDialog } from '@/components/auth/auth-dialog';
import {
  dashboardCardClass,
  DashboardCardHeader,
} from '@/components/dashboard/dashboard-card';
import { PetAvatar } from '@/components/pets/pet-avatar';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { authClient } from '@/lib/auth/auth-client';
import { useLocale, useTranslations } from '@/lib/deskpet-i18n';
import { uploadFileWithPresignedUrl } from '@/lib/storage/presigned-upload';
import { isRealSignedInUser } from '@/lib/auth/session-identity';
import { DEFAULT_LOCALE } from '@/lib/i18n/routing';
import { Routes } from '@/lib/routes';
import type { CreatorPetRecognitionData } from '@/types/creator-recognition';
import { userFacingClientErrorMessage } from '@/lib/analytics/user-facing-client-error-message';
import { cn } from '@/lib/utils';
import { assertActionSuccess } from '@/utils/assert-action-success';
import { wrapNestedServerFn } from '@/utils/wrap-server-fn';
import {
  compressSquareAvatar,
  compressSquareAvatarFromCrop,
  isSupportedAvatarImageType,
  type SquareCropPixels,
} from '@/utils/compress-square-avatar';
import { MAX_FILE_SIZE, PET_MEDIA_MAX_FILE_SIZE } from '@/utils/constants';
import {
  createEmptyDraft,
  ensureDraftId,
  readDraft,
  writeDraft,
} from '@/utils/pets/pet-maker-local-draft';
import {
  getPetBreedLabel,
  getPetSpeciesLabel,
  isPetSpecies,
  listPetBreedsForSpecies,
  PET_SPECIES_VALUES,
  PetBreed,
  PetSex,
  type PetBreed as PetBreedId,
  type PetSpecies as PetSpeciesId,
  speciesUsesBreeds,
} from '@/utils/pet-catalog';
import { ACTION_POSE_REFERENCE_MIME_TYPE } from '@/utils/pets/action-pose';
import { preparePetActionReferenceImage } from '@/utils/pets/prepare-pet-action-reference-image';
import {
  isUnsupportedCreatorRecognitionSpecies,
  mapPetRecognitionToPrefill,
} from '@/utils/pets/map-pet-recognition-to-prefill';
import { uploadPetAvatar } from '@/utils/pets/upload-pet-avatar';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ImageIcon,
  LoaderIcon,
  PawPrintIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const WIZARD_STEPS = ['photos', 'basics', 'details'] as const;

/** Flip to `true` to re-enable avatar crop/upload in the pet maker. */
const ENABLE_PET_MAKER_AVATAR = false;

type RecognitionStatus = 'idle' | 'loading' | 'success' | 'skipped';
const PRICING_URL = Routes.Pricing;

type WizardStep = (typeof WIZARD_STEPS)[number];

type WizardPhotoUploadStatus = 'pending' | 'uploading' | 'ready' | 'error';

type WizardPhoto = {
  id: string;
  name: string;
  /** Local blob for in-session preview; server URL only after refresh restore. */
  displayUrl: string;
  file: File | null;
  status: WizardPhotoUploadStatus;
  progress: number;
  r2Key?: string;
  /** Same-origin server URL for localStorage restore after refresh. */
  previewUrl?: string;
  error?: string;
};

const PET_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp';
const MAX_CREATOR_PHOTOS = 8;

function nextId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function revokeBlobUrl(url: string | null | undefined) {
  if (url?.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

function stepIndex(step: WizardStep): number {
  return WIZARD_STEPS.indexOf(step);
}

function defaultBreedForSpecies(species: PetSpeciesId): PetBreedId {
  return listPetBreedsForSpecies(species)[0] ?? PetBreed.Any;
}

function patchPhoto(
  photos: WizardPhoto[],
  id: string,
  patch: Partial<WizardPhoto>
): WizardPhoto[] {
  return photos.map((photo) =>
    photo.id === id ? { ...photo, ...patch } : photo
  );
}

function wizardPhotosFromLocalDraft(): WizardPhoto[] {
  const draft = readDraft();
  if (!draft) return [];
  // After refresh there is no blob; fall back to stored server preview URLs.
  return draft.photos.map((photo) => ({
    id: photo.localId,
    name: photo.name,
    displayUrl: photo.previewUrl,
    previewUrl: photo.previewUrl,
    file: null,
    status: 'ready' as const,
    progress: 100,
    r2Key: photo.r2Key,
  }));
}

export function CreatePetWizard() {
  const t = useTranslations('CreatePetWizard');
  const locale = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const photoPickerButtonRef = useRef<HTMLButtonElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = authClient.useSession();

  const initialLocalDraft = readDraft() ?? createEmptyDraft();
  const [draftId] = useState(
    () => ensureDraftId(initialLocalDraft).draftId
  );
  const [step, setStep] = useState<WizardStep>('photos');
  const [photos, setPhotos] = useState<WizardPhoto[]>(() =>
    wizardPhotosFromLocalDraft()
  );
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [croppingAvatar, setCroppingAvatar] = useState(false);
  const [petName, setPetName] = useState(() => initialLocalDraft.petName);
  const [species, setSpecies] = useState<PetSpeciesId | ''>(
    () => initialLocalDraft.species
  );
  const [breed, setBreed] = useState<PetBreedId | ''>(
    () => initialLocalDraft.breed
  );
  const [sex, setSex] = useState<PetSex | ''>(() => initialLocalDraft.sex);
  const [creatingPet, setCreatingPet] = useState(false);
  const [recognitionStatus, setRecognitionStatus] =
    useState<RecognitionStatus>('idle');
  const [recognitionData, setRecognitionData] =
    useState<CreatorPetRecognitionData | null>(null);
  const [waitingForRecognition, setWaitingForRecognition] = useState(false);
  const [unsupportedRecognitionOpen, setUnsupportedRecognitionOpen] =
    useState(false);
  const recognitionGenerationRef = useRef(0);
  const lastRecognizedMediaFingerprintRef = useRef<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const photosRef = useRef(photos);
  photosRef.current = photos;
  const avatarUrlRef = useRef(avatarUrl);
  avatarUrlRef.current = avatarUrl;
  const isMountedRef = useRef(true);

  // Only revoke blob URLs on unmount. Revoking on every `photos` update
  // breaks Basics avatar previews that still reference the same blob URL.
  // Also mark the wizard unmounted so late upload/recognition cannot toast
  // or setState after the user navigates away.
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      for (const photo of photosRef.current) revokeBlobUrl(photo.displayUrl);
      revokeBlobUrl(avatarUrlRef.current);
    };
  }, []);

  useEffect(() => {
    writeDraft(
      ensureDraftId({
        draftId,
        petName,
        species,
        breed,
        sex,
        avatarKey: null,
        photos: photos
          .filter((photo) => photo.status === 'ready' && photo.r2Key)
          .map((photo) => ({
            localId: photo.id,
            name: photo.name,
            r2Key: photo.r2Key!,
            previewUrl:
              photo.previewUrl ??
              `${window.location.origin}/api/storage/file?key=${encodeURIComponent(photo.r2Key!)}`,
          })),
      })
    );
  }, [breed, draftId, petName, photos, sex, species]);

  const currentIndex = stepIndex(step);
  const readyPhotos = photos.filter((photo) => photo.status === 'ready');
  const uploadingPhotos = photos.some(
    (photo) => photo.status === 'pending' || photo.status === 'uploading'
  );
  const firstPhoto = readyPhotos[0] ?? photos[0] ?? null;
  const hasReferenceSources = readyPhotos.length > 0;
  const displayAvatarUrl = avatarUrl ?? firstPhoto?.displayUrl ?? null;

  const isBasicsComplete =
    petName.trim().length > 0 && (sex === PetSex.Male || sex === PetSex.Female);

  const isDetailsComplete =
    !!species && (!speciesUsesBreeds(species) || !!breed);

  const isStepUnlocked = (target: WizardStep): boolean => {
    switch (target) {
      case 'photos':
        return true;
      case 'basics':
        return hasReferenceSources;
      case 'details':
        return hasReferenceSources && isBasicsComplete;
      default:
        return false;
    }
  };

  const applyRecognitionPrefill = useCallback(
    (data: CreatorPetRecognitionData | null) => {
      if (!data) return;
      const prefill = mapPetRecognitionToPrefill(data);
      if (!prefill.species) return;
      setSpecies(prefill.species);
      setBreed(prefill.breed);
    },
    []
  );

  const continueToDetails = useCallback(
    (data: CreatorPetRecognitionData | null, status: RecognitionStatus) => {
      setWaitingForRecognition(false);

      if (status === 'success') {
        if (isUnsupportedCreatorRecognitionSpecies(data?.species)) {
          setSpecies('');
          setBreed('');
          setUnsupportedRecognitionOpen(true);
          return;
        }

        applyRecognitionPrefill(data);
        setStep('details');
        return;
      }

      // Recognition infrastructure failures are non-blocking. Let the user
      // choose species and breed manually instead of surfacing an error.
      setSpecies('');
      setBreed('');
      setStep('details');
    },
    [applyRecognitionPrefill]
  );

  useEffect(() => {
    if (!waitingForRecognition) return;
    if (recognitionStatus === 'loading') return;
    continueToDetails(recognitionData, recognitionStatus);
  }, [
    continueToDetails,
    recognitionData,
    recognitionStatus,
    waitingForRecognition,
  ]);

  // Surface unsupported detections as soon as recognition finishes, even if the
  // user has not clicked Continue yet (e.g. still filling name/sex on Basics).
  useEffect(() => {
    if (recognitionStatus !== 'success') return;
    if (!isUnsupportedCreatorRecognitionSpecies(recognitionData?.species)) {
      return;
    }
    setSpecies('');
    setBreed('');
    setUnsupportedRecognitionOpen(true);
  }, [recognitionData, recognitionStatus]);

  const resetRecognition = useCallback(() => {
    recognitionGenerationRef.current += 1;
    lastRecognizedMediaFingerprintRef.current = null;
    setRecognitionStatus('idle');
    setRecognitionData(null);
    setWaitingForRecognition(false);
  }, []);

  const clearAvatar = () => {
    setPendingAvatarFile(null);
    setAvatarUrl((prev) => {
      revokeBlobUrl(prev);
      return null;
    });
  };

  const resetDownstreamFromPhotos = () => {
    resetRecognition();

    if (step === 'basics' || step === 'details') {
      setStep('basics');
    }
  };

  const uploadWizardPhoto = useCallback(
    async (localId: string, file: File) => {
      if (!isMountedRef.current) return;
      setPhotos((current) =>
        patchPhoto(current, localId, {
          status: 'uploading',
          progress: 0,
          error: undefined,
        })
      );

      try {
        const reference = await preparePetActionReferenceImage(file);
        if (!isMountedRef.current) return;
        if (reference.byteSize > PET_MEDIA_MAX_FILE_SIZE) {
          throw new Error(t('photos.fileTooLarge'));
        }

        const uploadFile = new File([reference.file], file.name, {
          type: ACTION_POSE_REFERENCE_MIME_TYPE,
          lastModified: file.lastModified,
        });

        const presignResult = await wrapNestedServerFn(() =>
          getPetMakerStagingUploadUrlFn({
            data: {
              draftId,
              fileId: localId,
              contentType: ACTION_POSE_REFERENCE_MIME_TYPE,
              byteSize: reference.byteSize,
            },
          })
        );
        if (!isMountedRef.current) return;
        assertActionSuccess(presignResult, t('photos.uploadError'));
        const slot = presignResult.data.data;

        await uploadFileWithPresignedUrl(
          uploadFile,
          {
            uploadUrl: slot.uploadUrl,
            contentType: slot.contentType,
          },
          (percent) => {
            if (!isMountedRef.current) return;
            setPhotos((current) =>
              patchPhoto(current, localId, { progress: percent })
            );
          }
        );
        if (!isMountedRef.current) return;

        setPhotos((current) =>
          patchPhoto(current, localId, {
            status: 'ready',
            progress: 100,
            r2Key: slot.r2Key,
            previewUrl: slot.previewUrl,
            error: undefined,
          })
        );
      } catch (error) {
        console.error('wizard photo upload error:', error);
        if (!isMountedRef.current) return;
        const message = userFacingClientErrorMessage(
          error,
          t('photos.uploadError')
        );
        setPhotos((current) =>
          patchPhoto(current, localId, {
            status: 'error',
            progress: 0,
            error: message,
          })
        );
        toast.error(message);
      }
    },
    [draftId, t]
  );

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const next: WizardPhoto[] = [];
    for (const file of Array.from(files)) {
      if (!PET_IMAGE_ACCEPT.split(',').includes(file.type)) {
        toast.error(t('photos.invalidType'));
        continue;
      }
      if (file.size > PET_MEDIA_MAX_FILE_SIZE) {
        toast.error(t('photos.fileTooLarge'));
        continue;
      }
      next.push({
        id: nextId(),
        name: file.name,
        displayUrl: URL.createObjectURL(file),
        file,
        status: 'pending',
        progress: 0,
      });
    }
    if (next.length === 0) return;

    const room = Math.max(0, MAX_CREATOR_PHOTOS - photos.length);
    const accepted = next.slice(0, room);
    const unused = next.slice(room);
    for (const photo of unused) revokeBlobUrl(photo.displayUrl);
    if (accepted.length === 0) {
      toast.error(t('photos.maxReached', { count: MAX_CREATOR_PHOTOS }));
      return;
    }

    setPhotos((current) => {
      const remaining = Math.max(0, MAX_CREATOR_PHOTOS - current.length);
      return [...current, ...accepted.slice(0, remaining)];
    });

    resetDownstreamFromPhotos();

    for (const photo of accepted) {
      if (!photo.file) continue;
      void uploadWizardPhoto(photo.id, photo.file);
    }
  };

  const removePhoto = (id: string) => {
    const target = photos.find((photo) => photo.id === id);
    if (!target) return;

    void (async () => {
      try {
        if (target.r2Key) {
          const result = await wrapNestedServerFn(() =>
            deletePetMakerStagingObjectFn({
              data: { draftId, r2Key: target.r2Key! },
            })
          );
          if (!isMountedRef.current) return;
          assertActionSuccess(result, t('photos.removeError'));
        }
        if (!isMountedRef.current) return;
        setPhotos((current) => {
          const removed = current.find((photo) => photo.id === id);
          if (removed) revokeBlobUrl(removed.displayUrl);
          const next = current.filter((photo) => photo.id !== id);
          if (next.filter((photo) => photo.status === 'ready').length === 0) {
            clearAvatar();
            setStep('photos');
          }
          return next;
        });
        resetDownstreamFromPhotos();
      } catch (error) {
        console.error('wizard remove photo error:', error);
        if (!isMountedRef.current) return;
        toast.error(
          userFacingClientErrorMessage(error, t('photos.removeError'))
        );
      }
    })();
  };

  const retryPhotoUpload = (id: string) => {
    const target = photos.find((photo) => photo.id === id);
    if (!target?.file) return;
    void uploadWizardPhoto(id, target.file);
  };

  const clearCropImage = () => {
    setCropImageSrc((prev) => {
      if (prev?.startsWith('blob:')) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
    setCropOpen(false);
  };

  const openAvatarUpdate = () => {
    if (!ENABLE_PET_MAKER_AVATAR || croppingAvatar) return;
    avatarInputRef.current?.click();
  };

  const handleAvatarFile = (file: File | undefined) => {
    if (!ENABLE_PET_MAKER_AVATAR || !file || croppingAvatar) return;
    if (!isSupportedAvatarImageType(file.type)) {
      toast.error(t('photos.invalidType'));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(t('profile.avatarUploadFailed'));
      return;
    }
    const src = URL.createObjectURL(file);
    setCropImageSrc((prev) => {
      if (prev?.startsWith('blob:')) {
        URL.revokeObjectURL(prev);
      }
      return src;
    });
    setCropOpen(true);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
  };

  const handleCropCancel = () => {
    if (croppingAvatar) return;
    clearCropImage();
  };

  const handleCropConfirm = async (crop: SquareCropPixels) => {
    if (!cropImageSrc || croppingAvatar) return;
    setCroppingAvatar(true);
    try {
      const compressed = await compressSquareAvatarFromCrop(cropImageSrc, crop);
      if (compressed.byteSize > MAX_FILE_SIZE) {
        throw new Error(t('profile.avatarUploadFailed'));
      }

      const previewUrl = URL.createObjectURL(compressed.file);
      setPendingAvatarFile(compressed.file);
      setAvatarUrl((prev) => {
        revokeBlobUrl(prev);
        return previewUrl;
      });
      clearCropImage();
    } catch (error) {
      console.error('wizard avatar crop error:', error);
      toast.error(
        userFacingClientErrorMessage(error, t('profile.avatarCropFailed'))
      );
    } finally {
      setCroppingAvatar(false);
    }
  };

  const handleSpeciesChange = (value: string) => {
    if (!isPetSpecies(value)) return;
    setSpecies(value);
    if (speciesUsesBreeds(value)) {
      setBreed(defaultBreedForSpecies(value));
    } else {
      setBreed(PetBreed.Any);
    }
  };

  const pricingHref =
    locale === DEFAULT_LOCALE ? PRICING_URL : `/${locale}${PRICING_URL}`;

  const navigateToPricing = useCallback(() => {
    window.location.assign(pricingHref);
  }, [pricingHref]);

  const validateCreateReadiness = useCallback((): boolean => {
    if (uploadingPhotos) {
      toast.error(t('photos.waitForUpload'));
      return false;
    }
    if (!petName.trim()) {
      toast.error(t('profile.nameRequired'));
      return false;
    }
    if (!species) {
      toast.error(t('profile.speciesRequired'));
      return false;
    }
    if (speciesUsesBreeds(species) && !breed) {
      toast.error(t('profile.breedRequired'));
      return false;
    }
    if (sex !== PetSex.Male && sex !== PetSex.Female) {
      toast.error(t('profile.sexRequired'));
      return false;
    }
    if (readyPhotos.length === 0) {
      toast.error(t('photos.required'));
      setStep('photos');
      return false;
    }
    if (readyPhotos.some((photo) => !photo.r2Key)) {
      toast.error(t('photos.waitForUpload'));
      return false;
    }
    return true;
  }, [
    breed,
    petName,
    readyPhotos,
    sex,
    species,
    t,
    uploadingPhotos,
  ]);

  /** After pet draft is ready: real users go to pricing; guests open auth first. */
  const continueAfterPetReady = useCallback(async () => {
    const { data: freshSession } = await authClient.getSession({
      query: { disableCookieCache: true },
    });
    if (!isRealSignedInUser(freshSession?.user)) {
      setAuthOpen(true);
      setCreatingPet(false);
      return;
    }
    navigateToPricing();
  }, [navigateToPricing]);

  const goToStep = (target: WizardStep) => {
    if (!isStepUnlocked(target)) return;
    if (target === step) return;
    setStep(target);
  };

  const executeCreatePetAndContinue = useCallback(async () => {
    if (!validateCreateReadiness()) return;

    setCreatingPet(true);
    try {
      if (ENABLE_PET_MAKER_AVATAR) {
        let avatarFile = pendingAvatarFile;
        if (!avatarFile && !avatarUrl) {
          const localReady = photos.find(
            (photo) => photo.status === 'ready' && photo.file
          );
          if (localReady?.file) {
            const compressed = await compressSquareAvatar(localReady.file);
            avatarFile = compressed.file;
          } else if (readyPhotos[0]?.displayUrl) {
            const response = await fetch(readyPhotos[0].displayUrl);
            if (!response.ok) {
              throw new Error('Failed to download photo for avatar.');
            }
            const blob = await response.blob();
            const sourceFile = new File(
              [blob],
              readyPhotos[0].name || 'avatar.jpg',
              {
                type: blob.type || 'image/jpeg',
                lastModified: Date.now(),
              }
            );
            const compressed = await compressSquareAvatar(sourceFile);
            avatarFile = compressed.file;
          }
        }

        if (avatarFile) {
          const uploaded = await uploadPetAvatar({
            file: avatarFile,
            byteSize: avatarFile.size,
            previousImageUrl: avatarUrl,
            errorMessage: t('profile.avatarUploadFailed'),
          });
          setPendingAvatarFile(null);
          setAvatarUrl((prev) => {
            revokeBlobUrl(prev);
            return uploaded;
          });
        }
      }

      await continueAfterPetReady();
    } catch (error) {
      console.error('wizard create pet error:', error);
      toast.error(
        userFacingClientErrorMessage(error, t('profile.createError'))
      );
      setCreatingPet(false);
    }
  }, [
    avatarUrl,
    continueAfterPetReady,
    pendingAvatarFile,
    photos,
    readyPhotos,
    t,
    validateCreateReadiness,
  ]);

  const handleAuthAuthenticated = useCallback(() => {
    setAuthOpen(false);
    if (!validateCreateReadiness()) {
      setCreatingPet(false);
      return;
    }
    setCreatingPet(true);
    navigateToPricing();
  }, [navigateToPricing, validateCreateReadiness]);

  const canContinue =
    step === 'photos'
      ? hasReferenceSources && !uploadingPhotos
      : step === 'basics'
        ? isBasicsComplete
        : isDetailsComplete;

  const startBackgroundRecognition = (_photoList: WizardPhoto[]) => {
    setRecognitionStatus('skipped');
    setRecognitionData(null);
  };

  const handleContinue = () => {
    if (waitingForRecognition) return;
    if (uploadingPhotos) {
      toast.error(t('photos.waitForUpload'));
      return;
    }

    if (step === 'photos') {
      if (!hasReferenceSources) {
        toast.error(t('photos.required'));
        return;
      }
      startBackgroundRecognition(photos);
      setStep('basics');
      return;
    }

    if (step === 'basics') {
      if (!petName.trim()) {
        toast.error(t('profile.nameRequired'));
        return;
      }
      if (sex !== PetSex.Male && sex !== PetSex.Female) {
        toast.error(t('profile.sexRequired'));
        return;
      }

      if (recognitionStatus === 'loading') {
        setWaitingForRecognition(true);
        return;
      }

      continueToDetails(recognitionData, recognitionStatus);
      return;
    }

    if (step === 'details') {
      if (creatingPet) return;
      if (!species) {
        toast.error(t('profile.speciesRequired'));
        return;
      }
      if (speciesUsesBreeds(species) && !breed) {
        toast.error(t('profile.breedRequired'));
        return;
      }

      void executeCreatePetAndContinue();
    }
  };

  const handleBack = () => {
    if (waitingForRecognition) return;
    const previous = WIZARD_STEPS[currentIndex - 1];
    if (previous) goToStep(previous);
  };

  const handleChooseDifferentPhotos = () => {
    setUnsupportedRecognitionOpen(false);
    setStep('photos');
    requestAnimationFrame(() => {
      photoPickerButtonRef.current?.focus();
      inputRef.current?.click();
    });
  };

  return (
    // Google Translate rewrites text nodes and can cause React removeChild /
    // insertBefore exceptions while this conditional wizard updates.
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

      <ol className="grid select-none gap-2 rounded-[22px] border-2 border-deskpet-ink/12 bg-white p-2 sm:grid-cols-3">
        {WIZARD_STEPS.map((item, index) => {
          const active = item === step;
          const unlocked = isStepUnlocked(item);
          const complete = unlocked && index < currentIndex;
          return (
            <li key={item} className="min-w-0">
              <button
                type="button"
                disabled={!unlocked}
                aria-current={active ? 'step' : undefined}
                onClick={() => goToStep(item)}
                className={cn(
                  'flex min-h-11 w-full items-center gap-2 rounded-2xl px-3 text-left text-sm font-bold transition-colors',
                  active
                    ? 'bg-deskpet-mint text-deskpet-ink'
                    : !unlocked
                      ? 'cursor-not-allowed text-deskpet-muted opacity-60'
                      : complete
                        ? 'cursor-pointer bg-deskpet-mint-soft text-deskpet-ink hover:bg-deskpet-mint/70'
                        : 'cursor-pointer text-deskpet-ink hover:bg-deskpet-mint-soft'
                )}
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white text-xs text-deskpet-ink">
                  {complete ? <CheckIcon className="size-3.5" /> : index + 1}
                </span>
                {t(`steps.${item}`)}
              </button>
            </li>
          );
        })}
      </ol>

      {step === 'photos' ? (
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
            accept={PET_IMAGE_ACCEPT}
            multiple
            className="hidden"
            onChange={(event) => {
              handleFiles(event.target.files);
              event.target.value = '';
            }}
          />
          <ul className="mt-4 m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo) => (
              <li key={photo.id} className="min-w-0">
                <div className="relative aspect-square overflow-hidden rounded-2xl border-2 border-deskpet-ink/12 bg-deskpet-paper">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local or signed preview */}
                  <img
                    src={photo.displayUrl}
                    alt={photo.name}
                    className="size-full object-contain"
                  />
                  {photo.status === 'uploading' ||
                  photo.status === 'pending' ? (
                    <div className="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-2 text-center text-xs font-bold text-white">
                      {t('photos.uploading', {
                        progress: photo.progress,
                      })}
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
                          onClick={() => retryPhotoUpload(photo.id)}
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
                    onClick={() => removePhoto(photo.id)}
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
                disabled={photos.length >= MAX_CREATOR_PHOTOS}
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
      ) : null}

      {step === 'basics' ? (
        <section className={cn(dashboardCardClass, 'p-5 sm:p-6')}>
          <DashboardCardHeader
            icon={<PawPrintIcon className="size-[18px]" />}
            accent="bg-[#fff2c8]"
            title={t('basics.title')}
            description={t('basics.description')}
          />
          <div className="grid gap-6">
            <BasicsFields
              idPrefix="basics"
              displayAvatarUrl={displayAvatarUrl}
              petName={petName}
              sex={sex}
              croppingAvatar={croppingAvatar}
              onUpdateAvatar={openAvatarUpdate}
              onPetNameChange={setPetName}
              onSexChange={setSex}
            />
            {ENABLE_PET_MAKER_AVATAR ? (
              <input
                ref={avatarInputRef}
                type="file"
                accept={PET_IMAGE_ACCEPT}
                className="hidden"
                onChange={(event) => {
                  handleAvatarFile(event.target.files?.[0]);
                }}
              />
            ) : null}
          </div>
        </section>
      ) : null}

      {step === 'details' ? (
        <section className={cn(dashboardCardClass, 'p-5 sm:p-6')}>
          <DashboardCardHeader
            icon={<PawPrintIcon className="size-[18px]" />}
            accent="bg-[#fff2c8]"
            title={t('details.title')}
            description={t('details.description')}
          />
          <div className="grid gap-6">
            <DetailsBasicsSummary
              displayAvatarUrl={displayAvatarUrl}
              petName={petName.trim() || t('profile.unnamedPet')}
              sex={sex}
            />
            <PetInfoFields
              species={species}
              breed={breed}
              onSpeciesChange={handleSpeciesChange}
              onBreedChange={(value) => setBreed(value as PetBreedId)}
            />
          </div>
        </section>
      ) : null}

      <footer className="flex flex-wrap justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={currentIndex === 0}
            onClick={handleBack}
          >
            <ArrowLeftIcon className="size-4" />
            {t('nav.back')}
          </Button>
        </div>
        <CtaButton
          type="button"
          disabled={
            !canContinue ||
            creatingPet ||
            waitingForRecognition ||
            uploadingPhotos
          }
          onClick={handleContinue}
        >
          {creatingPet || waitingForRecognition ? (
            <LoaderIcon className="size-4 animate-spin" />
          ) : null}
          {creatingPet
            ? t('profile.creating')
            : waitingForRecognition
              ? t('basics.waitingForRecognition')
              : step === 'details'
                ? t('nav.createPet')
                : t('nav.continue')}
          {creatingPet || waitingForRecognition ? null : (
            <ArrowRightIcon className="size-4" />
          )}
        </CtaButton>
      </footer>

      <AlertDialog
        open={unsupportedRecognitionOpen}
        onOpenChange={setUnsupportedRecognitionOpen}
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
              onClick={() => setUnsupportedRecognitionOpen(false)}
            >
              {t('recognition.close')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleChooseDifferentPhotos}>
              {t('recognition.chooseDifferentPhotos')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {ENABLE_PET_MAKER_AVATAR && cropImageSrc ? (
        <PetAvatarCropDialog
          open={cropOpen}
          imageSrc={cropImageSrc}
          busy={croppingAvatar}
          preventTranslation
          onCancel={handleCropCancel}
          onConfirm={(crop) => {
            void handleCropConfirm(crop);
          }}
        />
      ) : null}

      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        callbackUrl={pricingHref}
        onAuthenticated={handleAuthAuthenticated}
        preventTranslation
      />
    </div>
  );
}

function DetailsBasicsSummary({
  displayAvatarUrl,
  petName,
  sex,
}: {
  displayAvatarUrl: string | null;
  petName: string;
  sex: PetSex | '';
}) {
  const t = useTranslations('CreatePetWizard');
  const sexLabel =
    sex === PetSex.Male
      ? t('sex.male')
      : sex === PetSex.Female
        ? t('sex.female')
        : null;

  return (
    <div className="flex w-full max-w-sm items-center gap-3 rounded-2xl border-2 border-deskpet-ink/10 bg-deskpet-paper/60 p-3 pr-5">
      <PetAvatar src={displayAvatarUrl} size="sm" />
      <div className="min-w-0">
        <p className="m-0 truncate font-sans text-lg font-black tracking-tight text-deskpet-ink">
          {petName}
        </p>
        {sexLabel ? (
          <p className="mt-0.5 m-0 text-sm font-bold text-deskpet-muted">
            {t('profile.sexLabel')}: {sexLabel}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function BasicsFields({
  idPrefix,
  displayAvatarUrl,
  petName,
  sex,
  croppingAvatar,
  onUpdateAvatar,
  onPetNameChange,
  onSexChange,
}: {
  idPrefix: string;
  displayAvatarUrl: string | null;
  petName: string;
  sex: PetSex | '';
  croppingAvatar: boolean;
  onUpdateAvatar: () => void;
  onPetNameChange: (value: string) => void;
  onSexChange: (value: PetSex) => void;
}) {
  const t = useTranslations('CreatePetWizard');
  const nameId = `${idPrefix}-pet-name`;
  const sexId = `${idPrefix}-sex`;

  return (
    <div className="grid gap-5">
      <div className="flex max-w-sm items-center gap-3">
        <PetAvatar src={displayAvatarUrl} size="lg" />
        {ENABLE_PET_MAKER_AVATAR ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={croppingAvatar}
            onClick={onUpdateAvatar}
          >
            <PencilIcon className="size-3.5" />
            {t('profile.updateAvatar')}
          </Button>
        ) : null}
      </div>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="grid w-full max-w-sm gap-2">
          <Label htmlFor={nameId}>{t('profile.nameLabel')}</Label>
          <Input
            id={nameId}
            value={petName}
            onChange={(event) => onPetNameChange(event.target.value)}
            placeholder={t('profile.namePlaceholder')}
            className="!h-11 w-full"
          />
        </div>

        <div className="grid w-full max-w-sm gap-2">
          <Label htmlFor={sexId}>{t('profile.sexLabel')}</Label>
          <Select
            value={sex}
            onValueChange={(value) => onSexChange(value as PetSex)}
          >
            <SelectTrigger id={sexId} className="!h-11 w-full">
              <SelectValue placeholder={t('profile.sexPlaceholder')} />
            </SelectTrigger>
            <SelectContent
              translate="no"
              data-google-translate="no"
              className="notranslate"
            >
              <SelectItem value={PetSex.Male}>{t('sex.male')}</SelectItem>
              <SelectItem value={PetSex.Female}>{t('sex.female')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function PetInfoFields({
  species,
  breed,
  onSpeciesChange,
  onBreedChange,
}: {
  species: PetSpeciesId | '';
  breed: PetBreedId | '';
  onSpeciesChange: (value: string) => void;
  onBreedChange: (value: string) => void;
}) {
  const t = useTranslations('CreatePetWizard');
  const breedOptions = species ? listPetBreedsForSpecies(species) : [];
  const showBreed = species ? speciesUsesBreeds(species) : false;

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
      <div className="grid w-full max-w-sm gap-2">
        <Label htmlFor="wizard-species">{t('profile.species')}</Label>
        <Select value={species} onValueChange={onSpeciesChange}>
          <SelectTrigger id="wizard-species" className="!h-11 w-full">
            <SelectValue placeholder={t('profile.speciesPlaceholder')} />
          </SelectTrigger>
          <SelectContent
            translate="no"
            data-google-translate="no"
            className="notranslate"
          >
            {PET_SPECIES_VALUES.map((item) => (
              <SelectItem key={item} value={item}>
                {getPetSpeciesLabel(item)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {showBreed ? (
        <div className="grid w-full max-w-sm gap-2">
          <Label htmlFor="wizard-breed">{t('profile.breed')}</Label>
          <Select value={breed} onValueChange={onBreedChange}>
            <SelectTrigger id="wizard-breed" className="!h-11 w-full">
              <SelectValue placeholder={t('profile.breedPlaceholder')} />
            </SelectTrigger>
            <SelectContent
              translate="no"
              data-google-translate="no"
              className="notranslate"
            >
              {breedOptions.map((item) => (
                <SelectItem key={item} value={item}>
                  {getPetBreedLabel(item)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
    </div>
  );
}
