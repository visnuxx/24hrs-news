const express = require("express");
const axios = require("axios");
const xml2js = require("xml2js");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());

// ── config ────────────────────────────────────────────────────────────────────

const CACHE_DIR = path.join(__dirname, ".cache");
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;


if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR);

const FEEDS = {
  international: [
    { url: "http://feeds.bbci.co.uk/news/rss.xml", source: "BBC News" },
    {
      url: "https://news.google.com/rss/search?q=world+news&hl=en-IN&gl=IN&ceid=IN:en",
      source: "Google News",
    },
  ],
  tamilNadu: [
    // ── State-level feeds ────────────────────────────────────────────────────
    {
      url: "https://www.thehindu.com/news/national/tamil-nadu/feeder/default.rss",
      source: "The Hindu",
    },
    {
      url: "https://news.google.com/rss/search?q=tamil+nadu&hl=en-IN&gl=IN&ceid=IN:en",
      source: "Google News",
    },
    {
      url: "https://www.thenewsminute.com/feed",
      source: "The News Minute",
    },
    {
      url: "https://www.newindianexpress.com/state/tamil-nadu/feed",
      source: "New Indian Express",
    },
    // ── City / Regional feeds ────────────────────────────────────────────────
    {
      url: "https://news.google.com/rss/search?q=chennai+news&hl=en-IN&gl=IN&ceid=IN:en",
      source: "Google News · Chennai",
    },
    {
      url: "https://news.google.com/rss/search?q=coimbatore+news&hl=en-IN&gl=IN&ceid=IN:en",
      source: "Google News · Coimbatore",
    },
    {
      url: "https://news.google.com/rss/search?q=madurai+news&hl=en-IN&gl=IN&ceid=IN:en",
      source: "Google News · Madurai",
    },
    {
      url: "https://news.google.com/rss/search?q=trichy+news&hl=en-IN&gl=IN&ceid=IN:en",
      source: "Google News · Trichy",
    },
    {
      url: "https://news.google.com/rss/search?q=salem+tamil+nadu+news&hl=en-IN&gl=IN&ceid=IN:en",
      source: "Google News · Salem",
    },
  ],
};

const VALID_LABELS = [
  "Politics", "Business", "Technology", "Sports",
  "Crime", "Entertainment", "Health", "Climate", "World", "Conflict",
];

const feedLocks = {};
const summaryLocks = {};

