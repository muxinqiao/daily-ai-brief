import assert from "node:assert/strict";
import { mergeNews } from "./news-data.mjs";

const now = "2026-09-14T00:00:00.000Z";
const existing = {
  articles: [{ title: "已保存", summary: "", source: "OpenAI News", url: "https://example.com/old", publishedAt: "2026-09-01T00:00:00.000Z", collectedAt: now }],
};
const article = { title: "新资讯", summary: "", source: "OpenAI News", url: "https://example.com/new", publishedAt: "2026-09-14T00:00:00.000Z" };

const partialFailure = mergeNews(existing, [
  { name: "OpenAI News", result: { status: "fulfilled", value: [article, article] } },
  { name: "Google DeepMind", result: { status: "rejected", reason: new Error("offline") } },
], now);

assert.equal(partialFailure.articles.length, 2, "重复输入不应产生重复记录");
assert.equal(partialFailure.sources["Google DeepMind"].status, "failed", "应记录单来源失败");
assert.equal(partialFailure.update.status, "partial-failure", "应保留部分失败状态");
assert.ok(partialFailure.articles.some((item) => item.url === "https://example.com/old"), "来源失败时应保留旧数据");

const noNewContent = mergeNews(existing, [
  { name: "OpenAI News", result: { status: "fulfilled", value: [existing.articles[0]] } },
  { name: "Google DeepMind", result: { status: "fulfilled", value: [] } },
], now);

assert.equal(noNewContent.update.status, "no-new-content", "应区分没有新内容");
console.log("容错检查通过：重复输入、单来源失败和无新内容均符合预期。");
