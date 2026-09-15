# 开发状态

## 当前状态

- 分支：`main`，已与 `origin/main` 同步。
- 当前交付已部署至 GitHub Pages：<https://muxinqiao.github.io/daily-ai-brief/>。
- 最近一次保存数据：1,293 条候选资讯，保留 200 条新闻；状态为 `no-new-content`。
- OpenAI News 与 Google DeepMind RSS 均在最近一次真实抓取中成功返回数据。
- `npm test`、`npm run check`、浏览器桌面与 400px 手机视图验收均已通过。

## 已交付边界

- 支持关键词、来源、今天／最近 7 天／全部筛选；时间口径为 Asia/Shanghai，最近 7 天包含今天。
- 保留发布时间与采集时间，单来源失败不清空已有资讯，并展示来源与更新状态。
- 不包含账号、支付、评论、复杂后台或多用户权限；不使用密钥、付费 API 或模型调用。

## 待验证

- `Update AI news` 的每日 cron 已配置，但尚无 `schedule` 类型的成功运行记录。手动触发和成功后的 `workflow_run` Pages 部署已验证。
