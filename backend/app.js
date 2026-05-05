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
  tamil: [
    {
      url: "https://rss.dinamalar.com/tamilnadunews.asp",
      source: "Dinamalar",
    },
    {
      url: "https://rss.dinamalar.com/?cat=ara1",
      source: "Dinamalar · அரசியல்",
    },
    {
      url: "https://www.vikatan.com/rss",
      source: "Vikatan",
    },
    {
      url: "https://news.google.com/rss/search?q=தமிழ்நாடு&hl=ta&gl=IN&ceid=IN:ta",
      source: "Google News · தமிழ்",
    },
    {
      url: "https://news.google.com/rss/search?q=சென்னை&hl=ta&gl=IN&ceid=IN:ta",
      source: "Google News · சென்னை",
    },
    {
      url: "https://tamil.oneindia.com/rss/feeds/tamilnadu-fb.xml",
      source: "oneindia",
    },
    {
      url: "https://tamil.news18.com/rss/tamil-nadu.xml",
      source: "News18 Tamil Nadu",
    },
    {
      url: "https://feeds.bbci.co.uk/tamil/rss.xml",
      source: "BBC News Tamil",
    },
  ],
};

const VALID_LABELS = [
  "Politics", "Business", "Technology", "Sports",
  "Crime", "Entertainment", "Health", "Climate", "World", "Conflict",
];

const feedLocks = {};

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
      "palaniswami", "kanimozhi", "stalin", "dravidian",
      "தேர்தல்", "வாக்கு", "அரசு", "அமைச்சர்", "முதலமைச்சர்", "ஆளுநர்"],
    partial: ["prime minister", "chief minister", "political party", "poll result",
      "election result", "votes cast", "campaigns for"],
  },
  {
    label: "Conflict",
    exact: ["war", "wars", "missile", "missiles", "bomb", "bombs", "airstrike",
      "airstrikes", "troops", "soldier", "soldiers", "ceasefire",
      "hostage", "hamas", "hezbollah", "ukraine", "russia", "gaza",
      "israel", "iran", "nato", "artillery", "invasion", "shelling",
      "casualties", "idf", "irgc", "frontline",
      "போர்", "தாக்குதல்", "படைகள்"],
    partial: ["military operation", "armed forces", "terror attack", "suicide bomb",
      "rocket fire", "ground offensive"],
  },
  {
    label: "Sports",
    exact: ["cricket", "ipl", "t20", "odi", "bcci", "football", "fifa",
      "tennis", "wimbledon", "olympic", "olympics", "nba", "nfl",
      "golf", "boxing", "ufc", "wicket", "batting", "bowling",
      "wickets", "innings", "over", "penalty", "goalkeeper", "striker",
      "கிரிக்கெட்", "கால்பந்து", "விளையாட்டு", "ஒலிம்பிக்"],
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
      "meta", "software", "hardware", "startup", "startups",
      "தொழில்நுட்பம்", "செயற்கை நுண்ணறிவு"],
    partial: ["artificial intelligence", "machine learning", "data breach",
      "electric vehicle", "tech company", "tech giant", "cloud computing",
      "quantum computing", "generative ai"],
  },
  {
    label: "Business",
    exact: ["gdp", "rupee", "inflation", "rbi", "sebi", "ipo", "merger",
      "acquisition", "tariff", "tariffs", "recession", "nse", "bse",
      "sensex", "nifty", "budget", "revenue", "profit", "earnings",
      "வணிகம்", "பொருளாதாரம்", "பங்குச்சந்தை"],
    partial: ["stock market", "interest rate", "trade deficit", "economic growth",
      "fiscal policy", "foreign investment", "market cap", "quarterly results",
      "world bank", "imf loan"],
  },
  {
    label: "Crime",
    exact: ["arrested", "murder", "robbery", "fraud", "accused", "verdict",
      "convicted", "jail", "prison", "fir", "cbi", "cid", "smuggling",
      "kidnap", "kidnapped", "assault", "rape", "detained", "custody",
      "bail", "chargesheet", "trafficking",
      "கைது", "கொலை", "திருட்டு", "மோசடி", "சிறை"],
    partial: ["police arrest", "under investigation", "drug bust", "gang war",
      "court hearing", "sentenced to", "filed case"],
  },
  {
    label: "Health",
    exact: ["vaccine", "cancer", "diabetes", "epidemic", "pandemic", "icmr",
      "aiims", "outbreak", "mortality", "surgery",
      "உடல்நலம்", "மருத்துவம்", "நோய்", "மருந்து"],
    partial: ["health ministry", "hospital", "mental health", "drug approval",
      "clinical trial", "death toll", "disease outbreak", "public health"],
  },
  {
    label: "Climate",
    exact: ["flood", "floods", "drought", "wildfire", "hurricane", "cyclone",
      "heatwave", "earthquake", "tsunami", "monsoon", "co2",
      "deforestation", "pollution",
      "வெள்ளம்", "வறட்சி", "புயல்", "நிலநடுக்கம்", "மழை"],
    partial: ["climate change", "global warming", "net zero", "carbon emission",
      "renewable energy", "sea level", "fossil fuel", "green energy",
      "temperature record", "heat wave"],
  },
  {
    label: "Entertainment",
    exact: ["film", "movie", "cinema", "actor", "actress", "director",
      "album", "concert", "oscar", "grammy", "bollywood", "kollywood",
      "hollywood", "netflix", "hotstar", "celebrity", "ott",
      "திரைப்படம்", "சினிமா", "நடிகர்", "நடிகை", "இசை", "பாடல்"],
    partial: ["box office", "trailer release", "amazon prime", "music video",
      "award show", "film festival", "theatre release"],
  },
  {
    label: "World",
    exact: ["china", "usa", "europe", "france", "germany", "japan",
      "pakistan", "bangladesh", "myanmar", "africa", "brazil",
      "canada", "australia", "g20", "g7", "imf", "diplomacy",
      "sanctions", "ambassador", "treaty",
      "உலகம்", "சீனா", "அமெரிக்கா", "ஐரோப்பா"],
    partial: ["united nations", "foreign minister", "bilateral talks",
      "world bank", "sri lanka", "south asia"],
  },
];

