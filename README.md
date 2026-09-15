# 每日 AI 情报站

面向每日 AI 动态浏览的新闻聚合站。它从 OpenAI News 和 Google DeepMind RSS 读取内容，展示为可搜索、可跳转原文的新闻卡片，并适配移动端单列浏览。

## 在线站点

<https://muxinqiao.github.io/daily-ai-brief/>

## 已实现能力

- 聚合 OpenAI News 与 Google DeepMind 两个独立 RSS 来源。
- 保留最新 200 条有效新闻；最近一次真实抓取获得 1,293 条候选资讯。
- 以原文 URL 去重，重复更新不产生重复记录；单一来源失败时保留已有数据。
- 提供关键词搜索、来源筛选、今天／最近 7 天／全部时间范围、原文链接和响应式移动端单列布局。
- 区分发布时间与采集时间，筛选按 Asia/Shanghai 计算，“最近 7 天”包含今天。

## 本地运行与验证

需要 Node.js 22。项目没有运行时 npm 依赖。

```bash
npm test       # 固定本地数据的模拟容错测试，不访问 RSS
npm run update # 真实抓取 RSS 并更新 public/data/news.json
npm run check  # 校验保存数据、字段与链接去重
python -m http.server 8000 --directory public
```

浏览器访问 <http://localhost:8000> 可查看本地静态页面。

## 数据与部署

`Update AI news` 工作流每日 01:15 UTC（Asia/Shanghai 09:15）运行，也提供手动触发入口。它先运行 `npm test`，再抓取 RSS、校验数据，并在有变化时提交 `public/data/news.json`。成功完成后，`Deploy GitHub Pages` 通过 `workflow_run` 自动重新部署 Pages。

当前已验证手动触发和后续 Pages 部署链路；计划 cron 触发本身尚无成功运行记录。

## 成本、外部依赖与限制

- 不使用付费 API、模型调用或外部模板／开源项目。
- 依赖 OpenAI News 与 Google DeepMind 公开 RSS 的可用性和内容格式；单来源失败不会清空已有数据。
- RSS 缺失发布时间时，页面会显示“发布时间：未知”，不以采集时间冒充发布时间。

详细的开发过程、验证证据与当前状态见 [DEVELOPMENT_NOTES.md](DEVELOPMENT_NOTES.md)、[VERIFICATION.md](VERIFICATION.md) 和 [DEV_STATE.md](DEV_STATE.md)。
