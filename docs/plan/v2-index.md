# v2-index — Smart Bookmark（Quality + UX）

## 愿景链接

- PRD：`docs/prd/smart-bookmark.md`

## 里程碑（Milestones）

| Milestone | Scope | DoD（验证命令） | 状态 |
|---|---|---|---|
| M2 | Host 回退 + 快捷键 + 路径展示 + 最近文件夹 | `npm test`、`npm run e2e`、`npm run build` | done |

## 计划索引（Plans）

- `docs/plan/v2-recommendation-fallback.md`
- `docs/plan/v2-popup-ux.md`

## 追溯矩阵（Traceability Matrix）

| Req ID | Plan | Tests / Commands | Evidence |
|---|---|---|---|
| REQ-006 | v2-recommendation-fallback | `npm test` | Vitest output |
| REQ-007 | v2-popup-ux | `npm run e2e` | Playwright report |
| REQ-008 | v2-popup-ux | `npm run e2e` | Playwright report |
| REQ-009 | v2-popup-ux | `npm run e2e` | Playwright report |

## Evidence（2026-02-09）

- `npm test` ✅
- `npm run e2e` ✅
- `npm run build` ✅
