'use client';

import {
  createPetFn,
  deletePetMakerStagingObjectFn,
  getPetMakerStagingUploadUrlFn,
} from '@/api/marketing-pet-maker';
import { authClient } from '@/lib/auth/auth-client';
import { userFacingClientErrorMessage } from '@/lib/analytics/user-facing-client-error-message';
import { isVerifiedSignedInUser } from '@/lib/auth/session-identity';
import { useLocale, useTranslations } from '@/lib/deskpet-i18n';
import { Routes } from '@/lib/routes';
import { uploadFileWithPresignedUrl } from '@/lib/storage/presigned-upload';
import { getPathWithLocale } from '@/lib/urls';
import type { CreatorPetRecognitionData } from '@/types/creator-recognition';
import { assertActionSuccess } from '@/utils/assert-action-success';
import {
  compressSquareAvatar,
  compressSquareAvatarFromCrop,
  isSupportedAvatarImageType,
  type SquareCropPixels,
} from '@/utils/compress-square-avatar';
import { MAX_FILE_SIZE, PET_MEDIA_MAX_FILE_SIZE } from '@/utils/constants';
import {
  isPetSpecies,
  listPetBreedsForSpecies,
  PetBreed,
  PetSex,
  type PetBreed as PetBreedId,
  type PetSpecies as PetSpeciesId,
  speciesUsesBreeds,
} from '@/utils/pet-catalog';
import {
  clearDraft,
  clearPendingPetMakerCreateAfterAuth,
  createEmptyDraft,
  ensureDraftId,
  readDraft,
  readPendingPetMakerCreateAfterAuth,
  withPetMakerResumeCreateParam,
  writeDraft,
  writePendingPetMakerCreateAfterAuth,
  type PetMakerLocalDraft,
} from '@/utils/pets/marketing-pet-maker-draft';
import {
  clampMarketingPetMakerStepToUnlocked,
  isMarketingPetMakerStepUnlocked,
  MARKETING_PET_MAKER_STEPS,
  marketingPetMakerStepIndex,
  type MarketingPetMakerStep,
} from '@/utils/pets/marketing-pet-maker-steps';
import { ACTION_POSE_REFERENCE_MIME_TYPE } from '@/utils/pets/action-pose';
import {
  isUnsupportedCreatorRecognitionSpecies,
  mapPetRecognitionToPrefill,
} from '@/utils/pets/map-pet-recognition-to-prefill';
import { preparePetActionReferenceImage } from '@/utils/pets/prepare-pet-action-reference-image';
import { uploadPetAvatar } from '@/utils/pets/upload-pet-avatar';
import { wrapNestedServerFn } from '@/utils/wrap-server-fn';
import { useNavigate } from '@tanstack/react-router';
import { usePostHog } from 'posthog-js/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

/** Flip to `true` to re-enable avatar crop/upload in the pet maker. */
const ENABLE_PET_MAKER_AVATAR = false;

type RecognitionStatus = 'idle' | 'loading' | 'success' | 'skipped';

export type MarketingPetMakerPhoto = {
  id: string;
  name: string;
  displayUrl: string;
  file: File | null;
  status: 'pending' | 'uploading' | 'ready' | 'error';
  progress: number;
  r2Key?: string;
  previewUrl?: string;
  error?: string;
};

type WizardPhoto = MarketingPetMakerPhoto;

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

function isBasicsCompleteFromDraft(draft: {
  petName: string;
  sex: PetSex | '';
}): boolean {
  return (
    draft.petName.trim().length > 0 &&
    (draft.sex === PetSex.Male || draft.sex === PetSex.Female)
  );
}

function isDetailsCompleteFromDraft(draft: PetMakerLocalDraft): boolean {
  return (
    !!draft.species && (!speciesUsesBreeds(draft.species) || !!draft.breed)
  );
}

function stepUnlockFromDraft(draft: PetMakerLocalDraft) {
  return {
    hasReferenceSources: draft.photos.length > 0,
    isBasicsComplete: isBasicsCompleteFromDraft(draft),
    isDetailsComplete: isDetailsCompleteFromDraft(draft),
  };
}

function initialStepFromDraft(
  draft: PetMakerLocalDraft
): MarketingPetMakerStep {
  return clampMarketingPetMakerStepToUnlocked(
    draft.step,
    stepUnlockFromDraft(draft)
  );
}

