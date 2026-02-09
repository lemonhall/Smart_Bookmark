import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { launchExtensionContext } from './utils/launchExtension';

test('uses AI fallback when no host matches (and does not upload bookmark URLs)', async () => {
  const { context, extensionId, userDataDir } = await launchExtensionContext();

  const harness = await context.newPage();
  await harness.goto(`chrome-extension://${extensionId}/src/testHarness/harness.html`);

  const ids = await harness.evaluate(async () => {
    // @ts-expect-error test harness injected later
    await window.__sbHarness.reset();
    // @ts-expect-error
    const rootId = await window.__sbHarness.getTestRootId();
    // @ts-expect-error
    const feId = await window.__sbHarness.createFolder(rootId, '前端');
    // @ts-expect-error
    const linuxId = await window.__sbHarness.createFolder(rootId, 'Linux');
    // seed a bookmark URL that must NOT appear in the AI request payload
    // @ts-expect-error
    await window.__sbHarness.createBookmark(linuxId, 'secret', 'https://secret.example.com/private');
    // enable AI + config
    // @ts-expect-error
    await window.__sbHarness.setLocalStorage({
      sbSettings: {
        topN: 3,
        closeOnSave: true,
        ai: {
          enabled: true,
          baseUrl: 'https://api.openai.com/v1',
          model: 'gpt-4o-mini',
          apiKey: 'sk-test'
        }
      }
    });
    return { feId };
  });

  let capturedBody = '';
  await context.route('https://api.openai.com/v1/responses', async (route, request) => {
    capturedBody = request.postData() ?? '';
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        output: [
          {
            type: 'message',
            content: [{ type: 'output_text', text: JSON.stringify({ folderIds: [ids.feId] }) }]
          }
        ]
      })
    });
  });

  const popup = await context.newPage();
  await popup.goto(
    `chrome-extension://${extensionId}/popup.html?url=${encodeURIComponent(
      'https://unknown.example.com/docs/vue'
    )}&title=${encodeURIComponent('Vue Composition API')}`
  );

  await expect(popup.getByTestId('recommendation-item').nth(0)).toContainText('前端');

  expect(capturedBody).toContain('https://unknown.example.com/docs/vue');
  expect(capturedBody).not.toContain('https://secret.example.com/private');

  await popup.keyboard.press('Enter');
  await expect(popup.getByTestId('save-status')).toHaveText('saved');

  const created = await harness.evaluate(async () => {
    // @ts-expect-error
    return await window.__sbHarness.findBookmarksByUrl('https://unknown.example.com/docs/vue');
  });
  expect(created.length).toBe(1);

  await context.close();
  fs.rmSync(userDataDir, { recursive: true, force: true });
});
