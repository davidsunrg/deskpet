import { expect, test, type Request } from '@playwright/test';

import {
  cleanupE2EUsers,
  loginByForm,
  registerE2EUser,
} from '../fixtures/auth';

test.describe('file settings', () => {
  test.beforeEach(async ({ request }) => {
    await cleanupE2EUsers(request);
  });

  test.afterEach(async ({ request }) => {
    await cleanupE2EUsers(request);
  });

  test('uploads, reads, and deletes a private file', async ({
    page,
    request,
  }) => {
    const user = await registerE2EUser(request);
    const fileName = `e2e-file-${Date.now().toString().slice(-6)}.txt`;
    const fileBody = 'TanStarter E2E private file';

    await loginByForm(page, user);
    await page.goto('/settings/files');
    await page.waitForLoadState('networkidle');

    let serverFunctionRequest: Request | undefined;
    page.on('request', (outgoingRequest) => {
      const requestUrl = new URL(outgoingRequest.url());
      if (
        !serverFunctionRequest &&
        outgoingRequest.method() === 'POST' &&
        requestUrl.origin === new URL(page.url()).origin
      ) {
        serverFunctionRequest = outgoingRequest;
      }
    });

    await page.getByRole('button', { name: 'Upload file' }).click();
    const uploadDialog = page.getByRole('dialog', { name: 'Upload file' });
    await uploadDialog.getByLabel('File').setInputFiles({
      name: fileName,
      mimeType: 'text/plain',
      buffer: Buffer.from(fileBody),
    });
    await uploadDialog
      .getByLabel('Description')
      .fill('Dependency upgrade regression fixture');
    await uploadDialog
      .getByRole('button', { name: 'Upload', exact: true })
      .click();

    await expect(page.getByText('File uploaded successfully')).toBeVisible();
    const fileRow = page.getByRole('row').filter({ hasText: fileName });
    await expect(fileRow).toBeVisible();

    expect(serverFunctionRequest).toBeDefined();
    const replayHeaders = await serverFunctionRequest?.allHeaders();
    delete replayHeaders?.cookie;
    delete replayHeaders?.host;
    delete replayHeaders?.['content-length'];
    const crossSiteResponse = await page
      .context()
      .request.fetch(serverFunctionRequest?.url() ?? '', {
        method: 'POST',
        headers: {
          ...replayHeaders,
          origin: 'https://attacker.example',
          referer: 'https://attacker.example/',
          'sec-fetch-site': 'cross-site',
        },
        data: serverFunctionRequest?.postDataBuffer() ?? undefined,
      });
    expect(crossSiteResponse.status()).toBe(403);

    const fileUrl = await fileRow
      .getByRole('link', { name: 'Open' })
      .getAttribute('href');
    expect(fileUrl).toBeTruthy();
    const download = await page.evaluate(async (url) => {
      const response = await fetch(url);
      return {
        body: await response.text(),
        cacheControl: response.headers.get('cache-control'),
        contentDisposition: response.headers.get('content-disposition'),
        status: response.status,
      };
    }, fileUrl as string);
    expect(download).toEqual({
      body: fileBody,
      cacheControl: 'private, no-store',
      contentDisposition: 'attachment',
      status: 200,
    });

    await fileRow.getByRole('button', { name: 'Actions' }).click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await expect(page.getByText('File deleted successfully')).toBeVisible();
    await expect(fileRow).toHaveCount(0);
  });
});
