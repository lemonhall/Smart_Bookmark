# v1-host-recommendation — Host 精确匹配 + 创建书签

## Goal

实现 Host 精确匹配推荐 Top3 + popup 确认创建书签，并用 Vitest + Playwright 做回归兜底。

## PRD Trace

- REQ-002
- REQ-004

## Scope

做：
- 纯函数实现 host 推荐（可单测）
- popup 调用推荐并渲染 Top3
- 用户选择目标文件夹并创建书签

不做：
- AI/TF-IDF 等语义策略

## Acceptance（硬 DoD）

- A1：Vitest 覆盖：同 host 计数排序与 Top3 输出（`npm test` 全绿）。
- A2：Playwright 覆盖：在干净 profile 下，扩展可通过内部 harness 种书签与文件夹，然后打开 popup 看到推荐，点击确认后书签数量+1（`npm run e2e` 全绿）。

## Files

- Create: `src/lib/recommendHostFolders.ts`
- Test: `src/lib/recommendHostFolders.test.ts`
- Modify: `src/popup/PopupApp.vue`
- Modify: `src/background.ts`
- Create: `src/testHarness/harness.html`
- Create: `src/testHarness/harness.ts`
- Test: `e2e/extension-flow.spec.ts`

## Steps（严格红→绿→重构）

1) 写 `recommendHostFolders` 的失败单测并跑到红
2) 最小实现跑到绿
3) 写 E2E：用 harness 种数据 + 打开 popup 验证推荐 + 确认创建（红）
4) 实现 popup/background/harness 跑到绿

## Verification

- `npm test`
- `npm run e2e`

