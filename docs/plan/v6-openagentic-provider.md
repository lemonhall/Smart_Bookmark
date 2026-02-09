# v6-openagentic-provider — 使用 openagentic OpenAI Provider

## Goal

把 AI 兜底推荐的网络调用切换为 `openagentic-sdk-ts` 的 `OpenAIResponsesProvider`（Responses API），减少自实现风险并提升可维护性。

## PRD Trace

- REQ-018

## Acceptance（硬 DoD）

- A1：AI 请求发往 `${baseUrl}/responses`。
- A2：Vitest 覆盖：mock `fetch`，断言 payload 只包含当前 tab url/title + folder candidates（不包含书签 URL 列表）。
- A3：Playwright E2E 覆盖：拦截 `/responses` 返回，UI 展示 AI 推荐并可保存成功。

## Files

- Add: `vendor/openagentic-sdk-ts/**`（最小引入 core + providers-openai）
- Modify: `src/lib/aiRecommendFolders.ts`
- Modify: `src/lib/settings.ts` / `src/options/OptionsApp.vue`
- Modify: `package.json`（deps + build:deps）

## Verification

- `npm test`
- `npm run e2e`
- `npm run build`

