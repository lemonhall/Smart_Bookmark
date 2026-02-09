# v1-e2e-playwright — 扩展 E2E 测试基建（Playwright）

## Goal

用 Playwright 提供可重复的扩展端到端测试：构建 `dist/` → 加载 unpacked extension → 运行测试用例。

## PRD Trace

- REQ-005（网络断言/兜底）
- 支撑 REQ-001/003/004 的证据链

## Scope

做：
- Playwright config：`chromium.launchPersistentContext` 加载扩展
- 测试：禁止外网请求（除目标页面本身可控）
- 产物：可在本机一键跑通

不做：
- CI 集成（后续再加）

## Acceptance（硬 DoD）

- A1：`npm run e2e` 可重复执行并产出 Playwright report。
- A2：测试用例中对网络请求进行断言（至少对“扩展自身不发网请求”做拦截校验）。

## Files

- Create: `playwright.config.ts`
- Create: `e2e/utils/launchExtension.ts`
- Create: `e2e/extension-smoke.spec.ts`

## Verification

- `npm run build`
- `npm run e2e`

## Notes（Windows）

- 如果 `npx playwright install chromium` 卡住/无输出，先检查并删除可能残留的锁目录：`$env:LOCALAPPDATA\\ms-playwright\\__dirlock`，再重试。
- 如需走本机代理（例如 `7897`），PowerShell 可用：
  - `$env:HTTPS_PROXY='http://127.0.0.1:7897'; $env:HTTP_PROXY='http://127.0.0.1:7897'; $env:NO_PROXY='127.0.0.1,localhost'; npx playwright install chromium`