function keywordLabel(title) {
  const text = " " + title.toLowerCase() + " ";
  for (const rule of KEYWORD_RULES) {
    const exactHit = rule.exact.some((kw) => {
      const re = new RegExp(`(?<![a-z0-9])${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![a-z0-9])`, "i");
      return re.test(text);
    });
    if (exactHit) return rule.label;
    const partialHit = rule.partial.some((kw) => text.includes(kw));
    if (partialHit) return rule.label;
  }
  return "World";
}

// ── image extraction ──────────────────────────────────────────────────────────

function extractImage(item) {
  const mediaContent = item["media:content"];
  if (mediaContent) {
    const nodes = Array.isArray(mediaContent) ? mediaContent : [mediaContent];
    for (const node of nodes) {
      if (node.$ && node.$.url && isImageUrl(node.$.url)) return node.$.url;
      if (typeof node === "string" && isImageUrl(node)) return node;
    }
  }

  const mediaThumbnail = item["media:thumbnail"];
  if (mediaThumbnail) {
    const nodes = Array.isArray(mediaThumbnail) ? mediaThumbnail : [mediaThumbnail];
    for (const node of nodes) {
      if (node.$ && node.$.url && isImageUrl(node.$.url)) return node.$.url;
      if (typeof node === "string" && isImageUrl(node)) return node;
    }
  }

  const enclosure = item.enclosure;
  if (enclosure) {
    const nodes = Array.isArray(enclosure) ? enclosure : [enclosure];
    for (const node of nodes) {
      if (node.$ && node.$.url && isImageUrl(node.$.url)) return node.$.url;
    }
  }

  if (item.image) {
    const img = Array.isArray(item.image) ? item.image[0] : item.image;
    const url = img.url ? (Array.isArray(img.url) ? img.url[0] : img.url) : null;
    if (url && isImageUrl(url)) return url;
  }

  const desc = item.description
    ? Array.isArray(item.description) ? item.description[0] : item.description
    : null;
  if (desc && typeof desc === "string") {
    const imgMatch = desc.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch && isImageUrl(imgMatch[1])) return imgMatch[1];
  }

  const contentEncoded = item["content:encoded"];
  if (contentEncoded) {
    const raw = Array.isArray(contentEncoded) ? contentEncoded[0] : contentEncoded;
    const imgMatch = raw.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch && isImageUrl(imgMatch[1])) return imgMatch[1];
  }

  return null;
}

