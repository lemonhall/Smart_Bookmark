import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { launchExtensionContext } from './utils/launchExtension';

test('recommends folders by host and creates bookmark on confirm', async () => {
  const { context, extensionId, userDataDir } = await launchExtensionContext();

  const harness = await context.newPage();
  await harness.goto(`chrome-extension://${extensionId}/src/testHarness/harness.html`);

  await harness.evaluate(async () => {
    // @ts-expect-error test harness injected later
    await window.__sbHarness.reset();
    // @ts-expect-error
    const rootId = await window.__sbHarness.getTestRootId();
    // @ts-expect-error
    const aiId = await window.__sbHarness.createFolder(rootId, 'AI工具');
    // @ts-expect-error
    const linuxId = await window.__sbHarness.createFolder(rootId, 'Linux');

    // seed: github.com appears twice in AI工具, once in Linux
    // @ts-expect-error
    await window.__sbHarness.createBookmark(aiId, 'a1', 'https://github.com/nicepkg/aide');
    // @ts-expect-error
    await window.__sbHarness.createBookmark(aiId, 'a2', 'https://github.com/nicepkg/gpt-runner');
    // @ts-expect-error
    await window.__sbHarness.createBookmark(linuxId, 'l1', 'https://github.com/torvalds/linux');
  });

  const popup = await context.newPage();
  const httpRequests: string[] = [];
  popup.on('request', (req) => {
    if (/^https?:/i.test(req.url())) httpRequests.push(req.url());
  });

  await popup.goto(
    `chrome-extension://${extensionId}/popup.html?url=${encodeURIComponent(
      'https://github.com/vuejs/vue'
    )}&title=${encodeURIComponent('Vue')}`
  );

  await expect(popup.getByTestId('page-title-input')).toHaveValue('Vue');
  await expect(popup.getByTestId('recommendation-item').nth(0)).toContainText('AI工具');
  await expect(popup.getByTestId('recommendation-item').nth(1)).toContainText('Linux');

  await popup.getByTestId('confirm-save').click();
  await expect(popup.getByTestId('save-status')).toHaveText('saved');

  const created = await harness.evaluate(async () => {
    // @ts-expect-error
    return await window.__sbHarness.findBookmarksByUrl('https://github.com/vuejs/vue');
  });
  expect(created.length).toBe(1);
  expect(httpRequests).toEqual([]);

  await context.close();
  fs.rmSync(userDataDir, { recursive: true, force: true });
});
