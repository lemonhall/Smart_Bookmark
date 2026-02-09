# 隐私政策 — Smart Bookmark

Smart Bookmark 是一个帮助你更快把网页收藏到合适文件夹的 Chrome 扩展。

## 概要

- 无账号体系、无分析统计、无遥测。
- **AI 默认关闭。**
  - AI 关闭时，popup **零 `http(s)` 网络请求**。
  - AI 开启时，扩展会向你配置的 AI 接口发送请求，用于生成文件夹建议。

## 扩展会读取哪些数据（仅本地）

为了推荐文件夹并创建书签，扩展会读取：

- 当前标签页的 URL 与标题
- 你的书签树（文件夹与已有书签），通过 Chrome Bookmarks API

以上数据在你的浏览器本地处理。

## AI 开启时：会发送哪些数据（网络请求）

当你在 Options 页面开启 AI 后，Smart Bookmark 会向你配置的接口（默认兼容 OpenAI Responses API）发送一次请求以获取推荐，包含：

- 当前页面：`url`、`title`
- 页面信号（如可获取）：`meta description`、`og:title`、`og:description`、`canonical`、首个 `H1`
- 文件夹候选：**文件夹 `id` + 文件夹 `path`**（例如 `书签栏 / 技术 / 前端`）
- 本次请求使用的配置：模型名（例如 `gpt-5.2`）

重要说明：

- 请求 **不会上传你已有书签的 URL 列表**。
- 发送的 URL 仅包含你正在收藏的**当前页面 URL**。

## API Key 存储

如果你在 Options 中填写了 API Key，它会存储在你设备上的 `chrome.storage.local` 中，仅用于向你配置的 AI 接口发起鉴权请求。

## 第三方处理

AI 开启时，你配置的 AI 接口提供方（例如 OpenAI 或你选择的其他 OpenAI 兼容服务）将接收上述 payload，并可能按其自身政策进行处理。

## 联系方式

如对本隐私政策有疑问，请在本仓库提交 issue。

