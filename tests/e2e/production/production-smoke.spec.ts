import { expect, test } from '@playwright/test';

const ssrPages = [
  {
    path: '/',
    heading: 'Ship Faster with TanStack, Cost Less with Cloudflare',
  },
  { path: '/pricing', heading: 'Pricing' },
  { path: '/blog', heading: 'Blog' },
  { path: '/auth/login', heading: 'Welcome back' },
] as const;

test('production Worker serves SSR pages and the health API', async ({
  page,
  request,
}) => {
  const runtimeErrors: string[] = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('console', (message) => {
    if (
      message.type() === 'error' &&
      !message.text().startsWith('Failed to load resource: net::')
    ) {
      runtimeErrors.push(message.text());
    }
  });

  for (const { path, heading } of ssrPages) {
    await test.step(path, async () => {
      const response = await page.goto(path, {
        waitUntil: 'domcontentloaded',
      });
      expect(response?.ok(), `${path} should return 2xx`).toBeTruthy();
      expect(response?.headers()['content-type']).toContain('text/html');
      await expect(
        page.getByText(heading, { exact: true }).first()
      ).toBeVisible();
    });
  }

  expect(runtimeErrors).toEqual([]);

  await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/auth\/login/);
  await expect(
    page.getByText('Welcome back', { exact: true }).first()
  ).toBeVisible();

  const health = await request.get('/api/ping');
  await expect(health).toBeOK();
  expect(await health.json()).toEqual({ message: 'pong' });

  const testHelper = await request.delete('/api/e2e/users', {
    headers: { 'x-e2e-secret': 'mkfast-e2e-secret' },
  });
  expect(testHelper.status()).toBe(404);
});
