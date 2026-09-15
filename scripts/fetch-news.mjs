import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { isSafeArticleUrl, mergeNews } from "./news-data.mjs";

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
  })).filter((item) => item.title && isSafeArticleUrl(item.url) && source.match(item));
}

async function loadExisting() {
  try { return JSON.parse(await readFile(OUTPUT, "utf8")); } catch { return { articles: [], sources: {} }; }
}

const now = new Date().toISOString();
const existing = await loadExisting();
const results = await Promise.allSettled(SOURCES.map(async (source) => {
  const response = await fetch(source.url, { headers: { "user-agent": "daily-ai-brief/1.0" } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return parseFeed(await response.text(), source);
}));

const data = mergeNews(existing, SOURCES.map((source, index) => ({ name: source.name, result: results[index] })), now);

if (!data.update.fetchedCount && !existing.articles.length) throw new Error("所有来源均不可用，未生成空数据文件。");
await mkdir(new URL(".", OUTPUT), { recursive: true });
const temporary = new URL("news.tmp.json", OUTPUT);
await writeFile(temporary, JSON.stringify(data, null, 2));
await rename(temporary, OUTPUT);
console.log(`更新完成：抓取 ${data.update.fetchedCount} 条，新增 ${data.update.newCount} 条，保存 ${data.articles.length} 条。`);
