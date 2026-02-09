# v10-index — Smart Bookmark（Store Readiness）

## 愿景链接

- PRD：`docs/prd/smart-bookmark.md`

## 里程碑（Milestones）

| Milestone | Scope | DoD（验证命令） | 状态 |
|---|---|---|---|
| M10 | Store readiness（manifest + icons + privacy + packaging） | `npm test`、`npm run e2e`、`npm run build`、`npm run package:zip` | done |

## 计划索引（Plans）

- `docs/plan/v10-store-readiness.md`

## 追溯矩阵（Traceability Matrix）

| Req ID | Plan | Tests / Commands | Evidence |
|---|---|---|---|
| REQ-023 | v10-store-readiness | `npm run build` | `dist/manifest.json` |
| REQ-024 | v10-store-readiness | docs | `PRIVACY.md` / `PRIVACY.zh-CN.md` |
| REQ-025 | v10-store-readiness | `npm run package:zip` | `artifacts/smart-bookmark.zip` |

## Evidence（2026-02-09）

- `npm test` ✅
- `npm run e2e` ✅
- `npm run build` ✅（`dist/manifest.json` 含 icons/description）
- `npm run package:zip` ✅（产出 `artifacts/smart-bookmark.zip`）