function isImageUrl(url) {
  if (!url || typeof url !== "string") return false;
  if (!url.startsWith("http")) return false;
  return /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(url) ||
    url.includes("/image/") ||
    url.includes("/images/") ||
    url.includes("/img/") ||
    url.includes("/photo/") ||
    url.includes("/photos/") ||
    url.includes("/media/") ||
    url.includes("wsj.net") ||
    url.includes("bbci.co.uk") ||
    url.includes("thehindu") ||
    url.includes("ichef") ||
    url.includes("cloudfront") ||
    url.includes("wp-content");
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

app.get("/news/international", async (req, res) => {
  try { res.json(await getFeed("international")); }
  catch (err) { console.error(err.message); res.status(500).send("error fetching news"); }
});

app.get("/news/tamil-nadu", async (req, res) => {
  try { res.json(await getFeed("tamilNadu")); }
  catch (err) { console.error(err.message); res.status(500).send("error fetching news"); }
});

app.get("/news/tamil", async (req, res) => {
  try { res.json(await getFeed("tamil")); }
  catch (err) { console.error(err.message); res.status(500).send("error fetching news"); }
});

app.delete("/cache/:feedKey", (req, res) => {
  const cachePath = getCachePath(req.params.feedKey);
  if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
  res.json({ ok: true, message: `Cache cleared for "${req.params.feedKey}"` });
});

// ──────────────────────────────────────────────────────────────────────────────
// BRIEFING  (midnight → now, Gemini-summarized, editorial bullet-point format)
// ──────────────────────────────────────────────────────────────────────────────

const briefingLocks = {};
const BRIEFING_TTL_MS = 60 * 60 * 1000; // 1 hour cache

function getBriefingCachePath(feedKey) {
  return path.join(CACHE_DIR, `briefing-${feedKey}.json`);
}

function readBriefingCache(feedKey) {
  const p = getBriefingCachePath(feedKey);
  if (!fs.existsSync(p)) return null;
  try {
    const raw = JSON.parse(fs.readFileSync(p, "utf8"));
    const age = Date.now() - new Date(raw.generatedAt).getTime();

    // Invalidate if it crossed midnight since generation
    const genDate = new Date(raw.generatedAt);
    const now = new Date();
    const sameDay =
      genDate.getFullYear() === now.getFullYear() &&
      genDate.getMonth() === now.getMonth() &&
      genDate.getDate() === now.getDate();

    if (age < BRIEFING_TTL_MS && sameDay) {
      console.log(`[briefing] Cache HIT for "${feedKey}" — ${Math.round(age / 60000)}m old`);
      return raw;
    }
    console.log(`[briefing] Cache STALE for "${feedKey}"`);
    return null;
  } catch {
    return null;
  }
}

function writeBriefingCache(feedKey, briefing) {
  fs.writeFileSync(
    getBriefingCachePath(feedKey),
    JSON.stringify(briefing, null, 2),
    "utf8"
  );
  console.log(`[briefing] Cache WRITTEN for "${feedKey}"`);
}

// Fallback grouping when Gemini fails
function buildKeywordFallback(articles, feedKey) {
  const groups = {};
  for (const a of articles) {
    const label = a.label || "World";
    if (!groups[label]) groups[label] = [];
    groups[label].push(a);
  }

  const sections = Object.entries(groups)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 8)
    .map(([label, items], idx) => ({
      number: idx + 1,
      heading: label,
      summary: `${items.length} ${items.length === 1 ? "story" : "stories"} reported in ${label.toLowerCase()} today.`,
      bullets: items.slice(0, 6).map((a) => ({
        text: a.title,
        source: a.source,
        link: a.link,
        pubDate: a.pubDate,
      })),
    }));

  return {
    generatedAt: new Date().toISOString(),
    feedKey,
    fallback: true,
    totalArticles: articles.length,
    sections,
  };
}

