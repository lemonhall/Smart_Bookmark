# v7-index — Smart Bookmark（AI Create Folder Suggestion）

## 愿景链接

- PRD：`docs/prd/smart-bookmark.md`

## 里程碑（Milestones）

| Milestone | Scope | DoD（验证命令） | 状态 |
|---|---|---|---|
| M7 | AI 建议新建文件夹并收藏 | `npm test`、`npm run e2e`、`npm run build` | done |

## 计划索引（Plans）

- `docs/plan/v7-ai-create-folder.md`

## 追溯矩阵（Traceability Matrix）

| Req ID | Plan | Tests / Commands | Evidence |
|---|---|---|---|
| REQ-020 | v7-ai-create-folder | `npm run e2e` | Playwright report |

## Evidence（2026-02-09）

- `npm test` ✅
- `npm run e2e` ✅（新增 `e2e/ai-create-folder.spec.ts`）
- `npm run build` ✅（生产构建不包含 harness）
