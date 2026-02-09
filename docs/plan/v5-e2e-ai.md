# v5-e2e-ai — Playwright 端到端兜底（AI）

## Goal

新增一条 Playwright E2E 覆盖 AI 兜底推荐路径，并断言：
- AI 默认关闭时无网络请求
- AI 开启时会发起一次可拦截的请求，且 payload 不包含书签 URL

## PRD Trace

- REQ-016
- REQ-017

## Acceptance（硬 DoD）

- A1：新增 E2E：种下“没有 host 命中”的环境 → 开启 AI → popup 展示 AI 推荐 → 保存成功。
- A2：E2E 拦截 AI endpoint 请求并断言 request body 不包含 `https://`（除当前 tab url）。

## Files

- Modify: `src/testHarness/harness.ts`（增加 storage 操作，便于 E2E 写入 settings）
- Add: `e2e/ai-fallback.spec.ts`

## Verification

- `npm run e2e`