async function generateBriefing(feedKey) {
  const cached = readCache(feedKey);
  const articles = cached || [];

  // Filter midnight → now
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  const todayArticles = articles.filter((a) => {
    if (!a.pubDate) return false;
    const d = new Date(a.pubDate);
    return d >= midnight && d <= now;
  });

  if (todayArticles.length === 0) {
    return {
      generatedAt: new Date().toISOString(),
      feedKey,
      from: midnight.toISOString(),
      to: now.toISOString(),
      totalArticles: 0,
      sections: [],
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("[briefing] No GEMINI_API_KEY — using fallback");
    return buildKeywordFallback(todayArticles, feedKey);
  }

  const inputList = todayArticles.slice(0, 60).map((a, idx) => ({
    idx,
    title: a.title,
    source: a.source,
    label: a.label || "World",
    pubDate: a.pubDate,
  }));

  const feedLabel =
    feedKey === "tamilNadu" ? "Tamil Nadu" :
    feedKey === "tamil"     ? "Tamil-language news from Tamil Nadu" :
                              "International";

  const prompt = `You are a senior editor writing today's briefing for ${feedLabel} news.
Today is ${now.toDateString()}. Below are ${inputList.length} articles published since midnight.

Your job:
1. Group related stories into 5–8 thematic SECTIONS (e.g., "Politics", "Global Conflict", "Markets", "Sports", "Entertainment", "Climate", "Tech & Business", "Crime & Justice"). Use natural editorial section names — not just rigid categories. Order them by importance (top stories first).
2. For each section, write:
   - A short, intelligent HEADING (3–6 words, editorial tone — not just a label)
   - A 1-sentence SUMMARY (the overall story arc of the section)
   - 3–6 BULLET points. Each bullet must:
       • Be one tight sentence (max 25 words)
       • Be rewritten in your own words (do NOT copy the headline verbatim)
       • Reference the originalIdx so the link can be attached
3. Avoid duplicates. If two articles cover the same event, merge them into ONE bullet.
4. Be neutral, factual, and concise — like The Economist or Axios.

Return ONLY valid JSON, no markdown, no commentary:
{
  "sections": [
    {
      "number": 1,
      "heading": "<editorial heading>",
      "summary": "<one-sentence section summary>",
      "bullets": [
        { "originalIdx": <number>, "text": "<rewritten bullet>" },
        ...
      ]
    },
    ...
  ]
}

Articles:
${JSON.stringify(inputList)}`;

  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 4096,
        },
      },
      { timeout: 60000 }
    );

    const raw = res.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";
    const clean = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/, "")
      .trim();

    const parsed = JSON.parse(clean);

    const sections = (parsed.sections || []).map((sec, secIdx) => ({
      number: sec.number || secIdx + 1,
      heading: sec.heading || "Top Stories",
      summary: sec.summary || "",
      bullets: (sec.bullets || [])
        .map((b) => {
          const original = todayArticles[b.originalIdx];
          if (!original) return null;
          return {
            text: b.text,
            source: original.source,
            link: original.link,
            pubDate: original.pubDate,
            label: original.label || "World",
          };
        })
        .filter(Boolean),
    })).filter((sec) => sec.bullets.length > 0);

    console.log(`[briefing] ✅ Generated briefing for "${feedKey}" — ${sections.length} sections`);

    return {
      generatedAt: new Date().toISOString(),
      feedKey,
      from: midnight.toISOString(),
      to: now.toISOString(),
      totalArticles: todayArticles.length,
      fallback: false,
      sections,
    };

  } catch (err) {
    console.error(`[briefing] ❌ Gemini failed:`, err.message);
    return buildKeywordFallback(todayArticles, feedKey);
  }
}

app.get("/news/briefing/:feedKey", async (req, res) => {
  const { feedKey } = req.params;

  if (!FEEDS[feedKey]) {
    return res.status(404).json({ error: `Unknown feedKey: ${feedKey}` });
  }

  if (briefingLocks[feedKey]) {
    console.log(`[briefing] WAITING existing job for "${feedKey}"`);
    return res.json(await briefingLocks[feedKey]);
  }

  briefingLocks[feedKey] = (async () => {
    const cached = readBriefingCache(feedKey);
    if (cached) return cached;

    await getFeed(feedKey);

    const briefing = await generateBriefing(feedKey);
    writeBriefingCache(feedKey, briefing);
    return briefing;
  })();

  try {
    res.json(await briefingLocks[feedKey]);
  } catch (err) {
    console.error("[briefing] Route error:", err.message);
    res.status(500).json({ error: "Failed to generate briefing" });
  } finally {
    delete briefingLocks[feedKey];
  }
});

// Manual cache clear for briefing
app.delete("/cache/briefing/:feedKey", (req, res) => {
  const p = getBriefingCachePath(req.params.feedKey);
  if (fs.existsSync(p)) fs.unlinkSync(p);
  res.json({ ok: true, message: `Briefing cache cleared for "${req.params.feedKey}"` });
});

// ── warmup ────────────────────────────────────────────────────────────────────

setTimeout(() => {
  console.log("[warmup] Preloading feeds...");
  getFeed("international");
  getFeed("tamilNadu");
  getFeed("tamil");
}, 10000);

app.listen(5000, () => console.log("Server running on port 5000"));