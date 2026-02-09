# v5-index — Smart Bookmark（Settings + AI Fallback）

## 愿景链接

- PRD：`docs/prd/smart-bookmark.md`
- 草稿归档：`docs/prd/drafts/init_prd.md`

## 里程碑（Milestones）

| Milestone | Scope | DoD（验证命令） | 状态 |
|---|---|---|---|
| M5 | 设置页 + AI 兜底推荐（可选网络） | `npm test`、`npm run e2e`、`npm run build` | done |

## 计划索引（Plans）

- `docs/plan/v5-options-page.md`
- `docs/plan/v5-ai-fallback.md`
- `docs/plan/v5-e2e-ai.md`

## 追溯矩阵（Traceability Matrix）

| Req ID | Plan | Tests / Commands | Evidence |
|---|---|---|---|
| REQ-015 | v5-options-page | `npm run e2e` | Playwright report |
| REQ-016 | v5-ai-fallback | `npm run e2e` | Playwright report |
| REQ-017 | v5-e2e-ai | `npm run e2e` | request payload assertions |

## 已知差异（Deltas）

- v5 只做 **AI 兜底推荐**，不做 AI “全量替代 Ctrl+D” 或复杂语义索引。
- v5 的 AI 输入只包含“当前页面 + 文件夹候选”，不上传任何已存在书签 URL。

## Evidence（2026-02-09）

- `npm test` ✅
- `npm run e2e` ✅（新增 `e2e/ai-fallback.spec.ts`）
- `npm run build` ✅（生产构建不包含 harness，且包含 `options.html`）
