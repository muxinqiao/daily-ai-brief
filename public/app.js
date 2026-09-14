const state = { articles: [], days: 7 };
const $ = (selector, root = document) => root.querySelector(selector);
const formatter = new Intl.DateTimeFormat("zh-CN", {
  dateStyle: "medium",
  timeZone: "Asia/Shanghai",
});

function startOfToday() {
  const local = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" }),
  );
  local.setHours(0, 0, 0, 0);
  return local.getTime();
}

function formatDate(value, fallback) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? formatter.format(date) : fallback;
}

function renderUpdateStatus(data) {
  const update = data.update ?? { status: "updated" };
  const checkedAt = formatDate(data.updatedAt, "时间未知");
  const messages = {
    updated: `最近更新：${checkedAt}（新增 ${update.newCount ?? "未知"} 条，Asia/Shanghai）`,
    "no-new-content": `最近检查：${checkedAt}（暂无新内容，Asia/Shanghai）`,
    "partial-failure": `最近检查：${checkedAt}（部分来源抓取失败，已保留已有资讯）`,
  };

  $("#update-status").textContent = messages[update.status] ?? `最近检查：${checkedAt}`;
  const list = $("#source-status");
  list.replaceChildren();

  for (const [name, source] of Object.entries(data.sources ?? {})) {
    const item = document.createElement("li");
    item.className = source.status === "failed" ? "failed" : "ok";
    item.textContent = source.status === "failed"
      ? `${name}：抓取失败，继续展示已有资讯。`
      : `${name}：正常（本次抓取 ${source.fetchedCount ?? source.count ?? 0} 条）。`;
    list.append(item);
  }
}

function render() {
  const query = $("#query").value.trim().toLowerCase();
  const source = $("#source").value;
  const cutoff = state.days === 99999
    ? -Infinity
    : startOfToday() - (state.days === 7 ? 6 : 0) * 86400000;

  const visible = state.articles.filter((article) => {
    const date = article.publishedAt ? new Date(article.publishedAt).getTime() : 0;
    return (!query || `${article.title} ${article.summary}`.toLowerCase().includes(query))
      && (!source || article.source === source)
      && (state.days === 99999 || date >= cutoff);
  });

  $("#count").textContent = `找到 ${visible.length} 条资讯`;
  const news = $("#news");
  news.replaceChildren();

  if (!visible.length) {
    news.innerHTML = '<p class="empty">没有符合条件的资讯。试试清除筛选条件。</p>';
    return;
  }

  visible.forEach((article) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="meta">
        <span class="source"></span>
        <div class="dates">
          <time class="published"></time>
          <time class="collected"></time>
        </div>
      </div>
      <h2></h2>
      <p class="summary"></p>
      <a target="_blank" rel="noopener noreferrer">阅读原文 <span aria-hidden="true">↗</span></a>
    `;

    card.querySelector(".source").textContent = article.source;
    card.querySelector(".published").textContent = `发布时间：${formatDate(article.publishedAt, "未知")}`;
    card.querySelector(".collected").textContent = `采集时间：${formatDate(article.collectedAt, "未知")}`;
    card.querySelector("h2").textContent = article.title;
    card.querySelector(".summary").textContent = article.summary || "来源未提供摘要。";

    const anchor = card.querySelector("a");
    anchor.href = article.url;
    news.append(card);
  });
}

try {
  const response = await fetch("./data/news.json");
  if (!response.ok) throw new Error("news data is unavailable");

  const data = await response.json();
  state.articles = data.articles;
  renderUpdateStatus(data);

  [...new Set(state.articles.map((item) => item.source))]
    .forEach((name) => $("#source").add(new Option(name, name)));

  render();
} catch {
  $("#update-status").textContent = "暂时无法读取资讯数据，请稍后刷新重试。";
  $("#source-status").replaceChildren();
  const item = document.createElement("li");
  item.className = "failed";
  item.textContent = "来源状态暂时不可用。";
  $("#source-status").append(item);
}

$("#query").addEventListener("input", render);
$("#source").addEventListener("change", render);

document.querySelectorAll("[data-days]").forEach((button) => {
  button.addEventListener("click", () => {
    state.days = Number(button.dataset.days);
    document.querySelectorAll("[data-days]")
      .forEach((item) => item.classList.toggle("active", item === button));
    render();
  });
});

$("#clear").addEventListener("click", () => {
  $("#query").value = "";
  $("#source").value = "";
  document.querySelector('[data-days="7"]').click();
});