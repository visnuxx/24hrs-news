const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { CACHE_DIR, FEEDS } = require("../config/newsConfig");
const { readCache } = require("./cacheService");
const { getFeed } = require("./feedService");
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
    const status = err.response?.status;
    const reason =
      status === 429 ? "quota or rate limit reached" :
      status === 403 ? "API key rejected or quota unavailable" :
      err.message;
    console.error(`[briefing] Gemini unavailable, using fallback: ${reason}`);
    return buildKeywordFallback(todayArticles, feedKey);
  }
}

async function getBriefing(feedKey) {
  if (briefingLocks[feedKey]) {
    console.log(`[briefing] WAITING existing job for "${feedKey}"`);
    return briefingLocks[feedKey];
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
    return await briefingLocks[feedKey];
  } finally {
    delete briefingLocks[feedKey];
  }
}

module.exports = {
  getBriefing,
  getBriefingCachePath,
  readBriefingCache,
  writeBriefingCache,
  buildKeywordFallback,
  generateBriefing,
};
