# 开发说明

## 提交信息

- 姓名：牟新桥
- 实际投入时间：10 小时
- 演示地址：<https://muxinqiao.github.io/daily-ai-brief/>
- 源码地址：<https://github.com/muxinqiao/daily-ai-brief>
- 未验证事项：计划 cron 触发尚无成功运行记录；手动触发和后续 Pages 自动部署已验证。

## 开发工具与引用

- 主要使用工具：Codex Harness + GPT-5.6Terra（中、高）。
- 未使用外部模板或开源项目；不使用付费 API 或模型调用。

## 关键决策

1. 使用 OpenAI News 与 Google DeepMind 两个公开 RSS 作为真实、独立的信息源，避免把手工新闻或模拟数据当作自动获取结果。
2. 采用静态 JSON 加 GitHub Actions 的更新与发布链路：抓取结果保存到仓库，`Update AI news` 成功后由 `workflow_run` 触发 GitHub Pages 部署。这使站点不依赖个人电脑持续开机，也保持实现与运行成本较低。

## 问题定位与修复

初版页面能够显示资讯数量，但没有渲染新闻卡片。通过浏览器控制台的 `Cannot set properties of null` 定位到模板克隆后元素选择失败；随后改为原生 DOM 创建卡片。修复后在桌面浏览器和移动端视图验证了卡片渲染、筛选与原文链接均可正常使用。

## 数据处理边界

- 容量上限为 200 条，按原文 URL 去重；单来源失败保留旧数据，并区分 `updated`、`no-new-content` 与 `partial-failure`。
- 原始面试题 DOCX 仅作本地参考，已由 `.gitignore` 精确排除，不纳入 Git。

## 已完成发布

仓库已推送至 `main`，GitHub Pages 已通过 Actions 部署。手动触发的 `Update AI news` 已成功，并自动触发后续 Pages 部署；具体记录见 [VERIFICATION.md](VERIFICATION.md)。
