import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { launchExtensionContext } from './utils/launchExtension';

test('falls back to eTLD+1 when exact host has no matches', async () => {
  const { context, extensionId, userDataDir } = await launchExtensionContext();

  const harness = await context.newPage();
  await harness.goto(`chrome-extension://${extensionId}/src/testHarness/harness.html`);

  await harness.evaluate(async () => {
    // @ts-expect-error
    await window.__sbHarness.reset();
    // @ts-expect-error
    const rootId = await window.__sbHarness.getTestRootId();
    // @ts-expect-error
    const parentId = await window.__sbHarness.createFolder(rootId, 'Parent');
    // @ts-expect-error
    const folderId = await window.__sbHarness.createFolder(parentId, 'Example');
    // @ts-expect-error
    await window.__sbHarness.createBookmark(folderId, 'welcome', 'https://example.com/welcome');
  });

  const popup = await context.newPage();
  await popup.goto(
    `chrome-extension://${extensionId}/popup.html?url=${encodeURIComponent(
      'https://a.b.example.com/getting-started'
    )}&title=${encodeURIComponent('Getting Started')}`
  );

  await expect(popup.getByTestId('recommendation-item').first()).toContainText('Example');
  await expect(popup.getByTestId('recommendation-item').first()).toContainText('Parent / Example');

  await context.close();
  fs.rmSync(userDataDir, { recursive: true, force: true });
});

