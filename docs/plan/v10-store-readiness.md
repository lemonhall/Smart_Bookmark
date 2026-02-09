# v10-store-readiness — Store Readiness（Manifest / Privacy / Packaging）

## Goal

为上架/发布做准备：补齐 manifest 元数据与图标，补齐隐私政策（中英文），并提供打包 zip 的脚本/说明（普通用户无需安装 Node 也能安装）。

## PRD Trace

- REQ-023
- REQ-024
- REQ-025

## Acceptance（硬 DoD）

- A1：`dist/manifest.json` 包含 `description`、`icons`、`action.default_icon`，并能在 `chrome://extensions` 显示自定义图标。
- A2：仓库存在 `PRIVACY.md` 与 `PRIVACY.zh-CN.md`，并明确 AI 开关前后网络/数据字段差异（不开 AI：零网络；开 AI：仅发送当前页面信息 + 文件夹候选，不上传已有书签 URL 列表，不做遥测）。
- A3：README（中英文）包含：
  - 直接用仓库内 `dist/` 安装的步骤（无需 Node）
  - 生成上架用 zip 的步骤/脚本（例如 `dist/` 打包）

## Files

- Modify: `public/manifest.json`
- Add: `public/icons/icon16.png`
- Add: `public/icons/icon48.png`
- Add: `public/icons/icon128.png`
- Add: `PRIVACY.md`
- Add: `PRIVACY.zh-CN.md`
- Add: `scripts/package.ps1`
- Modify: `package.json`
- Modify: `README.md`
- Modify: `README.zh-CN.md`

## Verification

- `npm test`
- `npm run e2e`
- `npm run build`
- `npm run package:zip`（产出 `artifacts/smart-bookmark.zip`）

