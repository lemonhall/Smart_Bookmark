import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { launchExtensionContext } from './utils/launchExtension';

test('extension loads and popup is reachable', async () => {
  const { context, extensionId, userDataDir } = await launchExtensionContext();
  const page = await context.newPage();

  const httpRequests: string[] = [];
  page.on('request', (req) => {
    if (/^https?:/i.test(req.url())) httpRequests.push(req.url());
  });

  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  await expect(page.getByTestId('popup-root')).toBeVisible();
  expect(httpRequests).toEqual([]);

  await context.close();
  fs.rmSync(userDataDir, { recursive: true, force: true });
});
