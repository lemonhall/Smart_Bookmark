# v4-build-modes — 生产/测试构建分离

## Goal

生产构建不包含 E2E harness（`src/testHarness/**`），而 E2E 运行时用测试构建包含 harness，避免把测试页面带进发布包。

## PRD Trace

- REQ-013

## Acceptance（硬 DoD）

- A1：`npm run build` 产物 `dist/` 中不包含 `dist/src/testHarness/harness.html`。
- A2：`npm run build:test` 产物 `dist/` 中包含 `dist/src/testHarness/harness.html`（E2E 可用）。
- A3：`npm run e2e` 使用测试构建并全绿。

## Files

- Modify: `vite.config.ts`
- Modify: `package.json`

## Verification

- `npm run build`（再 `Test-Path dist\\src\\testHarness\\harness.html` 应为 False）
- `npm run build:test`（再 `Test-Path dist\\src\\testHarness\\harness.html` 应为 True）
- `npm run e2e`

