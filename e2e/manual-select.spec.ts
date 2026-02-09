import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { launchExtensionContext } from './utils/launchExtension';

test('allows manual folder selection when no host matches', async () => {
  const { context, extensionId, userDataDir } = await launchExtensionContext();

  const harness = await context.newPage();
  await harness.goto(`chrome-extension://${extensionId}/src/testHarness/harness.html`);
  const miscFolderId = await harness.evaluate(async () => {
    // @ts-expect-error
    await window.__sbHarness.reset();
    // @ts-expect-error
    const rootId = await window.__sbHarness.getTestRootId();
    // @ts-expect-error
    return await window.__sbHarness.createFolder(rootId, 'Misc');
  });

  const popup = await context.newPage();
  const httpRequests: string[] = [];
  popup.on('request', (req) => {
    if (/^https?:/i.test(req.url())) httpRequests.push(req.url());
  });

  await popup.goto(
    `chrome-extension://${extensionId}/popup.html?url=${encodeURIComponent(
      'https://example.com/article'
    )}&title=${encodeURIComponent('Example Article')}`
  );

  await expect(popup.getByTestId('page-title-input')).toHaveValue('Example Article');
  await expect(popup.getByText('No host matches')).toBeVisible();

  await expect(popup.getByTestId('folder-select')).toBeVisible();
  await popup.getByTestId('folder-select').selectOption(miscFolderId);
  await popup.getByTestId('confirm-save').click();
  await expect(popup.getByTestId('save-status')).toHaveText('saved');

  const created = await harness.evaluate(async () => {
    // @ts-expect-error
    return await window.__sbHarness.findBookmarksByUrl('https://example.com/article');
  });
  expect(created.length).toBe(1);
  expect(httpRequests).toEqual([]);

  await context.close();
  fs.rmSync(userDataDir, { recursive: true, force: true });
});
