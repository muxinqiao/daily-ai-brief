import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const data = JSON.parse(await readFile(new URL("../public/data/news.json", import.meta.url), "utf8"));
assert.ok(data.articles.length > 0, "应有至少一条新闻");
assert.equal(new Set(data.articles.map((item) => item.url)).size, data.articles.length, "原文链接必须去重");
assert.ok(data.articles.every((item) => item.title && item.source && item.url), "新闻字段不完整");
console.log(`检查通过：${data.articles.length} 条新闻，链接无重复。`);
