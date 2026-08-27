import {
  adoptPetAction,
  createPetAction,
  updatePetProfileAction,
} from '@/actions/pets';
import { PetAvatarCropDialog } from '@/components/pets/pet-avatar-crop-dialog';
import { PetAvatar } from '@/components/pets/pet-avatar';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCurrentUser } from '@/hooks/use-current-user';
import { authClient } from '@/lib/auth/auth-client';
import { ensureAnonymousSession } from '@/lib/auth/ensure-anonymous-session';
import { loginHrefWithCallback } from '@/lib/auth/login-href';
import { isRealSignedInUser } from '@/lib/auth/session-identity';
import { useLocaleRouter } from '@/lib/i18n/navigation';
import { DEFAULT_LOCALE } from '@/lib/i18n/routing';
import { Routes } from '@/lib/routes';
import { userFacingClientErrorMessage } from '@/lib/analytics/user-facing-client-error-message';
import { assertActionSuccess } from '@/utils/assert-action-success';
import { cn } from '@/lib/utils';
import {
  compressSquareAvatarFromCrop,
  isSupportedAvatarImageType,
  type SquareCropPixels,
} from '@/utils/compress-square-avatar';
import { MAX_FILE_SIZE } from '@/utils/constants';
import {
  getPetBreedLabel,
  getPetSpeciesLabel,
  listPetBreedsForSpecies,
  normalizePetBreedForSpecies,
  PET_SPECIES_VALUES,
  type PetBreed,
  PetSex,
  type PetSpecies,
  parsePetBreed,
  parsePetSpecies,
  speciesUsesBreeds,
} from '@/utils/pet-catalog';
import { uploadPetAvatar } from '@/utils/pets/upload-pet-avatar';
import {
  getPresetPet,
  listPresetPetBreedsForSpecies,
  listPresetPetSpecies,
} from '@/utils/preset-pets';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { useLocale, useTranslations } from '@/lib/deskpet-i18n';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';

export type PetProfileDefaults = {
  name: string;
  species?: PetSpecies | string;
  breed?: PetBreed | string;
  sex?: PetSex | string | null;
  avatar?: string | null;
};

type PetProfileDialogBaseProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaults: PetProfileDefaults;
};

type AdoptModeProps = PetProfileDialogBaseProps & {
  mode: 'adopt';
  presetKey: string;
};

type CreateModeProps = PetProfileDialogBaseProps & {
  mode: 'create';
  /** Require an uploaded avatar before allowing custom pet creation. */
  requireAvatar?: boolean;
  /** Called after a successful create (defaults to hard-reload Actions). */
  onSuccess?: () => void;
};

type EditModeProps = PetProfileDialogBaseProps & {
  mode: 'edit';
  petId: string;
  /** Called after a successful save (defaults to router.refresh). */
  onSuccess?: () => void;
};

export type PetProfileDialogProps =
  | AdoptModeProps
  | CreateModeProps
  | EditModeProps;

