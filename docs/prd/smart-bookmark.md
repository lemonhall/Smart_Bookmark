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

## 6. v2 增量需求（Quality + UX）

### REQ-006 Host 父域回退（P1）

当精确 host 无命中时，尝试一次父域回退（例如 `docs.example.com` → `example.com`）再进行 Host 推荐。

**验收（Acceptance）**
- A1：回退后若存在命中，推荐列表非空且排名逻辑同 REQ-002。

### REQ-007 键盘操作（P1）

- Enter：当可保存时触发保存
- Esc：关闭 popup

**验收（Acceptance）**
- A1：E2E 覆盖 Enter 保存成功路径。

### REQ-008 文件夹路径展示（P1）

在下拉框中展示“文件夹路径”（`A / B / C`），避免同名文件夹歧义。

**验收（Acceptance）**
- A1：当存在嵌套文件夹时，UI 展示包含分隔符的路径字符串。

### REQ-009 最近使用文件夹（P1）

保存成功后把目标文件夹 id 记为“最近使用”；当 Host 无命中时，若最近文件夹仍存在则默认选中它。

**验收（Acceptance）**
- A1：E2E 覆盖：一次保存后，再打开一个无 host 命中的页面，默认选中最近文件夹（若仍存在）。

## 7. v3 增量需求（Smarter Matching + Duplicate Hint）

### REQ-010 eTLD+1 回退（P1）

当精确 host 无命中时，计算 eTLD+1（注册域，例如 `a.b.example.com` → `example.com`）并用其再尝试一次 Host 推荐；若仍无命中再保留“一层父域回退”兜底。

**验收（Acceptance）**
- A1：单测覆盖：`a.b.example.com` 能命中到 `example.com` 的书签文件夹。

### REQ-011 推荐列表展示文件夹路径（P1）

推荐卡片需要能区分同名文件夹，至少展示文件夹路径（`A / B / C`）或等价信息。

**验收（Acceptance）**
- A1：E2E 覆盖：嵌套文件夹路径在推荐列表中可见。

### REQ-012 重复收藏提示（P1）

当当前 URL 已经存在于书签中时，popup 显示提示“已收藏于 …”，但不自动去重，仍允许用户再次保存。

**验收（Acceptance）**
- A1：E2E 覆盖：存在重复时能看到提示。
- A2：E2E 覆盖：仍可保存并创建新书签。

## 8. v4 增量需求（CI + Build Modes）

### REQ-013 生产构建不包含测试 Harness（P1）

发布用的 `npm run build` 产物不得包含 E2E 测试 harness 页面/脚本（`src/testHarness/**`），以降低发布包攻击面与审核风险；E2E 运行使用 `npm run build:test`（测试模式）包含 harness。

**验收（Acceptance）**
- A1：`npm run build` 后 `dist/src/testHarness/harness.html` 不存在。
- A2：`npm run build:test` 后 `dist/src/testHarness/harness.html` 存在且 `npm run e2e` 全绿。

### REQ-014 CI 自动验证（P1）

仓库需要 CI 在 push/PR 时自动运行 `npm test` 与 `npm run e2e`（扩展 E2E 需 headed 环境，使用 Xvfb）。

**验收（Acceptance）**
- A1：GitHub Actions workflow 可见且在 push 时自动触发。
- A2：CI 日志显示单测与 E2E 都通过。
