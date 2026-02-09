# v9-ai-create-edit — 可微调新建文件夹建议

## Goal

当 AI 给出 create 建议时，允许用户在保存前编辑新建文件夹标题与父目录；点击保存后自动创建并收藏。

## PRD Trace

- REQ-022

## Acceptance（硬 DoD）

- A1：选中 create 建议后，popup 展示“Folder name / Parent folder”编辑控件（带 data-testid）并可修改。
- A2：保存后新建文件夹出现在选择的父目录下，且书签位于新建文件夹内。
- A3：E2E 覆盖：mock create 建议 → 修改标题/父目录 → 保存成功并断言结构正确。

## Files

- Modify: `src/popup/PopupApp.vue`
- Modify: `e2e/ai-create-folder.spec.ts`

## Verification

- `npm test`
- `npm run e2e`
- `npm run build`

