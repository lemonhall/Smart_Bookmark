# v5-options-page — 扩展设置页（Options）

## Goal

提供 Chrome 扩展设置页（`options_page`），用于配置推荐数量、保存行为，以及 AI 兜底推荐的开关与连接参数。

## PRD Trace

- REQ-015

## Acceptance（硬 DoD）

- A1：`options.html` 能打开并显示默认设置（首次安装/无存量配置）。
- A2：保存设置后，popup 读取并生效（例如 Top N 改为 1 → popup 只展示 1 条推荐）。
- A3：AI 默认关闭时，既有 E2E（无 `http(s)` 请求断言）仍全绿。

## Implementation Notes

- 使用 `chrome.storage.local` 持久化一个 `sbSettings` 对象。
- popup 启动时加载 settings，用于：
  - Top N
  - 保存后是否自动关闭
  - 是否启用 AI 兜底

## Files

- Modify: `public/manifest.json`
- Add: `options.html`
- Add: `src/options/main.ts`
- Add: `src/options/OptionsApp.vue`
- Add: `src/lib/settings.ts`
- Modify: `vite.config.ts`

## Verification

- `npm test`
- `npm run e2e`
- `npm run build`