const KEYWORD_RULES = [
  {
    label: "Politics",
    exact: ["election", "elections", "vote", "votes", "voting", "campaign",
      "parliament", "minister", "government", "president", "manifesto",
      "dmk", "aiadmk", "bjp", "congress", "modi", "trump", "biden",
      "harris", "lok sabha", "rajya sabha", "mla", "mp", "constituency",
      "candidate", "candidates", "polling", "rally", "cabinet",
      "opposition", "ruling party", "by-election", "governor",
      "senate", "referendum", "ballot", "incumbent", "tvk", "edappadi",
      "palaniswami", "kanimozhi", "stalin", "dravidian"],
    partial: ["prime minister", "chief minister", "political party", "poll result",
      "election result", "votes cast", "campaigns for"],
  },
  {
    label: "Conflict",
    exact: ["war", "wars", "missile", "missiles", "bomb", "bombs", "airstrike",
      "airstrikes", "troops", "soldier", "soldiers", "ceasefire",
      "hostage", "hamas", "hezbollah", "ukraine", "russia", "gaza",
      "israel", "iran", "nato", "artillery", "invasion", "shelling",
      "casualties", "idf", "irgc", "frontline"],
    partial: ["military operation", "armed forces", "terror attack", "suicide bomb",
      "rocket fire", "ground offensive"],
  },
  {
    label: "Sports",
    exact: ["cricket", "ipl", "t20", "odi", "bcci", "football", "fifa",
      "tennis", "wimbledon", "olympic", "olympics", "nba", "nfl",
      "golf", "boxing", "ufc", "wicket", "batting", "bowling",
      "wickets", "innings", "over", "penalty", "goalkeeper", "striker"],
    partial: ["premier league", "champions league", "la liga", "formula 1",
      "grand prix", "series win", "world cup", "test match",
      "match preview", "match report", "transfer window", "signed for",
      "sports news", "ipl 2025", "ipl 2026"],
  },
  {
    label: "Technology",
    exact: ["ai", "openai", "chatgpt", "gemini", "gpt", "nvidia", "iphone",
      "android", "5g", "semiconductor", "cybersecurity", "algorithm",
      "smartphone", "laptop", "robot", "robotics", "satellite", "drone",
      "drones", "spacex", "tesla", "microsoft", "apple", "google",
      "meta", "software", "hardware", "startup", "startups"],
    partial: ["artificial intelligence", "machine learning", "data breach",
      "electric vehicle", "tech company", "tech giant", "cloud computing",
      "quantum computing", "generative ai"],
  },
  {
    label: "Business",
    exact: ["gdp", "rupee", "inflation", "rbi", "sebi", "ipo", "merger",
      "acquisition", "tariff", "tariffs", "recession", "nse", "bse",
      "sensex", "nifty", "budget", "revenue", "profit", "earnings"],
    partial: ["stock market", "interest rate", "trade deficit", "economic growth",
      "fiscal policy", "foreign investment", "market cap", "quarterly results",
      "world bank", "imf loan"],
  },
  {
    label: "Crime",
    exact: ["arrested", "murder", "robbery", "fraud", "accused", "verdict",
      "convicted", "jail", "prison", "fir", "cbi", "cid", "smuggling",
      "kidnap", "kidnapped", "assault", "rape", "detained", "custody",
      "bail", "chargesheet", "trafficking"],
    partial: ["police arrest", "under investigation", "drug bust", "gang war",
      "court hearing", "sentenced to", "filed case"],
  },
  {
    label: "Health",
    exact: ["vaccine", "cancer", "diabetes", "epidemic", "pandemic", "icmr",
      "aiims", "outbreak", "mortality", "surgery"],
    partial: ["health ministry", "hospital", "mental health", "drug approval",
      "clinical trial", "death toll", "disease outbreak", "public health"],
  },
  {
    label: "Climate",
    exact: ["flood", "floods", "drought", "wildfire", "hurricane", "cyclone",
      "heatwave", "earthquake", "tsunami", "monsoon", "co2",
      "deforestation", "pollution"],
    partial: ["climate change", "global warming", "net zero", "carbon emission",
      "renewable energy", "sea level", "fossil fuel", "green energy",
      "temperature record", "heat wave"],
  },
  {
    label: "Entertainment",
    exact: ["film", "movie", "cinema", "actor", "actress", "director",
      "album", "concert", "oscar", "grammy", "bollywood", "kollywood",
      "hollywood", "netflix", "hotstar", "celebrity", "ott"],
    partial: ["box office", "trailer release", "amazon prime", "music video",
      "award show", "film festival", "theatre release"],
  },
  {
    label: "World",
    exact: ["china", "usa", "europe", "france", "germany", "japan",
      "pakistan", "bangladesh", "myanmar", "africa", "brazil",
      "canada", "australia", "g20", "g7", "imf", "diplomacy",
      "sanctions", "ambassador", "treaty"],
    partial: ["united nations", "foreign minister", "bilateral talks",
      "world bank", "sri lanka", "south asia"],
  },
];

function keywordLabel(title) {
  // Pad with spaces so word-boundary checks work at start/end of string
  const text = " " + title.toLowerCase() + " ";

  for (const rule of KEYWORD_RULES) {
    // Exact: keyword must be surrounded by non-alphanumeric chars
    const exactHit = rule.exact.some((kw) => {
      const re = new RegExp(`(?<![a-z0-9])${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![a-z0-9])`, "i");
      return re.test(text);
    });
    if (exactHit) return rule.label;

    // Partial: plain substring match (used for multi-word phrases that are unambiguous)
    const partialHit = rule.partial.some((kw) => text.includes(kw));
    if (partialHit) return rule.label;
  }

  return "World";
}

