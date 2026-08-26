import { expect, test } from '@playwright/test';
import {
  cleanupE2EUsers,
  loginByForm,
  registerE2EUser,
  updateE2EUser,
} from '../fixtures/auth';
import { createE2EUser } from '../fixtures/test-data';

test.describe('authentication and protected routes', () => {
  test.beforeAll(async ({ request }) => {
    await cleanupE2EUsers(request);
  });

  test.afterAll(async ({ request }) => {
    await cleanupE2EUsers(request);
  });

  test('redirects guests from dashboard to login', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test('allows a verified user to sign in and view dashboard', async ({
    page,
    request,
  }) => {
    const user = await registerE2EUser(request);

    await loginByForm(page, user);
    await expect(page.getByText('Total Revenue')).toBeVisible();
  });

  test('allows a user to register from the register page', async ({
    page,
    request,
  }) => {
    const user = createE2EUser();

    await page.goto('/auth/register');
    await page.waitForLoadState('networkidle');
    await page.locator('input[name="name"]').fill(user.name);
    await page.locator('input[name="email"]').fill(user.email);
    await page.locator('input[name="password"]').fill(user.password);
    await page.getByRole('button', { name: /^sign up$|^注册$/i }).click();

    await expect(
      page.getByText(/check your email to verify your account|请检查您的邮箱/i)
    ).toBeVisible();

    await updateE2EUser(request, {
      email: user.email,
      emailVerified: true,
      role: 'user',
    });
    await loginByForm(page, user);
    await expect(page.getByText('Total Revenue')).toBeVisible();
  });

  test('redirects non-admin users away from admin pages', async ({
    page,
    request,
  }) => {
    const user = await registerE2EUser(request);

    await loginByForm(page, user);
    await page.goto('/admin/users');

    await expect(page).toHaveURL(/\/dashboard\/?$/);
  });

  test('allows admin users to view the users dashboard', async ({
    page,
    request,
  }) => {
    const user = await registerE2EUser(request, { role: 'admin' });

    await loginByForm(page, user);
    await page.goto('/admin/users');

    await expect(page).toHaveURL(/\/admin\/users\/?$/);
    await expect(
      page.getByRole('table').getByText(user.email).first()
    ).toBeVisible();

    await page
      .getByRole('table')
      .getByRole('button', { name: user.name })
      .click();
    const userDrawer = page.getByRole('dialog');
    await expect(
      userDrawer.getByRole('heading', { name: user.name })
    ).toBeVisible();

    const drawerHeader = userDrawer.locator('[data-slot="drawer-header"]');
    const roleBadge = userDrawer.getByText(/admin|管理员/i, { exact: true });
    const emailLabel = userDrawer.getByText(/^(email|邮箱):$/i);
    const emailValue = userDrawer.getByText(user.email, { exact: true });
    const [headerBox, roleBox, emailLabelBox, emailValueBox] =
      await Promise.all([
        drawerHeader.boundingBox(),
        roleBadge.boundingBox(),
        emailLabel.boundingBox(),
        emailValue.boundingBox(),
      ]);

    expect(headerBox).not.toBeNull();
    expect(roleBox).not.toBeNull();
    expect(emailLabelBox).not.toBeNull();
    expect(emailValueBox).not.toBeNull();
    expect(
      (roleBox?.y ?? 0) - ((headerBox?.y ?? 0) + (headerBox?.height ?? 0))
    ).toBeGreaterThanOrEqual(12);
    expect(
      Math.abs(
        (emailLabelBox?.y ?? 0) +
          (emailLabelBox?.height ?? 0) / 2 -
          ((emailValueBox?.y ?? 0) + (emailValueBox?.height ?? 0) / 2)
      )
    ).toBeLessThanOrEqual(2);

    await userDrawer.getByRole('button', { name: /close|关闭/i }).click();
    await expect(userDrawer).toBeHidden();
  });
});
