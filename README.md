# 每日 AI 情报站

面向每日 AI 动态浏览的新闻聚合站。它从 OpenAI News 和 Google DeepMind RSS 读取内容，展示为可搜索、可跳转原文的新闻卡片，并适配移动端单列浏览。

## 已实现能力

- 聚合 OpenAI News 与 Google DeepMind RSS。
- 保留最新 200 条有效新闻；已在 1,292 条输入上验证。
- 以稳定标识去重，重复更新不会产生重复记录。
- 提供关键词搜索、原文链接和响应式移动端单列布局。

## 当前交付状态

核心功能已完成浏览器验收。详细的开发边界、验证证据与后续发布步骤分别见 [DEV_STATE.md](DEV_STATE.md)、[VERIFICATION.md](VERIFICATION.md) 和 [DEVELOPMENT_NOTES.md](DEVELOPMENT_NOTES.md)。

## 发布前事项

本仓库已推送至 GitHub；GitHub Pages 已通过 Actions 成功部署。`Update AI news` 成功完成后会自动触发 Pages 再部署，公开站点已完成线上验证。
diff --git a/DEVELOPMENT_NOTES.md b/DEVELOPMENT_NOTES.md
