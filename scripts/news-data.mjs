export const MAX_ARTICLES = 200;

export function mergeNews(existing, outcomes, now) {
  const previous = existing.articles ?? [];
  const knownUrls = new Set(previous.map((article) => article.url));
  const byUrl = new Map(previous.map((article) => [article.url, article]));
  const sources = {};
  const newUrls = new Set();
  let fetchedCount = 0;
  let failedCount = 0;

  for (const { name, result } of outcomes) {
    if (result.status === "fulfilled") {
      const incoming = result.value;
      let sourceNewCount = 0;
      for (const article of incoming) {
        fetchedCount += 1;
        if (!knownUrls.has(article.url) && !newUrls.has(article.url)) {
          sourceNewCount += 1;
          newUrls.add(article.url);
        }
        byUrl.set(article.url, { ...article, collectedAt: now });
      }
      sources[name] = { status: "ok", checkedAt: now, fetchedCount: incoming.length, newCount: sourceNewCount };
    } else {
      failedCount += 1;
      sources[name] = { status: "failed", checkedAt: now, message: result.reason.message };
    }
  }

  const articles = [...byUrl.values()]
    .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
    .slice(0, MAX_ARTICLES);
  const newCount = articles.filter((article) => newUrls.has(article.url)).length;
  const status = failedCount ? "partial-failure" : newCount ? "updated" : "no-new-content";

  return {
    updatedAt: now,
    timezone: "Asia/Shanghai",
    articles,
    sources,
    update: { status, checkedAt: now, fetchedCount, newCount },
  };
}
