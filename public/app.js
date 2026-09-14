const state = { articles: [], days: 7 };
const $ = (selector, root = document) => root.querySelector(selector);
const formatter = new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeZone: "Asia/Shanghai" });
const today = () => new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })).setHours(0, 0, 0, 0);

function render() {
  const query = $("#query").value.trim().toLowerCase();
  const source = $("#source").value;
  const cutoff = today() - state.days * 86400000;
  const visible = state.articles.filter((article) => {
    const date = article.publishedAt ? new Date(article.publishedAt).getTime() : 0;
    return (!query || `${article.title} ${article.summary}`.toLowerCase().includes(query)) && (!source || article.source === source) && (state.days === 99999 || date >= cutoff);
  });
  $("#count").textContent = `找到 ${visible.length} 条资讯`;
  const news = $("#news"); news.replaceChildren();
  if (!visible.length) { news.innerHTML = '<p class="empty">没有符合条件的资讯。试试清除筛选条件。</p>'; return; }
    visible.forEach((article) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="meta"><span class="source"></span><time></time></div>
      <h2></h2>
      <p class="summary"></p>
      <a target="_blank" rel="noopener noreferrer">阅读原文 <span aria-hidden="true">↗</span></a>
    `;

    card.querySelector(".source").textContent = article.source;
    card.querySelector("time").textContent = article.publishedAt
      ? formatter.format(new Date(article.publishedAt))
      : "发布时间未知";
    card.querySelector("h2").textContent = article.title;
    card.querySelector(".summary").textContent = article.summary || "来源未提供摘要。";

    const anchor = card.querySelector("a");
    anchor.href = article.url;
    news.append(card);
  });
}

try {
  const data = await fetch("./data/news.json").then((response) => { if (!response.ok) throw new Error(); return response.json(); });
  state.articles = data.articles;
  $("#update-status").textContent = `最近更新：${formatter.format(new Date(data.updatedAt))}（Asia/Shanghai）`;
  [...new Set(state.articles.map((item) => item.source))].forEach((name) => $("#source").add(new Option(name, name)));
  render();
} catch { $("#update-status").textContent = "暂时无法读取资讯数据，请稍后刷新重试。"; }

$("#query").addEventListener("input", render);
$("#source").addEventListener("change", render);
document.querySelectorAll("[data-days]").forEach((button) => button.addEventListener("click", () => { state.days = Number(button.dataset.days); document.querySelectorAll("[data-days]").forEach((item) => item.classList.toggle("active", item === button)); render(); }));
$("#clear").addEventListener("click", () => { $("#query").value = ""; $("#source").value = ""; state.days = 7; document.querySelector('[data-days="7"]').click(); });
