# v8-index — Smart Bookmark（Page Signals for AI）

## 愿景链接

- PRD：`docs/prd/smart-bookmark.md`

## 里程碑（Milestones）

| Milestone | Scope | DoD（验证命令） | 状态 |
|---|---|---|---|
| M8 | 采集页面 Meta/OG/H1 并喂给 AI | `npm test`、`npm run e2e`、`npm run build` | done |

## 计划索引（Plans）

- `docs/plan/v8-page-signals.md`

## 追溯矩阵（Traceability Matrix）

| Req ID | Plan | Tests / Commands | Evidence |
|---|---|---|---|
| REQ-021 | v8-page-signals | `npm test` | request body assertions |

## Evidence（2026-02-09）

- `npm test` ✅（断言 payload 含 page.signals 且不含书签 URL 列表）
- `npm run e2e` ✅
- `npm run build` ✅（生产构建不包含 harness；`dist/manifest.json` 含 `scripting` 权限）