export function useMarketingPetMaker(options?: {
  /** OAuth callback `?resumeCreate=1` — show Creating on first paint. */
  initialResumeCreate?: boolean;
}) {
  const t = useTranslations('MarketingPetMaker');
  const locale = useLocale();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const photoPickerButtonRef = useRef<HTMLButtonElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const posthog = usePostHog();
  const resumeCreateStartedRef = useRef(false);

  const initialLocalDraft = readDraft() ?? createEmptyDraft();
  const shouldResumeCreateOnMount =
    options?.initialResumeCreate === true ||
    readPendingPetMakerCreateAfterAuth();
  const [draftId] = useState(() => ensureDraftId(initialLocalDraft).draftId);
  const [step, setStep] = useState<MarketingPetMakerStep>(() =>
    shouldResumeCreateOnMount
      ? 'details'
      : initialStepFromDraft(initialLocalDraft)
  );
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
  // URL flag (SSR) or sessionStorage pending — same Creating button as logged-in create.
  const [creatingPet, setCreatingPet] = useState(shouldResumeCreateOnMount);
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
        step,
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
  }, [breed, draftId, petName, photos, sex, species, step]);

  const currentIndex = marketingPetMakerStepIndex(step);
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

  const isStepUnlocked = (target: MarketingPetMakerStep): boolean =>
    isMarketingPetMakerStepUnlocked(target, {
      hasReferenceSources,
      isBasicsComplete,
      isDetailsComplete,
    });

  const goToStep = useCallback(
    (target: MarketingPetMakerStep) => {
      if (
        !isMarketingPetMakerStepUnlocked(target, {
          hasReferenceSources,
          isBasicsComplete,
          isDetailsComplete,
        })
      ) {
        return;
      }
      if (target === step) return;
      setStep(target);
    },
    [hasReferenceSources, isBasicsComplete, isDetailsComplete, step]
  );

  useEffect(() => {
    const clamped = clampMarketingPetMakerStepToUnlocked(step, {
      hasReferenceSources,
      isBasicsComplete,
      isDetailsComplete,
    });
    if (clamped !== step) {
      setStep(clamped);
    }
  }, [hasReferenceSources, isBasicsComplete, isDetailsComplete, step]);

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
        goToStep('details');
        return;
      }

      // Recognition infrastructure failures are non-blocking. Let the user
      // choose species and breed manually instead of surfacing an error.
      setSpecies('');
      setBreed('');
      goToStep('details');
    },
    [applyRecognitionPrefill, goToStep]
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

  const resetDownstreamFromPhotos = useCallback(() => {
    resetRecognition();

    if (step === 'basics' || step === 'details') {
      goToStep('basics');
    }
  }, [goToStep, resetRecognition, step]);

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

  const makerCallbackHref = withPetMakerResumeCreateParam(
    getPathWithLocale(Routes.DesktopPetCreator, locale)
  );

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
      goToStep('photos');
      return false;
    }
    if (readyPhotos.some((photo) => !photo.r2Key)) {
      toast.error(t('photos.waitForUpload'));
      return false;
    }
    return true;
  }, [breed, goToStep, petName, readyPhotos, sex, species, t, uploadingPhotos]);

  const submitPetRecord = useCallback(async () => {
    if (!species) {
      throw new Error(t('profile.speciesRequired'));
    }

    const photoKeys = readyPhotos
      .map((photo) => photo.r2Key)
      .filter((key): key is string => !!key);

    const result = await wrapNestedServerFn(() =>
      createPetFn({
        data: {
          draftId,
          petName: petName.trim(),
          species,
          breed: speciesUsesBreeds(species) ? breed : PetBreed.Any,
          sex,
          avatarKey: null,
          photoKeys,
        },
      })
    );
    assertActionSuccess(result, t('profile.createError'));
    posthog?.capture('wizard_pet_created', {
      section: 'creator_wizard',
    });
    const petId = result.data.data.petId;
    clearDraft();
    await navigate({
      to: '/dashboard/pets/$petId',
      params: { petId },
      search: { step: 'final' },
    });
  }, [
    breed,
    draftId,
    navigate,
    petName,
    posthog,
    readyPhotos,
    sex,
    species,
    t,
  ]);

  /** Verified users create the pet; guests open auth and resume from saved draft. */
  const createPetAndOpenMyPets = useCallback(async () => {
    if (!isVerifiedSignedInUser(session?.user)) {
      const { data: freshSession } = await authClient.getSession({
        query: { disableCookieCache: true },
      });
      if (!isVerifiedSignedInUser(freshSession?.user)) {
        writePendingPetMakerCreateAfterAuth();
        setAuthOpen(true);
        setCreatingPet(false);
        return;
      }
    }
    await submitPetRecord();
  }, [session?.user, submitPetRecord]);

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

      await createPetAndOpenMyPets();
    } catch (error) {
      console.error('wizard create pet error:', error);
      toast.error(
        userFacingClientErrorMessage(error, t('profile.createError'))
      );
      setCreatingPet(false);
    }
  }, [
    avatarUrl,
    createPetAndOpenMyPets,
    pendingAvatarFile,
    photos,
    readyPhotos,
    t,
    validateCreateReadiness,
  ]);

  const handleAuthAuthenticated = useCallback(async () => {
    clearPendingPetMakerCreateAfterAuth();
    setAuthOpen(false);
    if (!validateCreateReadiness()) {
      setCreatingPet(false);
      return;
    }
    setCreatingPet(true);
    try {
      await submitPetRecord();
    } catch (error) {
      console.error('wizard create pet after auth error:', error);
      toast.error(
        userFacingClientErrorMessage(error, t('profile.createError'))
      );
      setCreatingPet(false);
    }
  }, [submitPetRecord, t, validateCreateReadiness]);

  useEffect(() => {
    const shouldResume =
      options?.initialResumeCreate === true ||
      readPendingPetMakerCreateAfterAuth();
    if (!shouldResume || authOpen || resumeCreateStartedRef.current) return;
    if (sessionPending) return;
    if (!isVerifiedSignedInUser(session?.user)) {
      clearPendingPetMakerCreateAfterAuth();
      setCreatingPet(false);
      return;
    }

    resumeCreateStartedRef.current = true;
    clearPendingPetMakerCreateAfterAuth();
    setStep('details');
    setCreatingPet(true);
    void (async () => {
      if (!validateCreateReadiness()) {
        setCreatingPet(false);
        return;
      }
      try {
        await submitPetRecord();
      } catch (error) {
        console.error('wizard create pet after oauth error:', error);
        toast.error(
          userFacingClientErrorMessage(error, t('profile.createError'))
        );
        setCreatingPet(false);
      }
    })();
  }, [
    authOpen,
    options?.initialResumeCreate,
    session?.user,
    sessionPending,
    submitPetRecord,
    t,
    validateCreateReadiness,
  ]);

  const canContinue =
    step === 'photos'
      ? hasReferenceSources && !uploadingPhotos
      : step === 'basics'
        ? isBasicsComplete
        : step === 'details'
          ? isDetailsComplete
          : false;

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
      goToStep('basics');
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
      if (!species) {
        toast.error(t('profile.speciesRequired'));
        return;
      }
      if (speciesUsesBreeds(species) && !breed) {
        toast.error(t('profile.breedRequired'));
        return;
      }

      if (creatingPet) return;
      void executeCreatePetAndContinue();
    }
  };

  const handleBack = () => {
    if (waitingForRecognition) return;
    const previous = MARKETING_PET_MAKER_STEPS[currentIndex - 1];
    if (previous) goToStep(previous);
  };

  const handleChooseDifferentPhotos = () => {
    setUnsupportedRecognitionOpen(false);
    goToStep('photos');
    requestAnimationFrame(() => {
      photoPickerButtonRef.current?.focus();
      inputRef.current?.click();
    });
  };

  return {
    step,
    currentIndex,
    isStepUnlocked,
    goToStep,
    photos,
    inputRef,
    photoPickerButtonRef,
    avatarInputRef,
    imageAccept: PET_IMAGE_ACCEPT,
    maxPhotos: MAX_CREATOR_PHOTOS,
    avatarEnabled: ENABLE_PET_MAKER_AVATAR,
    displayAvatarUrl,
    petName,
    setPetName,
    sex,
    setSex,
    species,
    breed,
    setBreed,
    croppingAvatar,
    handleFiles,
    removePhoto,
    retryPhotoUpload,
    openAvatarUpdate,
    handleAvatarFile,
    handleSpeciesChange,
    canContinue,
    creatingPet,
    waitingForRecognition,
    uploadingPhotos,
    handleContinue,
    handleBack,
    unsupportedRecognitionOpen,
    setUnsupportedRecognitionOpen,
    handleChooseDifferentPhotos,
    cropOpen,
    cropImageSrc,
    handleCropCancel,
    handleCropConfirm,
    authOpen,
    setAuthOpen,
    makerCallbackHref,
    handleAuthAuthenticated,
  };
}
