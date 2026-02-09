# v2-recommendation-fallback — Host 回退推荐

## Goal

当页面 host 没有精确命中时，尝试一次“父域回退”（去掉最左侧子域），提升推荐命中率，同时保持纯本地与可单测。

## PRD Trace

- REQ-006

## Scope

做：
- `recommendHostFolders()` 支持：精确命中为 0 时，回退一次父域再尝试

不做：
- PSL（Public Suffix List）级别的严谨 eTLD+1 计算（后续再迭代）

## Acceptance（硬 DoD）

- A1：当 `docs.example.com` 无命中但 `example.com` 有命中时，能推荐到对应文件夹（Vitest 覆盖）。
- A2：现有 v1 行为不回退时仍保持一致（已有测试全绿）。

## Files

- Modify: `src/lib/recommendHostFolders.ts`
- Test: `src/lib/recommendHostFolders.test.ts`

## Verification

- `npm test`

