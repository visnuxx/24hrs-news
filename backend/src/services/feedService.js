const axios = require("axios");
const xml2js = require("xml2js");
const { FEEDS, CACHE_TTL_MS } = require("../config/newsConfig");
const { readCache, writeCache } = require("./cacheService");
const { keywordLabel } = require("./categoryService");
const { extractImage } = require("../utils/imageUtils");

const feedLocks = {};
async function parseFeed({ url, source }) {
  const response = await axios.get(url, {
    timeout: 8000,
    headers: { "User-Agent": "Mozilla/5.0 (compatible; NewsReader/1.0)" },
  });

  const parser = new xml2js.Parser({
    explicitArray: true,
    mergeAttrs: false,
    explicitCharkey: false,
  });

  const data = await parser.parseStringPromise(response.data);
  const items = data.rss?.channel?.[0]?.item || [];

  return items.map((item) => ({
    title:   Array.isArray(item.title)   ? item.title[0]   : (item.title   || ""),
    link:    Array.isArray(item.link)    ? item.link[0]    : (item.link    || ""),
    pubDate: Array.isArray(item.pubDate) ? item.pubDate[0] : (item.pubDate || null),
    source,
    image: extractImage(item),
  }));
}

function dedupe(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = (item.title || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function within24h(item) {
  if (!item.pubDate) return true;
  return Date.now() - new Date(item.pubDate) < CACHE_TTL_MS;
}

function labelArticles(articles) {
  return articles.map((a) => ({ ...a, label: keywordLabel(a.title) }));
}

// ── core pipeline ─────────────────────────────────────────────────────────────

async function getFeed(feedKey) {
  if (feedLocks[feedKey]) {
    console.log(`[feed] WAITING existing job for "${feedKey}"`);
    return feedLocks[feedKey];
  }

  feedLocks[feedKey] = (async () => {
    const cached = readCache(feedKey);
    if (cached) return cached;

    console.log(`[feed] Fetching fresh articles for "${feedKey}"`);

    const feedList = FEEDS[feedKey];

    const results = await Promise.allSettled(
      feedList.map(async (feed) => {
        try {
          const articles = await parseFeed(feed);
          const withImg = articles.filter(a => a.image).length;
          console.log(`[feed] ✅ ${feed.source} — ${articles.length} articles (${withImg} with images)`);
          return articles;
        } catch (err) {
          console.error(`[feed] ❌ ${feed.source} — ${err.message}`);
          return [];
        }
      })
    );

    const articles = dedupe(
      results
        .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
        .filter(within24h)
    ).sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    const labeled = labelArticles(articles);

    writeCache(feedKey, labeled);

    return labeled;
  })();

  try {
    return await feedLocks[feedKey];
  } finally {
    delete feedLocks[feedKey];
  }
}

// ── routes ────────────────────────────────────────────────────────────────────

module.exports = { getFeed, parseFeed, dedupe, within24h, labelArticles };
