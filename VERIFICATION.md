# 验证记录

## 已验证

| 项目 | 结果与证据 |
| --- | --- |
| 模拟容错测试 | 本轮 `npm test` 通过。测试使用固定本地数据，覆盖重复输入、单来源失败、无新内容；不访问外部 RSS。 |
| 真实 RSS 抓取 | 已执行的 `npm run update` 真实抓取 1,293 条候选资讯，保存 200 条；后续运行新增 0 条，状态为 `no-new-content`。 |
| 保存数据校验 | 本轮 `npm run check` 通过：当前 200 条新闻，链接无重复，必要字段完整。 |
| 浏览器验收 | 已在桌面与 400px 手机视图确认双列／单列布局、卡片渲染、关键词搜索、来源筛选、时间范围、清除条件、原文链接、发布时间与采集时间正常。 |
| 受控边界数据 | 本轮 `npm test` 使用缺失发布时间和长标题的本地数据，确认缺失发布时间不会被伪造、长标题不会在数据层截断。该验证不修改真实 `news.json`。 |
| 自动部署链路 | 手动 `Update AI news #2` 成功；随后 `Deploy GitHub Pages #4` 由 `workflow_run` 自动触发并成功。公开站点：<https://muxinqiao.github.io/daily-ai-brief/>。 |
| 原始题目隔离 | `开发实作测试题_每日AI情报站_候选人版.docx` 被 `.gitignore` 精确忽略，且未被 Git 跟踪。 |

## 未验证

- `Update AI news` 已配置每日 01:15 UTC（Asia/Shanghai 09:15）的 cron 触发，但当前没有 `schedule` 类型的成功运行记录。手动触发与其后的自动 Pages 部署已验证，计划 cron 触发尚未验证。

## 未完成

- 缺失发布时间与长标题的浏览器视觉复验尚未重跑；页面已有“发布时间：未知”回退与常规标题换行实现，但本轮未将其作为新的视觉验证证据。

## GitHub Actions Node.js 20 Warning 说明

Pages 部署日志曾出现 GitHub 官方 Actions 内部 Node.js 20 运行时弃用的上游平台警告。该警告不代表项目抓取脚本使用 Node.js 20，也不影响已成功的部署。

项目工作流通过 `actions/setup-node@v4` 使用 Node.js 22。当前 Pages 工作流使用 `actions/checkout@v4`、`actions/configure-pages@v5`、`actions/upload-pages-artifact@v3` 与 `actions/deploy-pages@v4`；不因该上游迁移提示引入非官方依赖或不稳定的版本固定。
