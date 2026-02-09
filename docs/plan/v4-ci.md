# v4-ci — GitHub Actions CI

## Goal

在 GitHub Actions 上自动运行 `npm test` 和扩展 E2E（Playwright + Xvfb）。

## PRD Trace

- REQ-014

## Acceptance（硬 DoD）

- A1：push 到仓库时 CI 自动运行（workflow 可见）。
- A2：CI 中执行：`npm test`、`npm run e2e`（使用 Xvfb）并成功通过。

## Files

- Create: `.github/workflows/ci.yml`

## Verification

- 观察 GitHub Actions 运行日志（需仓库端验证）。

