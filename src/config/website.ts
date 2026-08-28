import { getMessageList } from '@/lib/locale';
import { m } from '@/locale/paraglide/messages';
import { clientEnv } from '@/env/client';
import type { WebsiteConfig } from '../types';
import {
  DEFAULT_ALLOWED_TYPES,
  DEFAULT_MAX_FILE_SIZE,
  DEFAULT_R2_BUCKET_NAME,
  DEFAULT_USER_FILES_FOLDER,
} from '@/storage/constants';

// Payment provider controlled by env var: 'stripe' | 'creem' | 'waffo' | '' (empty means disabled)
const paymentProvider = clientEnv.VITE_PAYMENT_PROVIDER;
const isPaymentEnabled = paymentProvider !== '';
// Price/product IDs per provider; add a new row when adding a provider
const providerPriceIds = {
  stripe: {
    proMonthly: clientEnv.VITE_STRIPE_PRICE_PRO_MONTHLY,
    proYearly: clientEnv.VITE_STRIPE_PRICE_PRO_YEARLY,
    lifetime: clientEnv.VITE_STRIPE_PRICE_LIFETIME,
    customizeMyOwn: clientEnv.VITE_STRIPE_PRICE_LIFETIME,
  },
  creem: {
    proMonthly: clientEnv.VITE_CREEM_PRODUCT_PRO_MONTHLY,
    proYearly: clientEnv.VITE_CREEM_PRODUCT_PRO_YEARLY,
    lifetime: clientEnv.VITE_CREEM_PRODUCT_LIFETIME,
    customizeMyOwn: clientEnv.VITE_CREEM_PRODUCT_LIFETIME,
  },
  waffo: {
    proMonthly: clientEnv.VITE_WAFFO_PRODUCT_PRO_MONTHLY,
    proYearly: clientEnv.VITE_WAFFO_PRODUCT_PRO_YEARLY,
    lifetime: clientEnv.VITE_WAFFO_PRODUCT_LIFETIME,
    customizeMyOwn: clientEnv.VITE_WAFFO_PRODUCT_LIFETIME,
  },
} satisfies Record<
  Exclude<typeof paymentProvider, ''>,
  Record<
    'proMonthly' | 'proYearly' | 'lifetime' | 'customizeMyOwn',
    string | undefined
  >
>;
const activePriceIds = isPaymentEnabled
  ? providerPriceIds[paymentProvider]
  : undefined;
const priceIds = {
  proMonthly: activePriceIds?.proMonthly ?? '',
  proYearly: activePriceIds?.proYearly ?? '',
  lifetime: activePriceIds?.lifetime ?? '',
  customizeMyOwn: activePriceIds?.customizeMyOwn ?? '',
};

/**
 * Website config
 */
export const websiteConfig: WebsiteConfig = {
  ui: {
    mode: {
      defaultMode: 'light',
      enableSwitch: false,
    },
  },
  metadata: {
    name: 'DeskPet.ai',
    title: 'DeskPet.ai',
    description:
      "Play free desktop pets in your browser or download them for your desktop. Create your own from your pet's photo, then manage care, reminders, memories, expenses, and more—all in one place.",
    images: {
      ogImage: '/og.png',
      logoLight: '/logo.png',
      logoDark: '/logo-dark.png',
    },
  },
  social: {
    github: 'https://github.com/MkSaaSHQ',
    twitter: 'https://x.com/deskpetai',
    youtube: 'https://www.youtube.com/@deskpetai',
  },
  auth: {
    enable: true,
    enableGoogleLogin: true,
    enableCredentialLogin: false,
    enableEmailOtpLogin: true,
    enableNavbarLogin: true,
    enableDeleteAccount: true,
    enableDeleteUser: true,
  },
  blog: {
    enable: false,
    paginationSize: 6,
  },
  mail: {
    enable: true,
    provider: 'cloudflare',
    fromEmail: 'DeskPet <no-reply@updates.bymail.ai>',
    supportEmail: 'DeskPet <support@updates.bymail.ai>',
  },
  newsletter: {
    enable: true,
    provider: 'resend',
    autoSubscribeAfterSignUp: true,
  },
  notification: {
    enable: true,
    provider: 'discord',
  },
  cache: {
    enable: true,
    provider: 'kv',
  },
  storage: {
    enable: true,
    provider: 'r2',
    maxFileSize: DEFAULT_MAX_FILE_SIZE,
    allowedTypes: DEFAULT_ALLOWED_TYPES,
    userFilesFolder: DEFAULT_USER_FILES_FOLDER,
    bucketName: DEFAULT_R2_BUCKET_NAME,
    s3ApiEndpoint:
      'https://8253e869540591b2387fb67464d8abb4.r2.cloudflarestorage.com',
  },
  desktopDownload: {
    version: '1.1.8',
    macKey: 'downloads/DeskPet-1.1.8-universal.dmg',
    windowsKey: 'downloads/DeskPet-Setup-1.1.8.exe',
  },
  payment: {
    enable: isPaymentEnabled,
    showMarketingPricing: false,
    provider: isPaymentEnabled ? paymentProvider : undefined,
    price: {
      plans: {
        free: {
          id: 'free',
          prices: [],
          isFree: true,
          isLifetime: false,
          get name() {
            return m.pricing_page_plans_free_name();
          },
          get description() {
            return m.pricing_page_plans_free_description();
          },
          get features() {
            return [...getMessageList(m.pricing_page_plans_free_features())];
          },
          get limits() {
            return [];
          },
        },
        customizeMyOwn: {
          id: 'customizeMyOwn',
          prices: [
            {
              type: 'one_time',
              priceId: priceIds.customizeMyOwn,
              amount: 7999,
              currency: 'USD',
              allowPromotionCode: true,
            },
          ],
          isFree: false,
          isLifetime: true,
          popular: true,
          get name() {
            return m.pricing_page_plans_customize_my_own_name();
          },
          get description() {
            return m.pricing_page_plans_customize_my_own_description();
          },
          get features() {
            return [
              ...getMessageList(
                m.pricing_page_plans_customize_my_own_features()
              ),
            ];
          },
          get limits() {
            return [];
          },
        },
      },
    },
  },
};
