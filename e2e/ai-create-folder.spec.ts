import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { launchExtensionContext } from './utils/launchExtension';

test('AI suggests creating a new folder and saving into it', async () => {
  const { context, extensionId, userDataDir } = await launchExtensionContext();

  const harness = await context.newPage();
  await harness.goto(`chrome-extension://${extensionId}/src/testHarness/harness.html`);

  const ids = await harness.evaluate(async () => {
    // @ts-expect-error test harness injected later
    await window.__sbHarness.reset();
    // @ts-expect-error
    const rootId = await window.__sbHarness.getTestRootId();
    // @ts-expect-error
    const parentId = await window.__sbHarness.createFolder(rootId, '技术');
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
    return { rootId, parentId };
  });

  const newFolderTitle = '__SB_AI_NEW_FOLDER__';

  await context.route('https://api.openai.com/v1/responses', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        output: [
          {
            type: 'message',
            content: [
              {
                type: 'output_text',
                text: JSON.stringify({
                  existingFolderIds: [],
                  create: { parentFolderId: ids.parentId, title: newFolderTitle }
                })
              }
            ]
          }
        ]
      })
    });
  });

  const popup = await context.newPage();
  const targetUrl = 'https://unknown.example.com/docs/ai-create-folder';
  await popup.goto(
    `chrome-extension://${extensionId}/popup.html?url=${encodeURIComponent(targetUrl)}&title=${encodeURIComponent(
      'AI Create Folder'
    )}`
  );

  await expect(popup.getByTestId('ai-create-suggestion')).toContainText(newFolderTitle);
  await popup.getByTestId('ai-create-suggestion').click();

  await popup.keyboard.press('Enter');
  await expect(popup.getByTestId('save-status')).toHaveText('saved');

  const created = await harness.evaluate(
    async ({ parentId, newFolderTitle, targetUrl }) => {
      // @ts-expect-error
      const folder = await window.__sbHarness.findChildFolderByTitle(parentId, newFolderTitle);
      if (!folder) return { folderId: null, bookmarkParentId: null, bookmarks: [] as any[] };
      // @ts-expect-error
      const bookmarks = await window.__sbHarness.findBookmarksByUrl(targetUrl);
      const bookmarkParentId = bookmarks[0]?.parentId ?? null;
      return { folderId: folder.id, bookmarkParentId, bookmarks };
    },
    { parentId: ids.parentId, newFolderTitle, targetUrl }
  );

  expect(created.folderId).toBeTruthy();
  expect(created.bookmarks.length).toBe(1);
  expect(created.bookmarkParentId).toBe(created.folderId);

  await context.close();
  fs.rmSync(userDataDir, { recursive: true, force: true });
});

