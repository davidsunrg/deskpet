import { Routes } from '@/lib/routes';

export function loginHrefWithCallback(callbackUrl: string): string {
  return `${Routes.Login}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}
