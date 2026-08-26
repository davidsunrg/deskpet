import { expect, test } from '@playwright/test';

test.describe('router boundaries', () => {
  test('renders the not-found boundary for an unknown route', async ({
    page,
  }) => {
    const response = await page.goto('/e2e-route-that-does-not-exist');

    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole('heading', { name: 'Not Found' })
    ).toBeVisible();
  });

  test('renders the root not-found boundary from a route loader', async ({
    page,
  }) => {
    const response = await page.goto('/test-404');

    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole('heading', { name: 'Not Found' })
    ).toBeVisible();
  });

  test('renders the error boundary when a route loader throws', async ({
    page,
  }) => {
    const response = await page.goto('/test-error');

    expect(response?.status()).toBe(500);
    await expect(
      page.getByRole('heading', { name: 'Something went wrong!' })
    ).toBeVisible();
    await expect(
      page.getByText(
        'Intentional error for testing DefaultCatchBoundary (errorComponent)'
      )
    ).toBeVisible();
  });
});
