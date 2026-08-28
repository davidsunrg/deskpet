'use client';

import { markPetCheckoutStartedFn } from '@/api/dashboard-pets';
import { createCheckoutSession } from '@/api/payment';
import { DashboardPetDetailBasicsStep } from '@/components/dashboard/pet-detail/dashboard-pet-detail-basics-step';
import { DashboardPetDetailDetailsStep } from '@/components/dashboard/pet-detail/dashboard-pet-detail-details-step';
import { DashboardPetDetailFinalStep } from '@/components/dashboard/pet-detail/dashboard-pet-detail-final-step';
import { DashboardPetDetailPhotosStep } from '@/components/dashboard/pet-detail/dashboard-pet-detail-photos-step';
import { DashboardPetDetailStepNav } from '@/components/dashboard/pet-detail/dashboard-pet-detail-step-nav';
import { websiteConfig } from '@/config/website';
import { dashboardPetDetailRoute, Routes } from '@/lib/routes';
import { getCanonicalUrl, getFileAccessUrl } from '@/lib/urls';
import { PetSex } from '@/utils/pet-catalog';
import { PetCreationStatus } from '@/utils/pets/pet-creation-status';
import {
  DEFAULT_DASHBOARD_PET_DETAIL_STEP,
  type DashboardPetDetailStep,
} from '@/utils/pets/dashboard-pet-detail-steps';
import { useCallback, useEffect, useState } from 'react';
import { usePostHog } from 'posthog-js/react';
import { toast } from 'sonner';

export type UserPetDetail = {
  id: string;
  name: string;
  species: string;
  breed: string;
  sex: string | null;
  avatar: string | null;
  photoKeys: string[];
  status: string;
  deliveryAt: Date | null;
  paymentId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type DashboardPetDetailProps = {
  pet: UserPetDetail;
  userEmail?: string | null;
  initialStep?: DashboardPetDetailStep;
};

function getSexLabel(sex: string | null): string | null {
  if (sex === PetSex.Male) return 'Male';
  if (sex === PetSex.Female) return 'Female';
  return null;
}

export function DashboardPetDetail({
  pet,
  userEmail = null,
  initialStep = DEFAULT_DASHBOARD_PET_DETAIL_STEP,
}: DashboardPetDetailProps) {
  const [step, setStep] = useState<DashboardPetDetailStep>(initialStep);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const posthog = usePostHog();

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep, pet.id]);

  const avatarUrl = pet.avatar ? getFileAccessUrl(pet.avatar) : null;
  const sexLabel = getSexLabel(pet.sex);
  const photoUrls = pet.photoKeys.map((key) => getFileAccessUrl(key));
  const isPaid = pet.status === PetCreationStatus.Paid;
  const customizePlan = websiteConfig.payment?.price?.plans.customizeMyOwn;
  const checkoutPlanId = customizePlan?.id ?? 'customizeMyOwn';
  const priceId = customizePlan?.prices[0]?.priceId ?? '';

  const handleJoinQueue = useCallback(async () => {
    if (!priceId) {
      toast.error('Checkout is unavailable. Please try again later.');
      return;
    }

    try {
      setCheckoutBusy(true);
      posthog?.capture('checkout_started', {
        section: 'pet_final_step',
        plan_id: checkoutPlanId,
        price_id: priceId,
        pet_id: pet.id,
      });
      await markPetCheckoutStartedFn({ data: { petId: pet.id } });
      const finalReturnPath = `${dashboardPetDetailRoute(pet.id)}?step=final`;
      const successUrl = getCanonicalUrl(
        `${Routes.Payment}?session_id={CHECKOUT_SESSION_ID}&callback=${encodeURIComponent(finalReturnPath)}`
      );
      const cancelUrl = getCanonicalUrl(finalReturnPath);
      const result = await createCheckoutSession({
        data: {
          planId: checkoutPlanId,
          priceId,
          successUrl,
          cancelUrl,
          metadata: { petId: pet.id, source: 'pet_final_step' },
        },
      });

      if (result?.url) {
        window.location.href = result.url;
        return;
      }
      toast.error('Checkout failed. Please try again.');
    } catch (error) {
      console.error('Pet checkout error:', error);
      toast.error('Checkout failed. Please try again.');
    } finally {
      setCheckoutBusy(false);
    }
  }, [checkoutPlanId, pet.id, posthog, priceId]);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:gap-6">
      <DashboardPetDetailStepNav step={step} onStepChange={setStep} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {step === 'photos' ? (
          <DashboardPetDetailPhotosStep
            photoKeys={pet.photoKeys}
            photoUrls={photoUrls}
          />
        ) : null}
        {step === 'basics' ? (
          <DashboardPetDetailBasicsStep
            avatarUrl={avatarUrl}
            name={pet.name}
            sexLabel={sexLabel}
            createdAt={pet.createdAt}
            updatedAt={pet.updatedAt}
          />
        ) : null}
        {step === 'details' ? (
          <DashboardPetDetailDetailsStep
            avatarUrl={avatarUrl}
            name={pet.name}
            sexLabel={sexLabel}
            species={pet.species}
            breed={pet.breed}
          />
        ) : null}
        {step === 'final' ? (
          <DashboardPetDetailFinalStep
            isPaid={isPaid}
            species={pet.species}
            deliveryAt={pet.deliveryAt}
            userEmail={userEmail}
            checkoutBusy={checkoutBusy}
            onJoinQueue={handleJoinQueue}
          />
        ) : null}
      </div>
    </div>
  );
}
