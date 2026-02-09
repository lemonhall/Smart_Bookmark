# v6-index — Smart Bookmark（Adopt openagentic-sdk-ts）

## 愿景链接

- PRD：`docs/prd/smart-bookmark.md`

## 里程碑（Milestones）

| Milestone | Scope | DoD（验证命令） | 状态 |
|---|---|---|---|
| M6 | 用 openagentic provider 实现 AI 调用 + host 权限 | `npm test`、`npm run e2e`、`npm run build` | done |

## 计划索引（Plans）

- `docs/plan/v6-openagentic-provider.md`
- `docs/plan/v6-host-permissions.md`

## 追溯矩阵（Traceability Matrix）

| Req ID | Plan | Tests / Commands | Evidence |
|---|---|---|---|
| REQ-018 | v6-openagentic-provider | `npm test` + `npm run e2e` | Vitest/Playwright report |
| REQ-019 | v6-host-permissions | `npm run build` | dist/manifest.json |

## Evidence（2026-02-09）

- `npm test` ✅
- `npm run e2e` ✅（拦截 `/v1/responses`）
- `npm run build` ✅（`dist/src/testHarness/harness.html` 不存在；`dist/manifest.json` 含 host 权限）
