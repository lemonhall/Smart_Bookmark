# Smart Bookmark（MVP）

一个 Chrome Manifest V3 扩展：在收藏页面时，根据 **hostname(host)** 从你现有书签中推断最可能的文件夹（Top 3），让收藏更快。

## v1 包含什么

- 基于 Host 的文件夹推荐（Top 3）
- 标题可编辑、可选文件夹、确认后创建书签
- v1 **零网络请求**（E2E 会断言 popup 期间无 `http(s)` 请求）
- 自动化测试：Vitest + Playwright（真实加载扩展的端到端兜底）

## 开发

- 安装依赖：`npm install`
- 单测（Vitest）：`npm test`
- 端到端（Playwright）：`npm run e2e`
- 构建扩展：`npm run build`（输出到 `dist/`）

## 在 Chrome 里加载（unpacked）

1. `npm run build`
2. 打开 `chrome://extensions`
3. 打开 Developer mode（开发者模式）
4. Load unpacked（加载已解压的扩展）→ 选择 `dist/`

## 快捷键

- 默认：`Ctrl+Shift+Y`（可在 `chrome://extensions/shortcuts` 自己改）

## 目录速览

- Manifest：`public/manifest.json`
- 后台 SW：`src/background.ts`
- Popup（Vue UI）：`src/popup/PopupApp.vue`
- 核心算法：`src/lib/recommendHostFolders.ts`
- E2E Harness（种书签/重置）：`src/testHarness/harness.ts`
- E2E 启动器：`e2e/utils/launchExtension.ts`

## Playwright 浏览器安装（Windows）

如果 E2E 报 “Chromium executable is missing”：
- 运行：`npx playwright install chromium`

如果安装过程卡住 / 没输出，通常是被锁住了，删除锁目录再重试：
- `Remove-Item "$env:LOCALAPPDATA\\ms-playwright\\__dirlock" -Recurse -Force`

如果需要走代理下载（示例）：
- `$env:HTTPS_PROXY='http://127.0.0.1:7897'; $env:HTTP_PROXY='http://127.0.0.1:7897'; $env:NO_PROXY='127.0.0.1,localhost'; npx playwright install chromium`
