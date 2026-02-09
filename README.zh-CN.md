# Smart Bookmark

一个 Chrome Manifest V3 扩展：在收藏页面时，根据现有书签推断最可能的文件夹（Top N），让收藏更快。

## 功能概览

- 基于 Host 的文件夹推荐（Top N）
- 可选的 AI 兜底推荐（默认关闭；使用 OpenAI Responses API）
- 设置页（Options）用于配置行为与 AI
- 标题可编辑、可选文件夹、确认后创建书签
- AI 默认关闭 → popup **零网络请求**（E2E 会断言无 `http(s)` 请求）
- 自动化测试：Vitest + Playwright（真实加载扩展的端到端兜底）

## 开发

- 安装依赖：`npm install`
- 单测（Vitest）：`npm test`
- 端到端（Playwright）：`npm run e2e`
- 构建扩展：`npm run build`（输出到 `dist/`）
- 测试构建（E2E 用，包含 harness）：`npm run build:test`（输出到 `dist/`）

## 在 Chrome 里加载（unpacked）

1. `npm run build`
2. 打开 `chrome://extensions`
3. 打开 Developer mode（开发者模式）
4. Load unpacked（加载已解压的扩展）→ 选择 `dist/`

## 快捷键

- 默认：`Ctrl+Shift+Y`（可在 `chrome://extensions/shortcuts` 自己改）

## 设置页（Options）

- 打开扩展设置页可配置 Top N / 保存后是否自动关闭 / AI 兜底推荐。

## 目录速览

- Manifest：`public/manifest.json`
- 后台 SW：`src/background.ts`
- Popup（Vue UI）：`src/popup/PopupApp.vue`
- Options（Vue UI）：`src/options/OptionsApp.vue`
- 核心算法：`src/lib/recommendHostFolders.ts`
- AI 兜底：`src/lib/aiRecommendFolders.ts`
- OpenAI Provider（从 `lemonhall/openagentic-sdk-ts` vendor 引入）：`vendor/openagentic-sdk-ts/`
- E2E Harness（种书签/重置）：`src/testHarness/harness.ts`
- E2E 启动器：`e2e/utils/launchExtension.ts`
- CI：`.github/workflows/ci.yml`

## Playwright 浏览器安装（Windows）

如果 E2E 报 “Chromium executable is missing”：
- 运行：`npx playwright install chromium`

如果安装过程卡住 / 没输出，通常是被锁住了，删除锁目录再重试：
- `Remove-Item "$env:LOCALAPPDATA\\ms-playwright\\__dirlock" -Recurse -Force`

如果需要走代理下载（示例）：
- `$env:HTTPS_PROXY='http://127.0.0.1:7897'; $env:HTTP_PROXY='http://127.0.0.1:7897'; $env:NO_PROXY='127.0.0.1,localhost'; npx playwright install chromium`
