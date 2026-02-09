# v3-etld-fallback — eTLD+1 回退 + 推荐展示路径

## Goal

当页面 host 很深（例如 `a.b.example.com`）且精确 host 无命中时，直接回退到“注册域”（eTLD+1，例如 `example.com`）以提升命中率；同时在推荐列表中展示文件夹路径，避免同名歧义。

## PRD Trace

- REQ-010
- REQ-011

## Scope

做：
- 推荐算法：精确 host 无命中 → eTLD+1 回退 → 再无命中则保留现有“一层父域回退”作为兜底
- 推荐 UI：卡片里显示 folder path（`A / B / C`）

不做：
- 多级回退链（`a.b.c` 逐级退到 `a.b` / `b` …），仅做 “精确 → eTLD+1 → 父域一次”

## Acceptance（硬 DoD）

- A1：单测：`a.b.example.com` 命中到 `example.com` 的文件夹（证明 eTLD+1 生效）。
- A2：E2E：推荐卡片包含路径文本（至少对嵌套文件夹可见）。

## Files

- Modify: `src/lib/recommendHostFolders.ts`
- Test: `src/lib/recommendHostFolders.test.ts`
- Modify: `src/popup/PopupApp.vue`
- Test: `e2e/extension-flow.spec.ts`（必要断言）

## Verification

- `npm test`
- `npm run e2e -- e2e/extension-flow.spec.ts`