function revokeBlobUrl(url: string | null | undefined) {
  if (url?.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

/**
 * Shared pet profile modal for adopting, creating, or editing a pet.
 */
export function PetProfileDialog(props: PetProfileDialogProps) {
  const { open, onOpenChange, defaults, mode } = props;
  const t = useTranslations('PetsPage.profile');
  const router = useLocaleRouter();
  const locale = useLocale();
  const currentUser = useCurrentUser();
  const isAdmin = currentUser?.role === 'admin';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [name, setName] = useState(defaults.name);
  const [species, setSpecies] = useState<PetSpecies | ''>(() =>
    defaults.species ? parsePetSpecies(defaults.species) : ''
  );
  const [breed, setBreed] = useState<PetBreed | ''>(() => {
    return defaults.breed ? (parsePetBreed(defaults.breed) ?? '') : '';
  });
  const [sex, setSex] = useState<PetSex | ''>(() =>
    defaults.sex === PetSex.Male || defaults.sex === PetSex.Female
      ? defaults.sex
      : ''
  );
  const [avatarUrl, setAvatarUrl] = useState(defaults.avatar ?? '');
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [breedOpen, setBreedOpen] = useState(false);
  const [activePresetKey, setActivePresetKey] = useState(() =>
    mode === 'adopt' ? props.presetKey : ''
  );
  const [isPreset, setIsPreset] = useState(false);
  const avatarCustomizedRef = useRef(false);

  const speciesOptions = useMemo(
    () => (mode === 'adopt' ? listPresetPetSpecies() : PET_SPECIES_VALUES),
    [mode]
  );
  const breedOptions = useMemo(() => {
    if (!species) return [] as PetBreed[];
    if (mode === 'adopt') {
      return listPresetPetBreedsForSpecies(species);
    }
    return listPetBreedsForSpecies(species);
  }, [mode, species]);
  const showBreedField =
    mode === 'adopt'
      ? breedOptions.length > 0
      : species
        ? speciesUsesBreeds(species)
        : false;

  const selectedBreedLabel = breed ? getPetBreedLabel(breed) : null;

  const cropping = cropImageSrc != null;
  const profileOpen = open && !cropping;

  const clearCropImage = () => {
    setCropImageSrc((prev) => {
      revokeBlobUrl(prev);
      return null;
    });
  };

  /**
   * Real users go to the dashboard; anonymous guests must upgrade first.
   * Pet transfer on OTP/Google link attaches the guest pet afterward.
   */
  const navigateAfterPetEntry = async (input: {
    destination: string;
    successMessage: string;
  }) => {
    const session = await authClient.getSession();
    if (isRealSignedInUser(session.data?.user)) {
      toast.success(input.successMessage);
      // Hard reload so layout/sidebar active pet reloads from the server.
      const href =
        locale === DEFAULT_LOCALE
          ? input.destination
          : `/${locale}${input.destination}`;
      window.location.assign(href);
      return;
    }

    toast.success(t('accountRequiredAfterPet'));
    router.push(loginHrefWithCallback(input.destination));
  };

  useEffect(() => {
    if (!open) {
      clearCropImage();
      setPendingAvatarFile(null);
      avatarCustomizedRef.current = false;
      setAvatarUrl((prev) => {
        revokeBlobUrl(prev);
        return '';
      });
      return;
    }
    setName(defaults.name);
    setSpecies(defaults.species ? parsePetSpecies(defaults.species) : '');
    setBreed(defaults.breed ? (parsePetBreed(defaults.breed) ?? '') : '');
    setSex(
      defaults.sex === PetSex.Male || defaults.sex === PetSex.Female
        ? defaults.sex
        : ''
    );
    setAvatarUrl((prev) => {
      revokeBlobUrl(prev);
      return defaults.avatar ?? '';
    });
    setPendingAvatarFile(null);
    avatarCustomizedRef.current = false;
    if (mode === 'adopt') {
      setActivePresetKey(props.presetKey);
    }
    setIsPreset(false);
    clearCropImage();

    void ensureAnonymousSession().then((result) => {
      if (!result.ok) {
        toast.error(result.error);
      }
    });
  }, [
    open,
    mode,
    defaults.name,
    defaults.species,
    defaults.breed,
    defaults.sex,
    defaults.avatar,
    mode === 'adopt' ? props.presetKey : null,
  ]);

  useEffect(() => {
    return () => {
      revokeBlobUrl(cropImageSrc);
    };
  }, [cropImageSrc]);

  useEffect(() => {
    return () => {
      revokeBlobUrl(avatarUrl);
    };
  }, [avatarUrl]);

  const syncAdoptPreset = (nextBreed: PetBreed | string) => {
    if (mode !== 'adopt') return;
    const key = String(nextBreed);
    setActivePresetKey(key);
    if (avatarCustomizedRef.current) return;
    const preset = getPresetPet(key);
    if (!preset?.avatar) return;
    setAvatarUrl((prev) => {
      revokeBlobUrl(prev);
      return preset.avatar;
    });
  };

  useEffect(() => {
    if (breed && !breedOptions.includes(breed)) {
      const nextBreed = breedOptions[0] ?? '';
      setBreed(nextBreed);
      if (mode === 'adopt' && nextBreed) {
        syncAdoptPreset(nextBreed);
      }
    }
  }, [breed, breedOptions, mode]);

  const handleSpeciesChange = (value: string) => {
    const next = parsePetSpecies(value);
    setSpecies(next);
    const nextBreeds =
      mode === 'adopt'
        ? listPresetPetBreedsForSpecies(next)
        : listPetBreedsForSpecies(next);
    if (breed && !nextBreeds.includes(breed)) {
      const nextBreed = nextBreeds[0] ?? '';
      setBreed(nextBreed);
      if (nextBreed) syncAdoptPreset(nextBreed);
    }
  };

  const handleBreedSelect = (value: PetBreed) => {
    setBreed(value);
    setBreedOpen(false);
    syncAdoptPreset(value);
  };

  const handleAvatarFile = (file: File | undefined) => {
    if (!file || uploadingAvatar || pending || cropping) return;

    if (!isSupportedAvatarImageType(file.type)) {
      toast.error(t('avatarInvalid'));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(t('avatarUploadFailed'));
      return;
    }

    const src = URL.createObjectURL(file);
    setCropImageSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return src;
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropCancel = () => {
    if (uploadingAvatar) return;
    clearCropImage();
  };

  const handleCropConfirm = async (crop: SquareCropPixels) => {
    if (!cropImageSrc || uploadingAvatar || pending) return;

    setUploadingAvatar(true);
    try {
      const compressed = await compressSquareAvatarFromCrop(cropImageSrc, crop);
      if (compressed.byteSize > MAX_FILE_SIZE) {
        throw new Error(t('avatarUploadFailed'));
      }

      // Prefer a live session (incl. anonymous) so avatar uploads on crop.
      const ensured = await ensureAnonymousSession();
      if (!ensured.ok) {
        toast.error(ensured.error);
      }

      if (mode === 'edit' || ensured.ok) {
        const url = await uploadPetAvatar({
          file: compressed.file,
          byteSize: compressed.byteSize,
          previousImageUrl: avatarUrl,
          errorMessage: t('avatarUploadFailed'),
        });
        setPendingAvatarFile(null);
        avatarCustomizedRef.current = true;
        setAvatarUrl((prev) => {
          revokeBlobUrl(prev);
          return url;
        });
      } else {
        // No session available — keep a local file for submit-time upload.
        const previewUrl = URL.createObjectURL(compressed.file);
        setPendingAvatarFile(compressed.file);
        avatarCustomizedRef.current = true;
        setAvatarUrl((prev) => {
          revokeBlobUrl(prev);
          return previewUrl;
        });
      }
      clearCropImage();
    } catch (error) {
      console.error('pet avatar upload error:', error);
      toast.error(
        userFacingClientErrorMessage(error, t('avatarUploadFailed'), {
          area: 'pet_profile',
          operation: 'avatar_upload',
        })
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const validateAndBuildPayload = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error(t('nameRequired'));
      return null;
    }
    if (!species) {
      toast.error(t('speciesRequired'));
      return null;
    }
    if (showBreedField && !breed) {
      toast.error(t('breedRequired'));
      return null;
    }
    const resolvedBreed = normalizePetBreedForSpecies(species, breed);
    if (!resolvedBreed) {
      toast.error(t('breedRequired'));
      return null;
    }
    if (sex !== PetSex.Male && sex !== PetSex.Female) {
      toast.error(t('sexRequired'));
      return null;
    }

    const avatar = avatarUrl.trim() || null;
    const hasRemoteAvatar = Boolean(avatar && !avatar.startsWith('blob:'));
    if (
      mode === 'create' &&
      props.requireAvatar &&
      !pendingAvatarFile &&
      !hasRemoteAvatar
    ) {
      toast.error(t('avatarRequired'));
      return null;
    }

    return { name: trimmed, species, breed: resolvedBreed, sex, avatar };
  };

  const submitPetProfile = async () => {
    if (pending || uploadingAvatar) return;

    const payload = validateAndBuildPayload();
    if (!payload) return;

    startTransition(async () => {
      try {
        let avatar = payload.avatar;
        if (pendingAvatarFile) {
          const uploadedAvatar = await uploadPetAvatar({
            file: pendingAvatarFile,
            byteSize: pendingAvatarFile.size,
            previousImageUrl: avatarUrl,
            errorMessage: t('avatarUploadFailed'),
          });
          avatar = uploadedAvatar;
          setPendingAvatarFile(null);
          setAvatarUrl((prev) => {
            revokeBlobUrl(prev);
            return uploadedAvatar;
          });
        } else if (avatar?.startsWith('blob:')) {
          avatar = null;
        }

        if (mode === 'adopt') {
          const result = await adoptPetAction({
            presetKey: activePresetKey || props.presetKey,
            name: payload.name,
            species: payload.species,
            breed: payload.breed,
            sex: payload.sex,
            avatar,
          });
          assertActionSuccess(result, t('error'));
          onOpenChange(false);
          await navigateAfterPetEntry({
            destination: `${Routes.DashboardActions}?step=actions`,
            successMessage: t('adoptSuccess'),
          });
          return;
        }

        if (mode === 'create') {
          const result = await createPetAction({
            name: payload.name,
            species: payload.species,
            breed: payload.breed,
            sex: payload.sex,
            avatar,
            isPreset: isAdmin ? isPreset : false,
          });
          assertActionSuccess(result, t('error'));
          onOpenChange(false);
          if (props.onSuccess) {
            toast.success(t('createSuccess'));
            props.onSuccess();
          } else {
            await navigateAfterPetEntry({
              destination: Routes.DashboardActions,
              successMessage: t('createSuccess'),
            });
          }
          return;
        }

        const result = await updatePetProfileAction({
          petId: props.petId,
          name: payload.name,
          species: payload.species,
          breed: payload.breed,
          sex: payload.sex,
          avatar,
        });
        assertActionSuccess(result, t('error'));
        toast.success(t('updateSuccess'));
        onOpenChange(false);
        if (props.onSuccess) {
          props.onSuccess();
        } else {
          router.refresh();
        }
      } catch (error) {
        toast.error(
          userFacingClientErrorMessage(error, t('error'), {
            area: 'pet_profile',
            operation: 'save_profile',
          })
        );
      }
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void submitPetProfile();
  };

  const title =
    mode === 'adopt'
      ? t('titleAdopt')
      : mode === 'create'
        ? t('titleCreate')
        : t('titleEdit');
  const description =
    mode === 'adopt'
      ? t('descriptionAdopt')
      : mode === 'create'
        ? t('descriptionCreate')
        : t('descriptionEdit');
  const submitLabel =
    mode === 'adopt' ? t('adopt') : mode === 'create' ? t('create') : t('save');

  const busy = pending || uploadingAvatar || cropping;

  return (
    <>
      <Dialog
        open={profileOpen}
        onOpenChange={(next) => {
          // Ignore close events caused by hiding the profile dialog for crop.
          if (!next && cropping) return;
          onOpenChange(next);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmit} className="space-y-5">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>

            <div
              className={cn(
                'grid grid-cols-1 gap-4',
                showBreedField && 'sm:grid-cols-2'
              )}
            >
              <div className="space-y-2">
                <Label htmlFor="pet-profile-species">{t('speciesLabel')}</Label>
                <Select
                  value={species || undefined}
                  onValueChange={handleSpeciesChange}
                >
                  <SelectTrigger
                    id="pet-profile-species"
                    className="!h-11 w-full"
                  >
                    <SelectValue placeholder={t('speciesPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {speciesOptions.map((value) => (
                      <SelectItem key={value} value={value}>
                        {getPetSpeciesLabel(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {showBreedField ? (
                <div className="space-y-2">
                  <Label htmlFor="pet-profile-breed">{t('breedLabel')}</Label>
                  <Popover modal open={breedOpen} onOpenChange={setBreedOpen}>
                    <PopoverTrigger
                      render={
                        <Button
                          id="pet-profile-breed"
                          type="button"
                          variant="outline"
                          role="combobox"
                          aria-expanded={breedOpen}
                          disabled={busy}
                          className="h-11 w-full justify-between px-3 font-normal"
                        />
                      }
                    >
                      <span
                        className={cn(
                          'truncate',
                          !selectedBreedLabel && 'text-muted-foreground'
                        )}
                      >
                        {selectedBreedLabel ?? t('breedPlaceholder')}
                      </span>
                      <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[var(--radix-popover-trigger-width)] p-0"
                      align="start"
                    >
                      <Command>
                        <CommandInput placeholder={t('breedSearch')} />
                        <CommandList>
                          <CommandEmpty>{t('breedEmpty')}</CommandEmpty>
                          <CommandGroup>
                            {breedOptions.map((value) => {
                              const label = getPetBreedLabel(value);
                              return (
                                <CommandItem
                                  key={value}
                                  value={label}
                                  onSelect={() => {
                                    handleBreedSelect(value);
                                  }}
                                >
                                  <CheckIcon
                                    className={cn(
                                      'size-4 shrink-0',
                                      breed === value
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                  <span className="truncate">{label}</span>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              ) : null}
            </div>

            <div className="space-y-3">
              <Label>{t('avatarLabel')}</Label>
              <div className="flex items-center gap-4">
                <PetAvatar
                  src={avatarUrl || null}
                  size="lg"
                  className="size-20 border border-input shadow-none"
                  alt=""
                />
                <div className="min-w-0 space-y-1.5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(event) => {
                      handleAvatarFile(event.target.files?.[0]);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {t('avatarChange')}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    {t('avatarRecommendation')}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pet-profile-name">{t('nameLabel')}</Label>
                <input
                  id="pet-profile-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  maxLength={80}
                  autoComplete="off"
                  className="min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  placeholder={t('namePlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pet-profile-sex">{t('sexLabel')}</Label>
                <Select
                  value={sex || undefined}
                  onValueChange={(value) => setSex(value as PetSex)}
                  required
                >
                  <SelectTrigger id="pet-profile-sex" className="!h-11 w-full">
                    <SelectValue placeholder={t('sexLabel')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PetSex.Male}>{t('sexMale')}</SelectItem>
                    <SelectItem value={PetSex.Female}>
                      {t('sexFemale')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {mode === 'create' && isAdmin ? (
              <div className="flex items-center justify-between gap-4 rounded-lg border px-3 py-2">
                <div className="grid gap-0.5">
                  <Label htmlFor="pet-profile-is-preset">{t('isPreset')}</Label>
                  <p className="text-muted-foreground text-xs">
                    {t('isPresetHint')}
                  </p>
                </div>
                <Switch
                  id="pet-profile-is-preset"
                  checked={isPreset}
                  onCheckedChange={setIsPreset}
                  disabled={busy}
                />
              </div>
            ) : null}

            <DialogFooter className="gap-2 sm:justify-end">
              <Button
                type="button"
                variant="brutalOutline"
                size="lg"
                className="min-h-11 gap-2 px-4 text-[13px]"
                onClick={() => onOpenChange(false)}
                disabled={busy}
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                variant="brutal"
                size="lg"
                className="min-h-11 gap-2 px-4 text-[13px]"
                disabled={busy}
              >
                {pending ? t('saving') : submitLabel}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {cropImageSrc ? (
        <PetAvatarCropDialog
          open={open && cropping}
          imageSrc={cropImageSrc}
          busy={uploadingAvatar}
          onCancel={handleCropCancel}
          onConfirm={(crop) => {
            void handleCropConfirm(crop);
          }}
        />
      ) : null}
    </>
  );
}
