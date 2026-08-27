import { expect, test } from '@playwright/test';
import {
  expectHealthyPage,
  installPageHealthMonitor,
  localizedPath,
  setTheme,
} from '../fixtures/page-health';

test.describe('DeskPet public shell', () => {
  test('homepage renders DeskPet hero and primary CTAs', async ({ page }) => {
    await setTheme(page, 'light');
    const monitor = installPageHealthMonitor(page);

    await expectHealthyPage(page, monitor, '/', { theme: 'light' });

    await expect(
      page.getByRole('heading', {
        name: /turn your pet into a desktop companion/i,
      })
    ).toBeVisible();

    await expect(page.getByTestId('hero-cta-playground')).toBeVisible();
    await expect(page.getByTestId('hero-cta-make-pet')).toBeVisible();
    await expect(page.getByTestId('home-pet-grid')).toBeVisible();

    monitor.expectNoErrors('homepage hero');
  });

  test('playground loads pet picker and pet media', async ({ page }) => {
    await setTheme(page, 'light');
    const monitor = installPageHealthMonitor(page);

    await page.goto('/playground');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByTestId('playground-pet-picker')).toBeVisible({
      timeout: 30_000,
    });

    const petVideo = page.locator('video').first();
    await expect(petVideo).toBeVisible({ timeout: 30_000 });

    monitor.expectNoErrors('playground initial load');
  });

  test('playground deep link selects the requested pet', async ({ page }) => {
    await setTheme(page, 'light');
    const monitor = installPageHealthMonitor(page);

    await page.goto('/playground?pet=orange-cat');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByTestId('playground-pet-picker')).toBeVisible({
      timeout: 30_000,
    });

    const selectedPet = page.locator(
      '[data-testid="playground-pet-option-orange-cat"][data-selected="true"]'
    );
    await expect(selectedPet).toBeVisible({ timeout: 30_000 });

    await page.reload();
    await expect(selectedPet).toBeVisible({ timeout: 30_000 });

    monitor.expectNoErrors('playground deep link');
  });

  test('localized playground route renders in zh', async ({ page }) => {
    await setTheme(page, 'light');
    const monitor = installPageHealthMonitor(page);

    await expectHealthyPage(page, monitor, localizedPath('/playground', 'zh'), {
      theme: 'light',
    });

    await expect(page.getByTestId('playground-pet-picker')).toBeVisible({
      timeout: 30_000,
    });

    monitor.expectNoErrors('localized playground');
  });
});
