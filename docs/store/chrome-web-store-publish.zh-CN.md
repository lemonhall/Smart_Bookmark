# Smart Bookmark 上架指引（Chrome Web Store）

> 本文面向“第一次上架”的流程与常见审核点，尽量按 CWS Dashboard 的栏目顺序来写。

## 0. 一句话目标（Single purpose）

Smart Bookmark 的单一目的（建议用于 CWS 的 “Single purpose” 字段）：

- **更快地把当前网页收藏到最合适的书签文件夹**（基于历史 Host + 可选 AI 推荐）

## 1. 上架前自检（强烈建议）

- 本地用生产构建 `dist/` 自测一次（不要用 test harness 版）。
- 跑完自动化：`npm test` + `npm run e2e` + `npm run build`
- 确认 AI 默认关闭（不开启 AI 时 popup 不应产生任何 `http(s)` 网络请求）。
- 确认不存在“远程加载并执行代码”（Remote Hosted Code / RHC）：不要从网络加载 JS/WASM 来执行逻辑（拉取 JSON/图片等数据资源是另一回事，但不能把它当代码跑）。

## 2. 打包 ZIP（用于上传）

Chrome Web Store 上传的是一个 zip，并且 **zip 的根目录必须直接包含 `manifest.json`**（不能多套一层文件夹）。

本项目已提供脚本：

- 生成 zip：`npm run package:zip`
- 产物位置：`artifacts/smart-bookmark.zip`

如果你不想跑 Node，也可以直接用 PowerShell：

```powershell
Compress-Archive -Path dist\* -DestinationPath smart-bookmark.zip -Force
```

## 3. 开发者账号准备

- 注册 Chrome Web Store Developer（需要一次性注册费）。
- 开启 Google 账号两步验证（2-Step Verification），否则无法发布/更新。
- 在 Developer Dashboard 补齐：Publisher 名、联系邮箱验证等。

## 4. 上传与版本号策略

- 在 Developer Dashboard 选择 “Add new item” → 上传 `smart-bookmark.zip`
- 注意：上传后 **很多 manifest 元数据无法在 dashboard 里直接改**；要改通常意味着：
  - 修改 `public/manifest.json`
  - 提升 `version`
  - 重新打 zip 再上传

建议：上架前尽量把 `name / description / icons / permissions` 一次性确认好。

## 5. Listing（商店展示页）素材清单

Dashboard 通常会要求你提供（不同时间可能略有变化，以页面提示为准）：

- Store icon：`128x128`
- Screenshot：至少 1 张，建议 `1280x800`（最多 5 张）
- 小宣传图（Small promo tile）：`440x280`
- Marquee（可能选填，但经常会出现要求项）：`1400x560`
- 视频：YouTube 链接（用于展示功能）

小建议：

- 截图要对应最新版本功能，不要模糊/变形/塞太多字。
- 文案避免关键词堆砌，避免“与功能无关的关键词列表”。

## 6. Privacy practices（审核最容易卡的地方）

### 6.1 Single purpose（单一目的）

把 “0. 一句话目标” 那段粘进去即可，越清晰越好。

### 6.2 Permissions justification（权限逐条说明）

建议按我们 manifest 里的权限逐条写“为什么必要”。可以用下面这份模板改改就交：

- `bookmarks`：读取书签树与创建书签/文件夹，用于推荐与保存。
- `tabs`：读取当前活动标签页的 URL / 标题。
- `activeTab`：在用户触发时访问当前标签页（配合读取页面信息）。
- `storage`：保存设置（TopN、AI 开关、baseUrl、model 等）。
- `scripting`：当用户开启 AI 时，从当前页面采集 meta/OG/canonical/H1 等“页面信号”，用于提升推荐质量（只采集当前页，不抓取其他书签 URL 列表）。

Host 权限相关（很重要）：

- `host_permissions`（默认）：包含 OpenAI/你常用的 baseUrl 域名，用于 AI 请求（仅在用户开启 AI 时使用）。
- `optional_host_permissions`：本项目目前允许用户在 Options 里填不同域名的 baseUrl，因此用了较宽泛的可选权限模式；这类“宽 host 模式”可能增加人工审核时间，需要在 justification 里解释清楚“为什么需要、什么时候会请求授权、默认不启用”。

### 6.3 Data handling（数据处理/隐私政策链接）

Chrome Web Store 对“用户数据收集/使用/共享”会非常敏感，务必做到三点一致：

1) 扩展真实行为  
2) CWS Dashboard 的 privacy 字段  
3) 你的隐私政策文档

本项目隐私政策文件：

- `PRIVACY.zh-CN.md`
- `PRIVACY.md`

核心声明建议保持一致：

- AI 关闭：无网络请求
- AI 开启：仅发送“当前页 URL/标题/页面信号 + 文件夹候选(id/path)”去请求建议；不上传已有书签 URL 列表；不做遥测

## 7. Test instructions（可选，但建议填）

如果你的扩展需要登录/付费账号才能体验核心功能，Test instructions 很关键。

Smart Bookmark 属于“本地可用”，一般无需账号，但仍建议写一句：

- 如何打开：点击扩展图标或快捷键 `Ctrl+Shift+Y`
- 如何验证：打开任意网页 → 点保存 → 在书签栏看到新增条目
- 如何开启 AI（可选）：打开 Options → 启用 AI → 填写 baseUrl/model/apiKey → 点击 “Test LLM connection”

## 8. 提交审核与常见耗时

- 审核时长不固定；新开发者 / 新扩展 / 宽 host 权限 / 强执行权限等，都会更容易触发更长的人工审核。
- 如果 pending 超过很久（例如 3 周），可以联系开发者支持。

## 9. 被拒常见原因（对照自查）

- Listing 不完整（缺 icon/截图/描述等）
- 权限过宽但解释不充分（尤其是广泛 host 权限）
- 隐私政策缺失或与实际行为不一致
- 远程加载并执行代码（RHC）
- “单一目的”不清晰或功能与描述不一致

## 10. 参考（官方文档）

- Chrome Web Store Program Policies：https://developer.chrome.com/docs/webstore/program-policies
- Remote Hosted Code（远程托管代码）政策：https://developer.chrome.com/docs/webstore/remote-hosted-code
- Manifest（字段与限制）：https://developer.chrome.com/docs/extensions/reference/manifest
- 商店展示页素材与要求（Listing）：https://developer.chrome.com/docs/webstore/cws-dashboard-listing
- 隐私实践填写（Privacy practices）：https://developer.chrome.com/docs/webstore/cws-dashboard-privacy
- 评审流程与时长说明（Review process）：https://developer.chrome.com/docs/webstore/review-process
- 测试说明（Test instructions）：https://developer.chrome.com/docs/webstore/cws-dashboard-test-instructions
