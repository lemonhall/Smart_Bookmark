# v1-index — Smart Bookmark（MVP）

## 愿景链接

- PRD：`docs/prd/smart-bookmark.md`
- 草稿归档：`docs/prd/drafts/init_prd.md`

## 里程碑（Milestones）

| Milestone | Scope | DoD（验证命令） | 状态 |
|---|---|---|---|
| M1 | 扩展骨架 + popup UI + Host 推荐 + 创建书签 | `npm test`、`npm run e2e`、`npm run build` | done |

## 计划索引（Plans）

- `docs/plan/v1-extension-shell.md`
- `docs/plan/v1-host-recommendation.md`
- `docs/plan/v1-e2e-playwright.md`

## 追溯矩阵（Traceability Matrix）

| Req ID | Plan | Tests / Commands | Evidence |
|---|---|---|---|
| REQ-001 | v1-extension-shell | `npm run e2e` | Playwright report |
| REQ-002 | v1-host-recommendation | `npm test` | Vitest output |
| REQ-003 | v1-extension-shell | `npm run e2e` | Playwright report |
| REQ-004 | v1-host-recommendation | `npm run e2e` | Playwright report |
| REQ-005 | v1-e2e-playwright | `npm run e2e` | Network assertions |

## 已知差异（Deltas）

- v1 不包含 Strategy B（AI 语义推荐）与设置页（PRD 非目标）。

## Evidence（2026-02-09）

- `npm test` ✅
- `npm run e2e` ✅（含：推荐 + 手动选择 + “无 http/https 请求”断言）
- `npm run build` ✅

## Push 状态

- 说明：当前目录尚未初始化 git 远程；当进入 Ship 阶段会尝试 `git init`/commit，并在失败时记录原因。
