export const Routes = {
  Root: '/',

  // Marketing routes
  Features: '/#features',
  Faqs: '/#faqs',
  FAQ: '/#faqs',
  Pricing: '/pricing',
  Blog: '/blog',
  Changelog: '/changelog',
  Roadmap: '/roadmap',
  About: '/about',
  Contact: '/contact',
  Waitlist: '/waitlist',
  Ai: '/ai',
  Playground: '/playground',
  Pets: '/pets',
  PetHub: '/p',
  Download: '/download',
  DesktopPetCreator: '/tools/desktop-pet-maker',
  PetVideoCreator: '/tools/pet-video-maker',
  AiSummarization: '/ai#text-summarization',
  AiTranslation: '/ai#translation',
  AiTagline: '/ai#tagline-generator',
  AiTts: '/ai#text-to-speech',
  AiImageFal: '/ai#image-generator-fal',
  AiImageCf: '/ai#image-generator-cloudflare',
  AiImageEdit: '/ai#image-editing',
  AiCaption: '/ai#image-captioning',

  // Auth routes
  Auth: '/auth',
  Login: '/auth/login',
  Register: '/auth/register',
  AuthError: '/auth/error',
  ForgotPassword: '/auth/forgot-password',
  ResetPassword: '/auth/reset-password',

  // Legal routes
  TermsOfService: '/terms',
  PrivacyPolicy: '/privacy',
  CookiePolicy: '/cookie',

  // Payment routes
  Payment: '/settings/payment',

  // Dashboard routes
  Dashboard: '/dashboard',

  // Settings routes
  Settings: '/settings',
  SettingsProfile: '/settings/profile',
  SettingsBilling: '/settings/billing',
  SettingsCredits: '/settings/credits',
  SettingsSecurity: '/settings/security',
  SettingsFiles: '/settings/files',
  SettingsApiKeys: '/settings/apikeys',
  SettingsNotifications: '/settings/notifications',

  // Admin routes
  Admin: '/admin',
  AdminUsers: '/admin/users',
} as const;

/** Default login redirect route */
export const DEFAULT_LOGIN_REDIRECT = Routes.Dashboard;

/** Canonical pet detail route: `/p/{slug}`. */
export function petDetailRoute(slug: string): string {
  return `/p/${slug}`;
}

/** Query key for the selected preset pet on `/playground`. */
export const PLAYGROUND_PET_QUERY = 'pet';

type PlaygroundRouteOptions = {
  /** Public registry pet key (`?pet=`). */
  petKey?: string | null;
};

/**
 * Pets playground deep-link.
 * Example: `/playground?pet=orange-cat`
 */
export function playgroundRoute(
  petKeyOrOptions?: string | null | PlaygroundRouteOptions
): string {
  const options: PlaygroundRouteOptions =
    petKeyOrOptions && typeof petKeyOrOptions === 'object'
      ? petKeyOrOptions
      : { petKey: petKeyOrOptions };

  const params = new URLSearchParams();
  if (options.petKey) {
    params.set(PLAYGROUND_PET_QUERY, options.petKey);
  }
  const query = params.toString();
  return query ? `${Routes.Playground}?${query}` : Routes.Playground;
}
