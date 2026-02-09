# v3-duplicates-hint — 重复收藏提示（不自动去重）

## Goal

当当前 URL 已经存在于书签中时，在 popup 显示提示（例如“已收藏于 XXX / YYY”），但仍允许用户再次保存（不自动去重）。

## PRD Trace

- REQ-012

## Scope

做：
- `chrome.bookmarks.search({ url })` 检测重复
- UI 提示：显示已存在的目标文件夹路径（可多条，最多展示 N 条）
- 行为：仍可正常保存并创建新书签

不做：
- 自动合并/去重

## Acceptance（硬 DoD）

- A1：E2E：预先种一个相同 url 书签，打开 popup 能看到重复提示。
- A2：E2E：点击/Enter 保存后仍能再创建一条（书签数量 +1）。

## Files

- Modify: `src/popup/PopupApp.vue`
- Test: `e2e/duplicate-hint.spec.ts`

## Verification

- `npm run e2e -- e2e/duplicate-hint.spec.ts`

