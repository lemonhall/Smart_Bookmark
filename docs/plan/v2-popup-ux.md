# v2-popup-ux — Popup 交互与可用性

## Goal

提升收藏确认的速度与可用性：键盘操作、文件夹路径展示（避免同名混淆）、Host 无命中时默认选择“最近使用文件夹”。

## PRD Trace

- REQ-007
- REQ-008
- REQ-009

## Scope

做：
- Enter 触发保存、Esc 关闭
- 下拉框展示“文件夹路径”（`A / B / C`），推荐列表也可展示路径/或可区分信息
- 记录最近使用文件夹（`chrome.storage.local`），Host 无命中时优先选中最近文件夹（若仍存在）

不做：
- 设置页（手动管理/清除最近文件夹等）

## Acceptance（硬 DoD）

- A1：E2E：打开 popup 后按 Enter 能完成保存（不依赖鼠标点击）。
- A2：E2E：Host 无命中时仍可通过下拉选择文件夹并保存（已有用例保持全绿）。
- A3（反作弊）：E2E 必须真实加载扩展并创建书签（不得只测静态页面）。

## Files

- Modify: `src/popup/PopupApp.vue`
- Modify: `src/testHarness/harness.ts`（如需要辅助设置/读取 storage）
- Test: `e2e/extension-flow.spec.ts`
- Test: `e2e/manual-select.spec.ts`

## Verification

- `npm run e2e`

