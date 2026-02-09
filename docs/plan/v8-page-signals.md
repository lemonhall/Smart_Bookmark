# v8-page-signals — 采集页面 Meta/OG/Canonical/H1

## Goal

在 AI 开启时，从当前 active tab 采集页面信号（meta/OG/canonical/H1），并把这些信号加入 AI 请求 payload，提升推荐质量。

## PRD Trace

- REQ-021

## Acceptance（硬 DoD）

- A1：manifest 增加 `scripting` 权限后，popup 能通过 `chrome.scripting.executeScript` 获取页面信号。
- A2：`recommendAiSuggestions` 的请求 payload 中包含 signals 字段（若缺失则为空/省略），且不包含任何已存在书签 URL 列表。
- A3：`npm test` 覆盖：mock fetch，断言 request body 包含 signals（description/og/canonical/h1）并包含当前 url。

## Implementation Notes

- 只在“真实 popup（非 E2E query override）且 AI 开启”时执行注入，避免影响现有 E2E。
- 为避免 payload 过大：对每个文本字段做 trim + 截断（例如 500 chars）。

## Files

- Modify: `public/manifest.json`
- Add: `src/lib/pageSignals.ts`
- Modify: `src/popup/PopupApp.vue`
- Modify: `src/lib/aiRecommendFolders.ts` + tests

## Verification

- `npm test`
- `npm run e2e`
- `npm run build`

