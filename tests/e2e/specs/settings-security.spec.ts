import { expect, test } from '@playwright/test';

import {
  cleanupE2EUsers,
  loginByForm,
  registerE2EUser,
} from '../fixtures/auth';

test.describe('security settings', () => {
  test.beforeEach(async ({ request }) => {
    await cleanupE2EUsers(request);
  });

  test.afterEach(async ({ request }) => {
    await cleanupE2EUsers(request);
  });

  test('changes the password and rejects the old credential', async ({
    page,
    request,
  }) => {
    const user = await registerE2EUser(request);
    const newPassword = 'NewPassword123456!';

    await loginByForm(page, user);
    await page.goto('/settings/security');

    const passwordForm = page.locator('form').filter({
      has: page.locator('input[name="currentPassword"]'),
    });
    await passwordForm
      .locator('input[name="currentPassword"]')
      .fill(user.password);
    await passwordForm.locator('input[name="newPassword"]').fill(newPassword);
    await passwordForm.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Password updated successfully')).toBeVisible();

    await page.getByText(user.email).first().click();
    await page.getByRole('menuitem', { name: 'Log out' }).click();
    await expect(page).toHaveURL(/\/$/);

    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    await page.locator('input[name="email"]').fill(user.email);
    await page.locator('input[name="password"]').fill(user.password);
    await page.getByRole('button', { name: /^sign in$/i }).click();
    await expect(page.getByText('Invalid email or password.')).toBeVisible();

    await page.locator('input[name="password"]').fill(newPassword);
    await page.getByRole('button', { name: /^sign in$/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/?$/);
  });
});
