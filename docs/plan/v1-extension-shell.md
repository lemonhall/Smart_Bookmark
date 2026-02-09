# v1-extension-shell — 扩展骨架与 Popup（Vue）

## Goal

搭建可构建的 MV3 扩展骨架：Vue popup + background service worker + 权限与命令配置，并提供最小可用的“触发 → 打开 UI”路径。

## PRD Trace

- REQ-001
- REQ-003

## Scope

做：
- Vite + Vue 3 + TS 工程化（可 build 出稳定文件名的 `dist/`）
- MV3 `manifest.json`（bookmarks/tabs/activeTab/commands 等必要权限）
- popup：显示当前 tab 信息 + 基础交互骨架（按钮、占位推荐列表）
- background：接收 popup 消息、处理 command 触发

不做：
- Host 推荐算法（在 `v1-host-recommendation` 里做）

## Acceptance（硬 DoD）

- A1：`npm run build` 成功，生成 `dist/manifest.json` 且引用的 `popup.html`/`background.js` 都存在。
- A2：Playwright（扩展模式）能加载 `dist/`，并能打开 popup 页面（见 `v1-e2e-playwright`）。

## Files

- Create: `package.json`
- Create: `vite.config.ts`
- Create: `popup.html`
- Create: `src/popup/main.ts`
- Create: `src/popup/PopupApp.vue`
- Create: `src/background.ts`
- Create: `public/manifest.json`

## Steps（TDD / Evidence First）

1) 先创建工程与依赖（配置类文件允许先行）
2) 写 Playwright 端到端测试：加载扩展并能打开 popup（红）
3) 实现最小骨架让测试绿

## Verification

- `npm run build`
- `npm run e2e -- --project=chromium-extension`

