export const Routes = {
  Root: '/',

  // Marketing routes
  Features: '/#features',
  Faqs: '/#faqs',
  FAQ: '/#faqs',
  Pricing: '/pricing',
  Blog: '/blog',
  About: '/about',
  Contact: '/contact',
  Playground: '/playground',
  Pets: '/pets',
  PetHub: '/p',
  Download: '/download',
  Health: '/health',
  Expense: '/expense',
  DesktopPetCreator: '/tools/desktop-pet-maker',
  PetVideoCreator: '/tools/pet-video-maker',

  // Auth routes
  Auth: '/auth',
  Login: '/auth/login',
  Register: '/auth/register',
  Signup: '/auth/signup',
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
  DashboardOverview: '/dashboard/overview',
  DashboardActions: '/dashboard/actions',
  DashboardPets: '/dashboard/pets',

  // Settings routes
  Settings: '/settings',
  SettingsProfile: '/settings/profile',
  SettingsBilling: '/settings/billing',
  SettingsCredits: '/settings/credits',
  SettingsSecurity: '/settings/security',
  SettingsFiles: '/settings/files',
  SettingsNotifications: '/settings/notifications',

  // Admin routes
  Admin: '/admin',
  AdminUsers: '/admin/users',
} as const;

/** Default login redirect route */
export const DEFAULT_LOGIN_REDIRECT = Routes.DashboardPets;

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
