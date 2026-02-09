import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { launchExtensionContext } from './utils/launchExtension';

test('shows AI suggestions even when host matches (when enabled)', async () => {
  const { context, extensionId, userDataDir } = await launchExtensionContext();

  const harness = await context.newPage();
  await harness.goto(`chrome-extension://${extensionId}/src/testHarness/harness.html`);

  const ids = await harness.evaluate(async () => {
    // @ts-expect-error test harness injected later
    await window.__sbHarness.reset();
    // @ts-expect-error
    const rootId = await window.__sbHarness.getTestRootId();
    // @ts-expect-error
    const aiToolsId = await window.__sbHarness.createFolder(rootId, 'AI工具');
    // @ts-expect-error
    const linuxId = await window.__sbHarness.createFolder(rootId, 'Linux');

    // Seed host matches for github.com so Host Matches section has content
    // @ts-expect-error
    await window.__sbHarness.createBookmark(aiToolsId, 'a1', 'https://github.com/nicepkg/aide');
    // @ts-expect-error
    await window.__sbHarness.createBookmark(aiToolsId, 'a2', 'https://github.com/nicepkg/gpt-runner');

    // @ts-expect-error
    await window.__sbHarness.setLocalStorage({
      sbSettings: {
        topN: 3,
        closeOnSave: true,
        ai: {
          enabled: true,
          alwaysSuggest: true,
          baseUrl: 'https://api.openai.com/v1',
          model: 'gpt-5.2',
          apiKey: 'sk-test'
        }
      }
    });

    return { linuxId };
  });

  await context.route('https://api.openai.com/v1/responses', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        output: [
          {
            type: 'message',
            content: [{ type: 'output_text', text: JSON.stringify({ folderIds: [ids.linuxId] }) }]
          }
        ]
      })
    });
  });

  const popup = await context.newPage();
  await popup.goto(
    `chrome-extension://${extensionId}/popup.html?url=${encodeURIComponent(
      'https://github.com/vuejs/vue'
    )}&title=${encodeURIComponent('Vue')}`
  );

  await expect(popup.getByTestId('recommendation-item').nth(0)).toContainText('AI工具');
  await expect(popup.getByTestId('ai-recommendation-item').nth(0)).toContainText('Linux');

  // Choose AI suggestion and save
  await popup.getByTestId('ai-recommendation-item').nth(0).click();
  await popup.keyboard.press('Enter');
  await expect(popup.getByTestId('save-status')).toHaveText('saved');

  const created = await harness.evaluate(async () => {
    // @ts-expect-error
    return await window.__sbHarness.findBookmarksByUrl('https://github.com/vuejs/vue');
  });
  expect(created.length).toBe(1);

  await context.close();
  fs.rmSync(userDataDir, { recursive: true, force: true });
});

