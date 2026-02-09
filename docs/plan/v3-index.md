# v3-index — Smart Bookmark（Smarter Matching + Duplicate Hint）

## 愿景链接

- PRD：`docs/prd/smart-bookmark.md`

## 里程碑（Milestones）

| Milestone | Scope | DoD（验证命令） | 状态 |
|---|---|---|---|
| M3 | eTLD+1 回退 + 推荐展示路径 + 重复收藏提示 | `npm test`、`npm run e2e`、`npm run build` | done |

## 计划索引（Plans）

- `docs/plan/v3-etld-fallback.md`
- `docs/plan/v3-duplicates-hint.md`

## 追溯矩阵（Traceability Matrix）

| Req ID | Plan | Tests / Commands | Evidence |
|---|---|---|---|
| REQ-010 | v3-etld-fallback | `npm test` | Vitest output |
| REQ-011 | v3-etld-fallback | `npm run e2e` | Playwright report |
| REQ-012 | v3-duplicates-hint | `npm run e2e` | Playwright report |

## Evidence（2026-02-09）

- `npm test` ✅
- `npm run e2e` ✅
- `npm run build` ✅
