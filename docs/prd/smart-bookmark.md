# Smart Bookmark PRD（可追溯版本）

> 目标：把草稿 `docs/prd/drafts/init_prd.md` 固化为**可追溯、可验证、无歧义**的 PRD。  
> 本 PRD 仅覆盖 v1（MVP：Host 精确匹配 + Popup 一键收藏 + 快捷键触发 + 自动化测试）。

## 0. 愿景（Vision）

让“收藏网页”从「Ctrl+D → 手动找文件夹」变成「触发 → 自动推荐 Top3 → 回车确认」。

## 1. 术语（Glossary）

- **Host**：URL 的 `hostname`（例如 `https://developer.mozilla.org/en-US/docs/Web` 的 host 为 `developer.mozilla.org`）。
- **书签条目**：有 `url` 的 bookmark node。
- **文件夹**：无 `url` 且可包含 children 的 bookmark node。
- **文件夹路径**：从根到目标文件夹的标题拼接（例如 `书签栏 / 技术 / 前端`）。

## 2. 非目标（Non-goals, v1）

- 不做 AI/LLM 语义推荐（Strategy B）与设置页。
- 不做 TF-IDF/Embedding 等本地语义索引。
- 不做“重复书签检测”“死链检测”等维护能力。
- 不追求完全覆盖系统 `Ctrl+D`（Chrome 限制），仅提供可配置的扩展快捷键。

## 3. 约束（Constraints）

- 技术栈：**Vue 3 + Vite + TypeScript**（保持简单可读）。
- Chrome 扩展：Manifest V3。
- 隐私：v1 **零网络请求**，仅本地读写书签。
- 自动化测试：必须包含 unit/integration + Playwright E2E（至少一条端到端兜底路径）。

## 4. 需求（Requirements）

### REQ-001 触发收藏流程（P0）

用户通过以下任一方式触发：
- 点击扩展图标打开 popup
- 使用扩展快捷键（默认 `Ctrl+Shift+Y`）

**验收（Acceptance）**
- A1：打开 popup 时能读取到当前 active tab 的 `url`/`title`。
- A2：快捷键触发后能打开收藏 UI（popup 或等价页面）。

### REQ-002 Host 精确匹配推荐 Top3 文件夹（P0）

当用户收藏页面 `url` 的 host 在现有书签里出现过时：
- 遍历所有书签条目，统计相同 host 的书签分布在哪些文件夹下
- 按该 host 在文件夹内出现的次数降序排序
- 输出 Top3 文件夹作为推荐（不足 3 个则输出实际数量）

**验收（Acceptance）**
- A1：同 host 出现次数多的文件夹排名更靠前。
- A2：无同 host 命中时，推荐列表为空（或展示“无命中”提示）。

### REQ-003 Popup UI（P0）

popup 必须展示：
- 当前页面的标题（可编辑）
- 推荐文件夹 Top3（默认选中第 1 个）
- 手动选择文件夹（从全部文件夹中选择 1 个）
- 确认按钮（或 Enter 快捷确认）

**验收（Acceptance）**
- A1：用户可修改标题后保存。
- A2：用户可切换目标文件夹（推荐/手动均可）。

### REQ-004 创建书签（P0）

用户确认后在目标文件夹创建书签条目：
- `title` 使用用户编辑后的标题
- `url` 使用当前页面 url

**验收（Acceptance）**
- A1：创建成功后给出明确反馈（例如提示“已收藏”并关闭 popup）。
- A2：创建失败时给出可理解错误信息（权限/异常）。

### REQ-005 隐私与本地化（P0）

- 不发送任何网络请求
- 不收集遥测

**验收（Acceptance）**
- A1：E2E/集成测试中不出现网络请求（Playwright 可拦截并断言）。

## 5. DoD（Definition of Done, v1）

必须满足（全部二元判定）：
- D1：`npm test` 全绿（Vitest）。
- D2：`npm run e2e` 全绿（Playwright）。
- D3：`npm run build` 成功产出 `dist/`，可作为 Chrome unpacked extension 加载。
- D4（反作弊）：E2E 需真实加载扩展并走通“种书签 → 打开 popup → 出现推荐 → 点击确认创建书签”的路径（不得只测静态页面）。
