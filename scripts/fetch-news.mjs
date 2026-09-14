import { mkdir, readFile, rename, writeFile } from "node:fs/promises";

const OUTPUT = new URL("../public/data/news.json", import.meta.url);
const SOURCES = [
  { name: "OpenAI News", url: "https://openai.com/news/rss.xml", match: () => true },
  {
    name: "Google DeepMind",
    url: "https://deepmind.google/blog/rss.xml",
    match: () => true,
  },
];

const strip = (value = "") => value.replace(/<!\[CDATA\[([\s\S]*?)]]>/g, "$1").replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();
const tag = (xml, names) => {
  for (const name of names) {
    const found = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"));
    if (found) return strip(found[1]);
  }
  return "";
};
const link = (xml) => xml.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1] || tag(xml, ["link"]);

function parseFeed(xml, source) {
  const blocks = xml.match(/<(item|entry)(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi) || [];
  return blocks.map((block) => ({
    title: tag(block, ["title"]),
    summary: tag(block, ["description", "summary", "content"]).slice(0, 280),
    url: link(block),
    publishedAt: tag(block, ["pubDate", "published", "updated"]),
    source: source.name,
  })).filter((item) => item.title && item.url && source.match(item));
}

async function loadExisting() {
  try { return JSON.parse(await readFile(OUTPUT, "utf8")); } catch { return { articles: [], sources: {} }; }
}

const now = new Date().toISOString();
const existing = await loadExisting();
const results = await Promise.allSettled(SOURCES.map(async (source) => {
  const response = await fetch(source.url, { headers: { "user-agent": "daily-ai-brief/1.0" } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return [source.name, parseFeed(await response.text(), source)];
}));

const sources = {};
let incoming = [];
for (const [index, result] of results.entries()) {
  const source = SOURCES[index];
  if (result.status === "fulfilled") {
    incoming.push(...result.value[1]);
    sources[source.name] = { status: "ok", checkedAt: now, count: result.value[1].length };
  } else {
    sources[source.name] = { status: "failed", checkedAt: now, message: result.reason.message };
  }
}

const deduped = new Map(existing.articles.map((article) => [article.url, article]));
for (const article of incoming) deduped.set(article.url, { ...article, collectedAt: now });
const articles = [...deduped.values()].sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0)).slice(0, 200);

if (!incoming.length && !existing.articles.length) throw new Error("所有来源均不可用，未生成空数据文件。");
await mkdir(new URL(".", OUTPUT), { recursive: true });
const temporary = new URL("news.tmp.json", OUTPUT);
await writeFile(temporary, JSON.stringify({ updatedAt: now, timezone: "Asia/Shanghai", articles, sources }, null, 2));
await rename(temporary, OUTPUT);
console.log(`更新完成：${incoming.length} 条输入，保存 ${articles.length} 条。`);
