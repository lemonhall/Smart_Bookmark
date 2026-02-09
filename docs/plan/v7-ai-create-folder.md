# v7-ai-create-folder — AI 建议新建文件夹并收藏

## Goal

在 AI 推荐中新增“新建文件夹”建议类型，用户一键创建文件夹并把当前页面收藏进去。

## PRD Trace

- REQ-020

## Acceptance（硬 DoD）

- A1：AI 响应包含 `create` 建议时，popup 展示可选卡片（展示 folder title + parent path）。
- A2：选中后保存：在 `parentFolderId` 下新建文件夹，并在新文件夹下创建当前页面书签。
- A3：E2E 覆盖：拦截 AI `/responses` 返回 `create`，断言新文件夹与书签均创建成功。

## Implementation Notes

- AI 输出 schema（JSON only）：
  - `existingFolderIds: string[]`
  - `create?: { parentFolderId: string; title: string } | null`
- `create.parentFolderId` 必须来自候选 folders 的 id；否则忽略该建议。
- 只做“建议 + 用户确认”，不得自动创建文件夹。

## Files

- Modify: `src/lib/aiRecommendFolders.ts`
- Modify: `src/popup/PopupApp.vue`
- Modify: `src/testHarness/harness.ts`（为 E2E 增加 folder 查询能力）
- Add: `e2e/ai-create-folder.spec.ts`

## Verification

- `npm test`
- `npm run e2e`
- `npm run build`

