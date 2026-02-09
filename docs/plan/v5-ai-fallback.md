# v5-ai-fallback — Strategy B：AI 语义兜底推荐

## Goal

当 Host/eTLD+1 等规则推荐为空时，使用用户配置的 OpenAI-compatible endpoint 获取 Top N 文件夹 id 作为推荐，并在 UI 中标注来源为 AI。

## PRD Trace

- REQ-016
- REQ-017

## Acceptance（硬 DoD）

- A1：当 Host 推荐为空、AI 开启且配置完整时，popup 展示 AI 推荐 Top N。
- A2：AI 失败不阻塞：依旧可以手动选择任意文件夹保存成功。
- A3：AI 请求 payload 不包含任何“已存在书签 URL 列表”（只允许当前 tab url/title + folder candidates）。

## Implementation Notes

- 仅在 `recommendations.length === 0` 时触发 AI（兜底策略）。
- prompt 要求模型返回严格 JSON：`{ "folderIds": ["..."] }`，并做健壮解析。
- 只把 `allFolders` 的 `{ id, path }` 作为候选输入（不上传任何 bookmark 条目 URL）。

## Files

- Add: `src/lib/aiRecommendFolders.ts`
- Modify: `src/popup/PopupApp.vue`

## Verification

- `npm test`
- `npm run e2e`
