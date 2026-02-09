# v9-index — Smart Bookmark（Editable AI Create Folder）

## 愿景链接

- PRD：`docs/prd/smart-bookmark.md`

## 里程碑（Milestones）

| Milestone | Scope | DoD（验证命令） | 状态 |
|---|---|---|---|
| M9 | AI create 建议可编辑（标题/父目录） | `npm test`、`npm run e2e`、`npm run build` | done |

## 计划索引（Plans）

- `docs/plan/v9-ai-create-edit.md`

## 追溯矩阵（Traceability Matrix）

| Req ID | Plan | Tests / Commands | Evidence |
|---|---|---|---|
| REQ-022 | v9-ai-create-edit | `npm run e2e` | Playwright report |

## Evidence（2026-02-09）

- `npm test` ✅
- `npm run e2e` ✅（`e2e/ai-create-folder.spec.ts` 覆盖编辑标题/父目录）
- `npm run build` ✅（dist 已提交）
