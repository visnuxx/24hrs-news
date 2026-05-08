const assert = require("node:assert/strict");
const fs = require("fs");
const test = require("node:test");

const { keywordLabel } = require("../src/services/categoryService");
const { dedupe, within24h } = require("../src/services/feedService");
const { getCachePath, readCache, writeCache } = require("../src/services/cacheService");
const { buildKeywordFallback } = require("../src/services/briefingService");

test("dedupe removes articles with matching normalized headlines", () => {
  const articles = [
    { title: "Big Election Result!", link: "https://example.com/1" },
    { title: "big election result", link: "https://example.com/2" },
    { title: "Markets open higher", link: "https://example.com/3" },
  ];

  assert.deepEqual(dedupe(articles).map((article) => article.link), [
    "https://example.com/1",
    "https://example.com/3",
  ]);
});

test("within24h keeps recent or undated articles and removes stale articles", () => {
  const recent = new Date(Date.now() - 60 * 60 * 1000).toUTCString();
  const stale = new Date(Date.now() - 48 * 60 * 60 * 1000).toUTCString();

  assert.equal(within24h({ pubDate: recent }), true);
  assert.equal(within24h({ pubDate: null }), true);
  assert.equal(within24h({ pubDate: stale }), false);
});

test("keywordLabel handles English and Tamil headlines", () => {
  assert.equal(keywordLabel("Chief minister announces election plan"), "Politics");
  assert.equal(keywordLabel("சென்னை மழை காரணமாக பள்ளிகள் மூடல்"), "Climate");
});

test("cache service writes and reads feed articles", () => {
  const feedKey = `test-${Date.now()}`;
  const cachePath = getCachePath(feedKey);
  const articles = [{ title: "Cached story", link: "https://example.com" }];

  try {
    writeCache(feedKey, articles);
    assert.deepEqual(readCache(feedKey), articles);
  } finally {
    if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
  }
});

test("Gemini fallback builds keyword-grouped briefing without an API call", () => {
  const briefing = buildKeywordFallback([
    {
      title: "Election campaign begins",
      source: "Example News",
      link: "https://example.com/politics",
      pubDate: new Date().toUTCString(),
      label: "Politics",
    },
  ], "international");

  assert.equal(briefing.fallback, true);
  assert.equal(briefing.feedKey, "international");
  assert.equal(briefing.totalArticles, 1);
  assert.equal(briefing.sections[0].heading, "Politics");
  assert.equal(briefing.sections[0].bullets[0].source, "Example News");
});
