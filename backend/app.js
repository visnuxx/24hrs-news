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

// ── keyword fallback labeling ─────────────────────────────────────────────────
// Used when Gemini is unavailable or fails. Covers common patterns well.

// Each rule has `exact` (whole-word match) and `partial` (substring ok) keyword lists.
// Priority order matters — first match wins. Politics before Sports to avoid
// "polls" / "party" / "league" misfires.
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

async function labelWithGemini(articles) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("[label] No GEMINI_API_KEY — using keyword fallback");
    return articles.map((a) => ({ ...a, label: keywordLabel(a.title) }));
  }

  // Free tier: 15 req/min, 1M tokens/min. 150 articles/batch keeps it to 1 call per feed.
  const BATCH = 150;
  const DELAY_MS = 5000; // 5s between batches — well within 15 req/min
  const labeled = [];

  for (let i = 0; i < articles.length; i += BATCH) {
    if (i > 0) {
      console.log(`[label] Waiting ${DELAY_MS / 1000}s before next batch...`);
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
    const batch = articles.slice(i, i + BATCH);
    const titlesJson = JSON.stringify(
      batch.map((a, idx) => ({ idx, title: a.title }))
    );

    const prompt = `You are a news categoriser. Assign each article title exactly one label from this list:
${VALID_LABELS.join(", ")}

Rules:
- Return ONLY a valid JSON array. No markdown, no explanation, no code fences.
- Array length must equal input length, preserving order.
- Each element: { "idx": <number>, "label": "<label>" }
- Never invent new labels. If unsure, pick the closest match.

Titles:
${titlesJson}`;

    try {
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0 },
        },
        { timeout: 30000 }
      );

      const raw = res.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "[]";
      const clean = raw
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/, "")
        .trim();
      const parsed = JSON.parse(clean);

      batch.forEach((article, j) => {
        const match = parsed.find((p) => p.idx === j);
        const geminiLabel = match && VALID_LABELS.includes(match.label) ? match.label : null;
        labeled.push({
          ...article,
          // If Gemini label invalid, fall back to keyword label
          label: geminiLabel || keywordLabel(article.title),
        });
      });

      console.log(`[label] Gemini labeled batch ${i / BATCH + 1} (${batch.length} articles)`);
    } catch (err) {
      console.error(`[label] Gemini batch failed, using keyword fallback:`, err.message);
      // Keyword fallback per article — never "News" for everything
      batch.forEach((article) =>
        labeled.push({ ...article, label: keywordLabel(article.title) })
      );
    }
  }

  return labeled;
}

// ── core pipeline ─────────────────────────────────────────────────────────────

async function getFeed(feedKey) {
  const cached = readCache(feedKey);
  if (cached) return cached;

  console.log(`[feed] Fetching fresh articles for "${feedKey}"`);
  const feedList = FEEDS[feedKey];
  const results = await Promise.allSettled(feedList.map(async (feed) => {
    try {
      const articles = await parseFeed(feed);
      console.log(`[feed] ✅ ${feed.source} — ${articles.length} articles`);
      return articles;
    } catch (err) {
      console.error(`[feed] ❌ ${feed.source} — ${err.message}`);
      return []; // don't crash the whole pipeline
    }
  }));

  const articles = dedupe(
    results.flatMap(r => r.status === "fulfilled" ? r.value : [])
      .filter(within24h)
  ).sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  const labeled = await labelWithGemini(articles);
  writeCache(feedKey, labeled);
  return labeled;
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

app.listen(5000, () => console.log("Server running on port 5000"));
