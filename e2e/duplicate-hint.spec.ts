import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { launchExtensionContext } from './utils/launchExtension';

test('shows duplicate hint when url already bookmarked and still allows saving', async () => {
  const { context, extensionId, userDataDir } = await launchExtensionContext();

  const harness = await context.newPage();
  await harness.goto(`chrome-extension://${extensionId}/src/testHarness/harness.html`);

  const folderId = await harness.evaluate(async () => {
    // @ts-expect-error
    await window.__sbHarness.reset();
    // @ts-expect-error
    const rootId = await window.__sbHarness.getTestRootId();
    // @ts-expect-error
    const parentId = await window.__sbHarness.createFolder(rootId, 'Dup');
    // @ts-expect-error
    return await window.__sbHarness.createFolder(parentId, 'Target');
  });

  await harness.evaluate(
    async (id) => {
      // @ts-expect-error
      await window.__sbHarness.createBookmark(id, 'existing', 'https://example.com/dupe');
    },
    folderId
  );

  const popup = await context.newPage();
  await popup.goto(
    `chrome-extension://${extensionId}/popup.html?url=${encodeURIComponent(
      'https://example.com/dupe'
    )}&title=${encodeURIComponent('Dupe')}`
  );

  await expect(popup.getByTestId('duplicate-warning')).toBeVisible();
  await expect(popup.getByTestId('duplicate-warning')).toContainText('Dup / Target');

  const before = await harness.evaluate(async () => {
    // @ts-expect-error
    return await window.__sbHarness.findBookmarksByUrl('https://example.com/dupe');
  });
  expect(before.length).toBe(1);

  await popup.getByTestId('confirm-save').click();
  await expect(popup.getByTestId('save-status')).toHaveText('saved');

  const after = await harness.evaluate(async () => {
    // @ts-expect-error
    return await window.__sbHarness.findBookmarksByUrl('https://example.com/dupe');
  });
  expect(after.length).toBe(2);

  await context.close();
  fs.rmSync(userDataDir, { recursive: true, force: true });
});