// ── cache helpers ─────────────────────────────────────────────────────────────

function getCachePath(feedKey) {
  return path.join(CACHE_DIR, `${feedKey}.json`);
}

function readCache(feedKey) {
  const cachePath = getCachePath(feedKey);
  if (!fs.existsSync(cachePath)) return null;
  try {
    const raw = JSON.parse(fs.readFileSync(cachePath, "utf8"));
    const age = Date.now() - raw.cachedAt;
    if (age < CACHE_TTL_MS) {
      console.log(`[cache] HIT for "${feedKey}" — ${Math.round(age / 60000)}m old`);
      return raw.articles;
    }
    console.log(`[cache] STALE for "${feedKey}" — refreshing`);
    return null;
  } catch {
    return null;
  }
}

function writeCache(feedKey, articles) {
  const cachePath = getCachePath(feedKey);
  fs.writeFileSync(
    cachePath,
    JSON.stringify({ cachedAt: Date.now(), articles }, null, 2),
    "utf8"
  );
  console.log(`[cache] WRITTEN for "${feedKey}" — ${articles.length} articles`);
}

// ── feed helpers ──────────────────────────────────────────────────────────────

async function parseFeed({ url, source }) {
  const response = await axios.get(url, { timeout: 8000 });
  const data = await xml2js.parseStringPromise(response.data);
  const items = data.rss.channel[0].item || [];
  return items.map((item) => ({
    title: item.title[0],
    link: item.link[0],
    pubDate: item.pubDate ? item.pubDate[0] : null,
    source,
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

// ── Gemini labeling ───────────────────────────────────────────────────────────

function labelArticles(articles) {
  return articles.map((a) => ({ ...a, label: keywordLabel(a.title) }));
}

// ── core pipeline ─────────────────────────────────────────────────────────────
async function getFeed(feedKey) {

  // If already running, wait for same job
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
          console.log(`[feed] ✅ ${feed.source} — ${articles.length} articles`);
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

app.get("/news/international", async (req, res) => {
  try {
    res.json(await getFeed("international"));
  } catch (err) {
    console.error(err.message);
    res.status(500).send("error fetching news");
  }
});

app.get("/news/tamil-nadu", async (req, res) => {
  try {
    res.json(await getFeed("tamilNadu"));
  } catch (err) {
    console.error(err.message);
    res.status(500).send("error fetching news");
  }
});

// Force refresh: DELETE /cache/international  or  DELETE /cache/tamilNadu
app.delete("/cache/:feedKey", (req, res) => {
  const cachePath = getCachePath(req.params.feedKey);
  if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
  res.json({ ok: true, message: `Cache cleared for "${req.params.feedKey}"` });
});

async function generateSummary(feedKey) {
  // Re-use cached feed articles — no extra RSS fetch
  const cached = readCache(feedKey);
  const articles = cached || [];

  if (articles.length === 0) {
    return { generatedAt: new Date().toISOString(), items: [] };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // Build a compact list for Gemini — title + source + label
  const inputList = articles.slice(0, 80).map((a, idx) => ({
    idx,
    title: a.title,
    source: a.source,
    label: a.label || "World",
  }));

  const feedLabel = feedKey === "tamilNadu" ? "Tamil Nadu" : "International";

  const prompt = `You are a senior news editor creating a daily briefing for ${feedLabel} news.
 
From the articles below, select the 10 most important, diverse, and newsworthy stories of the day.
Avoid picking multiple articles about the exact same event — prefer variety across topics.
 
For each selected article write:
- A short punchy headline (max 12 words, rewritten in your own words — not copied)
- A 2-sentence plain-English brief explaining what happened and why it matters
- The label category it belongs to
 
Return ONLY valid JSON array, no markdown, no explanation:
[
  {
    "rank": 1,
    "originalIdx": <number from input>,
    "headline": "<your rewritten headline>",
    "brief": "<2-sentence brief>",
    "label": "<label>",
    "source": "<source from input>"
  },
  ...
]
 
Articles:
${JSON.stringify(inputList)}`;

  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4 },
      },
      { timeout: 45000 }
    );

    const raw = res.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "[]";
    const clean = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/, "")
      .trim();

    const parsed = JSON.parse(clean);

    // Attach original link + pubDate from the source article
    const enriched = parsed.map((item) => {
      const original = articles[item.originalIdx] || {};
      return {
        rank: item.rank,
        headline: item.headline,
        brief: item.brief,
        label: VALID_LABELS.includes(item.label) ? item.label : "World",
        source: item.source || original.source,
        link: original.link || null,
        pubDate: original.pubDate || null,
      };
    });

    console.log(`[summary] ✅ Generated Top 10 for "${feedKey}"`);
    return {
      generatedAt: new Date().toISOString(),
      feedKey,
      items: enriched,
    };
  } catch (err) {
    console.error(`[summary] ❌ Gemini failed:`, err.message);
    // Fallback: just return top 10 articles as-is with no brief
    return {
      generatedAt: new Date().toISOString(),
      feedKey,
      fallback: true,
      items: articles.slice(0, 10).map((a, i) => ({
        rank: i + 1,
        headline: a.title,
        brief: null,
        label: a.label || "World",
        source: a.source,
        link: a.link,
        pubDate: a.pubDate,
      })),
    };
  }
}

// ── 2. SUMMARY CACHE HELPERS (add after generateSummary) ─────────────────────

function getSummaryCachePath(feedKey) {
  return path.join(CACHE_DIR, `summary-${feedKey}.json`);
}

function readSummaryCache(feedKey) {
  const p = getSummaryCachePath(feedKey);
  if (!fs.existsSync(p)) return null;
  try {
    const raw = JSON.parse(fs.readFileSync(p, "utf8"));
    const age = Date.now() - new Date(raw.generatedAt).getTime();
    if (age < CACHE_TTL_MS) {
      console.log(`[summary] Cache HIT for "${feedKey}" — ${Math.round(age / 60000)}m old`);
      return raw;
    }
    console.log(`[summary] Cache STALE for "${feedKey}" — regenerating`);
    return null;
  } catch {
    return null;
  }
}

function writeSummaryCache(feedKey, summary) {
  fs.writeFileSync(
    getSummaryCachePath(feedKey),
    JSON.stringify(summary, null, 2),
    "utf8"
  );
  console.log(`[summary] Cache WRITTEN for "${feedKey}"`);
}

// ── 3. SUMMARY ROUTE (add alongside your other app.get routes) ───────────────

app.get("/news/summary/:feedKey", async (req, res) => {
  const { feedKey } = req.params;

  if (!FEEDS[feedKey]) {
    return res.status(404).json({ error: `Unknown feedKey: ${feedKey}` });
  }

  // If summary already generating → wait
  if (summaryLocks[feedKey]) {
    console.log(`[summary] WAITING existing summary job`);
    return res.json(await summaryLocks[feedKey]);
  }

  summaryLocks[feedKey] = (async () => {

    const cached = readSummaryCache(feedKey);
    if (cached) return cached;

    // Ensure feed exists
    await getFeed(feedKey);

    // small delay safety
   

    const summary = await generateSummary(feedKey);

    writeSummaryCache(feedKey, summary);

    return summary;

  })();

  try {
    res.json(await summaryLocks[feedKey]);
  } catch (err) {
    console.error("[summary] Route error:", err.message);
    res.status(500).json({ error: "Failed to generate summary" });
  } finally {
    delete summaryLocks[feedKey];
  }
});

setTimeout(() => {
  console.log("[warmup] Preloading feeds...");
  getFeed("international");
  getFeed("tamilNadu");
}, 10000);

app.listen(5000, () => console.log("Server running on port 5000"));
