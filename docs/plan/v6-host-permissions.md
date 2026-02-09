# v6-host-permissions — OpenAI Host 权限

## Goal

为默认 OpenAI baseUrl 增加 host permissions，确保 popup 能在开启 AI 时发起请求。

## PRD Trace

- REQ-019

## Acceptance（硬 DoD）

- A1：`public/manifest.json` 增加 `host_permissions: ["https://api.openai.com/*"]`。

## Verification

- `npm run build` 后检查 `dist/manifest.json` 包含对应 host 权限。

