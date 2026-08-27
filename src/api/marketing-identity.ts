import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { getMarketingNavbarIdentity } from '@/server/auth/get-marketing-navbar-identity';

export const getMarketingNavbarIdentityFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  const headers = getRequestHeaders();
  return getMarketingNavbarIdentity(headers);
});
