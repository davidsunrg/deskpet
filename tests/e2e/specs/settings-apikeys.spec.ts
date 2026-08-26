import { expect, test } from '@playwright/test';

import {
  cleanupE2EUsers,
  loginByForm,
  registerE2EUser,
} from '../fixtures/auth';

test.describe('API key settings', () => {
  test.beforeEach(async ({ request }) => {
    await cleanupE2EUsers(request);
  });

  test.afterEach(async ({ request }) => {
    await cleanupE2EUsers(request);
  });

  test('creates and deletes an API key', async ({ page, request }) => {
    const user = await registerE2EUser(request);
    const keyName = `E2E key ${Date.now().toString().slice(-6)}`;

    await loginByForm(page, user);
    await page.goto('/settings/apikeys');

    await page.getByRole('button', { name: 'Create API Key' }).click();
    const createDialog = page.getByRole('dialog', {
      name: 'Create API Key',
    });
    await createDialog.getByLabel('Name').fill(keyName);
    await createDialog.getByRole('button', { name: 'Create' }).click();

    const secretDialog = page.getByRole('dialog', {
      name: 'Your new API key',
    });
    await expect(secretDialog).toBeVisible();
    await expect(secretDialog.locator('input[readonly]')).not.toHaveValue('');
    await secretDialog.getByRole('button', { name: 'Done' }).click();

    const keyRow = page.getByRole('row').filter({ hasText: keyName });
    await expect(keyRow).toBeVisible();
    await keyRow.getByRole('button', { name: 'Actions' }).click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();

    await expect(page.getByText('API key deleted successfully')).toBeVisible();
    await expect(keyRow).toHaveCount(0);
  });
});
