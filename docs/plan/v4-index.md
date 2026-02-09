# v4-index — Smart Bookmark（CI + Build Modes）

## 愿景链接

- PRD：`docs/prd/smart-bookmark.md`

## 里程碑（Milestones）

| Milestone | Scope | DoD（验证命令） | 状态 |
|---|---|---|---|
| M4 | CI + 生产/测试构建分离 | `npm test`、`npm run e2e`、`npm run build` | done |

## 计划索引（Plans）

- `docs/plan/v4-build-modes.md`
- `docs/plan/v4-ci.md`

## 追溯矩阵（Traceability Matrix）

| Req ID | Plan | Tests / Commands | Evidence |
|---|---|---|---|
| REQ-013 | v4-build-modes | `npm run build` / `npm run build:test` | dist contents |
| REQ-014 | v4-ci | GitHub Actions | CI logs |

## Evidence（2026-02-09）

- `npm test` ✅
- `npm run e2e` ✅（自动使用 `npm run build:test`）
- `npm run build` ✅（生产构建不包含 harness）
