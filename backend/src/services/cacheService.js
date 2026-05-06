const fs = require("fs");
const path = require("path");
const { CACHE_DIR, CACHE_TTL_MS } = require("../config/newsConfig");

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
      console.log(`[cache] HIT for "${feedKey}" â€” ${Math.round(age / 60000)}m old`);
      return raw.articles;
    }
    console.log(`[cache] STALE for "${feedKey}" â€” refreshing`);
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
  console.log(`[cache] WRITTEN for "${feedKey}" â€” ${articles.length} articles`);
}

module.exports = { getCachePath, readCache, writeCache };

