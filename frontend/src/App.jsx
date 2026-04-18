import { useState, useMemo } from "react";

const API_BASE = "http://localhost:5000";

const FEEDS = [
  {
    key: "tamil-nadu",
    label: "Tamil Nadu",
    endpoint: "/news/tamil-nadu",
    summaryKey: "tamilNadu",
    color: "#1D9E75",
    bg: "#E1F5EE",
    textColor: "#085041",
  },
  {
    key: "international",
    label: "International",
    endpoint: "/news/international",
    summaryKey: "international",
    color: "#185FA5",
    bg: "#E6F1FB",
    textColor: "#0C447C",
  },
  {
    key: "tamil",
    label: "தமிழ்",
    endpoint: "/news/tamil",
    summaryKey: "tamil",
    color: "#B5450B",
    bg: "#FDF0E8",
    textColor: "#7A2D07",
  },
];

const LABEL_EMOJI = {
  Politics: "🏛️", Business: "📈", Technology: "💻", Sports: "⚽",
  Crime: "🔍", Entertainment: "🎬", Health: "🏥", Climate: "🌍",
  World: "🌐", Conflict: "⚔️", News: "📰",
};

const TRANSLATIONS = {
  en: {
    dark: "dark", light: "light",
    allStories: "All stories", todaysBrief: "Today's Brief",
    generating: "generating...", generatingBrief: "GENERATING TODAY'S BRIEF...",
    category: "CATEGORY", source: "SOURCE",
    searchPlaceholder: "Search headlines...",
    all: "All", allSources: "All sources",
    read: "Read ↗",
    loading: "LOADING...", selectFeed: "SELECT A FEED",
    whatRead: "What would you like to read?",
    chooseFeed: "Choose a feed above",
    failedLoad: "Failed to load",
    backendError: "Make sure the backend is running on port 5000",
    noArticles: "No articles found",
    tryDifferent: "Try a different filter or clear the search",
    tryLater: "Try again later",
    todaysBriefLabel: "TODAY'S BRIEF",
    generatedNote: "Generated once daily from",
    articles: "articles",
    poweredBy: "Powered by Gemini",
    failedSummary: "Failed to generate summary",
    geminiError: "Make sure GEMINI_API_KEY is set on Render",
    keywordMode: "keyword mode",
    feeds: { "tamil-nadu": "Tamil Nadu", international: "International", tamil: "தமிழ்" },
    labels: {
      Politics: "Politics", Business: "Business", Technology: "Technology",
      Sports: "Sports", Crime: "Crime", Entertainment: "Entertainment",
      Health: "Health", Climate: "Climate", World: "World", Conflict: "Conflict",
    },
  },
  ta: {
    dark: "இருள்", light: "ஒளி",
    allStories: "அனைத்து செய்திகள்", todaysBrief: "இன்றைய சுருக்கம்",
    generating: "உருவாக்குகிறது...", generatingBrief: "இன்றைய சுருக்கம் உருவாக்குகிறது...",
    category: "வகை", source: "மூலம்",
    searchPlaceholder: "செய்திகள் தேடுக...",
    all: "அனைத்தும்", allSources: "அனைத்து மூலங்கள்",
    read: "படிக்க ↗",
    loading: "ஏற்றுகிறது...", selectFeed: "ஒரு செய்தி தேர்ந்தெடுக்கவும்",
    whatRead: "என்ன படிக்க விரும்புகிறீர்கள்?",
    chooseFeed: "மேலே ஒரு செய்தி தேர்ந்தெடுக்கவும்",
    failedLoad: "ஏற்றல் தோல்வியடைந்தது",
    backendError: "பின்தள சேவை இயங்குகிறதா என சரிபார்க்கவும்",
    noArticles: "செய்திகள் எதுவும் இல்லை",
    tryDifferent: "வேறு வடிகட்டி முயற்சிக்கவும்",
    tryLater: "சற்று நேரம் கழித்து முயற்சிக்கவும்",
    todaysBriefLabel: "இன்றைய சுருக்கம்",
    generatedNote: "தினமும் ஒருமுறை உருவாக்கப்படுகிறது —",
    articles: "செய்திகள்",
    poweredBy: "Gemini மூலம்",
    failedSummary: "சுருக்கம் உருவாக்க தோல்வியடைந்தது",
    geminiError: "GEMINI_API_KEY சரியாக உள்ளதா என சரிபார்க்கவும்",
    keywordMode: "முக்கியசொல் முறை",
    feeds: { "tamil-nadu": "தமிழ்நாடு", international: "உலகம்", tamil: "தமிழ்" },
    labels: {
      Politics: "அரசியல்", Business: "வணிகம்", Technology: "தொழில்நுட்பம்",
      Sports: "விளையாட்டு", Crime: "குற்றம்", Entertainment: "பொழுதுபோக்கு",
      Health: "சுகாதாரம்", Climate: "காலநிலை", World: "உலகம்", Conflict: "மோதல்",
    },
  },
};

function cityFromSource(source) {
  if (!source) return null;
  const match = source.match(/Google News · (.+)/);
  return match ? match[1] : null;
}

function sourceShortLabel(source) {
  if (!source) return source;
  const city = cityFromSource(source);
  return city || source;
}

function initials(src) {
  if (!src) return "?";
  const city = cityFromSource(src);
  if (city) return city.slice(0, 2).toUpperCase();
  return src.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (isNaN(diff)) return "";
  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  return Math.floor(diff / 86400) + "d ago";
}

function whatsappShare(title, link) {
  const text = encodeURIComponent(`${title}\n${link}`);
  window.open(`https://wa.me/?text=${text}`, "_blank");
}

function formatSummaryDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short",
  }) + " · " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export default function App() {
  const [news, setNews] = useState([]);
  const [status, setStatus] = useState("idle");
  const [dark, setDark] = useState(false);
  const [activeFeedKey, setActiveFeedKey] = useState(null);
  const [activeTab, setActiveTab] = useState("feed");
  const [activeLabel, setActiveLabel] = useState("All");
  const [activeSource, setActiveSource] = useState("All");
  const [search, setSearch] = useState("");
  const [summary, setSummary] = useState(null);
  const [summaryStatus, setSummaryStatus] = useState("idle");
  const [lang, setLang] = useState("en");
  const t = TRANSLATIONS[lang];

  const currentFeed = FEEDS.find((f) => f.key === activeFeedKey) || FEEDS[0];

  const bg = dark ? "#0f0f0f" : "#ffffff";
  const textPrimary = dark ? "#f0f0ee" : "#1a1a1a";
  const textSecondary = dark ? "#888" : "#555";
  const textTertiary = dark ? "#555" : "#999";
  const border = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const skel = dark ? "#1e1e1e" : "#efefed";
  const tabBg = dark ? "#1a1a1a" : "#f5f5f3";
  const tabActiveBg = dark ? "#2a2a2a" : "#ffffff";
  const inputBg = dark ? "#1a1a1a" : "#f5f5f3";
  const cardBg = dark ? "#141414" : "#fafafa";

  async function fetchNews(feed) {
    setActiveFeedKey(feed.key);
    setActiveTab("feed");
    setActiveLabel("All");
    setActiveSource("All");
    setSearch("");
    setStatus("loading");
    setNews([]);
    setSummary(null);
    setSummaryStatus("idle");
    try {
      const res = await fetch(API_BASE + feed.endpoint);
      if (!res.ok) throw new Error("bad response");
      const data = await res.json();
      setNews(data);
      setStatus("success");
    } catch {
      setNews([]);
      setStatus("error");
    }
  }

  async function fetchSummary(feed) {
    setActiveTab("brief");
    if (summary && summaryStatus === "success") return;
    setSummaryStatus("loading");
    try {
      const res = await fetch(`${API_BASE}/news/summary/${feed.summaryKey}`);
      if (!res.ok) throw new Error("bad response");
      const data = await res.json();
      setSummary(data);
      setSummaryStatus("success");
    } catch {
      setSummaryStatus("error");
    }
  }

  const availableLabels = useMemo(() => {
    const counts = {};
    news.forEach((item) => {
      const lbl = item.label || "News";
      counts[lbl] = (counts[lbl] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({ label, count }));
  }, [news]);

  const availableSources = useMemo(() => {
    const counts = {};
    news.forEach((item) => {
      const s = item.source || "Unknown";
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([source, count]) => ({ source, count }));
  }, [news]);

  // Show source filter for tamil-nadu and tamil feeds
  const showSourceFilter = (activeFeedKey === "tamil-nadu" || activeFeedKey === "tamil") && availableSources.length > 1;

  const filteredNews = useMemo(() => {
    let result = news;
    if (activeLabel !== "All")
      result = result.filter((item) => (item.label || "News") === activeLabel);
    if (activeSource !== "All")
      result = result.filter((item) => (item.source || "") === activeSource);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((item) => (item.title || "").toLowerCase().includes(q));
    }
    return result;
  }, [news, activeLabel, activeSource, search]);

  function chipStyle(isActive) {
    return {
      fontSize: 12,
      padding: "4px 11px",
      borderRadius: 999,
      cursor: "pointer",
      fontFamily: "inherit",
      fontWeight: isActive ? 500 : 400,
      background: isActive ? currentFeed.bg : "transparent",
      color: isActive ? currentFeed.textColor : textTertiary,
      border: isActive ? `0.5px solid ${currentFeed.color}` : `0.5px solid ${border}`,
      transition: "all 0.15s",
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      whiteSpace: "nowrap",
    };
  }

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: bg, minHeight: "100vh", color: textPrimary, transition: "background 0.2s" }}>
      <div style={{ maxWidth: 660, margin: "0 auto", padding: "2rem 1.25rem 4rem" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#378ADD" }} />
            <span style={{ fontSize: 20, fontWeight: 500, letterSpacing: -0.5 }}>briefed</span>
            <span style={{ fontSize: 11, color: "#185FA5", background: "#E6F1FB", padding: "2px 8px", borderRadius: 999, fontWeight: 500 }}>live</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setLang((l) => (l === "en" ? "ta" : "en"))}
              style={{ fontSize: 12, color: textTertiary, background: "none", border: "0.5px solid " + border, borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit" }}
            >
              {lang === "en" ? "தமிழ்" : "EN"}
            </button>
            <button
              onClick={() => setDark((d) => !d)}
              style={{ fontSize: 12, color: textTertiary, background: "none", border: "0.5px solid " + border, borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit" }}
            >
              {dark ? t.light : t.dark}
            </button>
          </div>
        </div>

        {/* ── Feed Tabs ── */}
        <div style={{ display: "flex", gap: 6, marginBottom: "1rem", background: tabBg, borderRadius: 10, padding: 4 }}>
          {FEEDS.map((feed) => {
            const isActive = activeFeedKey === feed.key;
            const count = isActive && status === "success" ? news.length : null;
            return (
              <button
                key={feed.key}
                onClick={() => fetchNews(feed)}
                style={{ flex: 1, fontSize: 13, fontWeight: isActive ? 500 : 400, color: isActive ? feed.textColor : textSecondary, background: isActive ? tabActiveBg : "transparent", border: isActive ? "0.5px solid " + border : "none", borderRadius: 8, padding: "8px 0", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                {isActive && <span style={{ width: 6, height: 6, borderRadius: "50%", background: feed.color, display: "inline-block" }} />}
                {t.feeds[feed.key]}
                {count !== null && <span style={{ fontSize: 11, opacity: 0.55, fontWeight: 400 }}>{count}</span>}
              </button>
            );
          })}
        </div>

        {/* ── Sub-tabs ── */}
        {activeFeedKey && status === "success" && (
          <div style={{ display: "flex", gap: 6, marginBottom: "1rem" }}>
            <button
              onClick={() => setActiveTab("feed")}
              style={{ fontSize: 12, padding: "5px 14px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontWeight: activeTab === "feed" ? 500 : 400, background: activeTab === "feed" ? currentFeed.bg : "transparent", color: activeTab === "feed" ? currentFeed.textColor : textTertiary, border: activeTab === "feed" ? `0.5px solid ${currentFeed.color}` : `0.5px solid ${border}`, transition: "all 0.15s" }}
            >
              {t.allStories}
            </button>
            <button
              onClick={() => fetchSummary(currentFeed)}
              style={{ fontSize: 12, padding: "5px 14px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontWeight: activeTab === "brief" ? 500 : 400, background: activeTab === "brief" ? currentFeed.bg : "transparent", color: activeTab === "brief" ? currentFeed.textColor : textTertiary, border: activeTab === "brief" ? `0.5px solid ${currentFeed.color}` : `0.5px solid ${border}`, transition: "all 0.15s", display: "flex", alignItems: "center", gap: 5 }}
            >
              ✦ {t.todaysBrief}
              {summaryStatus === "loading" && (
                <span style={{ fontSize: 10, opacity: 0.6 }}>{t.generating}</span>
              )}
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TODAY'S BRIEF VIEW
        ══════════════════════════════════════════════ */}
        {activeTab === "brief" && activeFeedKey && (
          <div>
            {summaryStatus === "loading" && (
              <div>
                <div style={{ height: "0.5px", background: border, marginBottom: "1rem" }} />
                <div style={{ fontSize: 12, color: textTertiary, letterSpacing: 0.4, marginBottom: "1.25rem" }}>
                  {t.generatingBrief}
                </div>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} style={{ padding: "16px 0", borderBottom: "0.5px solid " + border }}>
                    <div style={{ height: 12, background: skel, borderRadius: 4, width: 30, marginBottom: 10 }} />
                    <div style={{ height: 15, background: skel, borderRadius: 4, width: "90%", marginBottom: 8 }} />
                    <div style={{ height: 13, background: skel, borderRadius: 4, width: "75%", marginBottom: 6 }} />
                    <div style={{ height: 13, background: skel, borderRadius: 4, width: "60%", marginBottom: 10 }} />
                    <div style={{ height: 11, background: skel, borderRadius: 4, width: 80 }} />
                  </div>
                ))}
              </div>
            )}

            {summaryStatus === "error" && (
              <div style={{ textAlign: "center", padding: "3rem 0" }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#A32D2D", marginBottom: 4 }}>{t.failedSummary}</div>
                <div style={{ fontSize: 13, color: textTertiary }}>{t.geminiError}</div>
              </div>
            )}

            {summaryStatus === "success" && summary && (
              <div>
                <div style={{ height: "0.5px", background: border, marginBottom: "1rem" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                  <div>
                    <div style={{ fontSize: 12, color: textTertiary, letterSpacing: 0.4, marginBottom: 4 }}>
                      {t.todaysBriefLabel} · {t.feeds[activeFeedKey].toUpperCase()}
                    </div>
                    <div style={{ fontSize: 13, color: textTertiary }}>
                      {formatSummaryDate(summary.generatedAt)}
                    </div>
                  </div>
                  {summary.fallback && (
                    <span style={{ fontSize: 10, color: textTertiary, background: dark ? "#1e1e1e" : "#f0f0ee", padding: "3px 8px", borderRadius: 4, border: "0.5px solid " + border }}>
                      {t.keywordMode}
                    </span>
                  )}
                </div>

                {summary.items.map((item) => (
                  <div key={item.rank} style={{ marginBottom: "1rem", padding: "14px 16px", borderRadius: 10, background: cardBg, border: "0.5px solid " + border }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: currentFeed.color, minWidth: 20 }}>
                        {item.rank}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.4, color: currentFeed.textColor, background: currentFeed.bg, padding: "2px 8px", borderRadius: 999, textTransform: "uppercase" }}>
                        {LABEL_EMOJI[item.label] || "📰"} {t.labels[item.label] || item.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.45, marginBottom: 8, color: textPrimary }}>
                      {item.headline}
                    </div>
                    {item.brief && (
                      <div style={{ fontSize: 13, lineHeight: 1.6, color: textSecondary, marginBottom: 10 }}>
                        {item.brief}
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 18, height: 18, borderRadius: 4, background: currentFeed.bg, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 600, color: currentFeed.textColor }}>
                          {initials(item.source)}
                        </span>
                        <span style={{ fontSize: 12, color: textSecondary }}>{item.source}</span>
                        {item.pubDate && (
                          <>
                            <span style={{ color: border, fontSize: 11 }}>·</span>
                            <span style={{ fontSize: 12, color: textTertiary }}>{timeAgo(item.pubDate)}</span>
                          </>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {item.link && (
                          <button
                            onClick={() => whatsappShare(item.headline, item.link)}
                            style={{ fontSize: 12, color: "#25D366", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
                          >
                            ↗ WhatsApp
                          </button>
                        )}
                        {item.link && (
                          <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: currentFeed.color, textDecoration: "none" }}>
                            {t.read}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <div style={{ textAlign: "center", paddingTop: "1rem", fontSize: 12, color: textTertiary }}>
                  {t.generatedNote} {news.length} {t.articles} · {t.poweredBy}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════
            FEED VIEW
        ══════════════════════════════════════════════ */}
        {activeTab === "feed" && (
          <div>
            {status === "success" && (
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontSize: 11, color: textTertiary, letterSpacing: 0.5, marginBottom: 6 }}>{t.category}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "nowrap", overflowX: "auto", paddingBottom: 4, marginBottom: "0.75rem", scrollbarWidth: "none" }}>
                  <button onClick={() => setActiveLabel("All")} style={chipStyle(activeLabel === "All")}>
                    {t.all} <span style={{ opacity: 0.55 }}>{news.length}</span>
                  </button>
                  {availableLabels.map(({ label, count }) => (
                    <button key={label} onClick={() => setActiveLabel(label)} style={chipStyle(activeLabel === label)}>
                      <span style={{ fontSize: 11 }}>{LABEL_EMOJI[label] || "📰"}</span>
                      {t.labels[label] || label}
                      <span style={{ opacity: 0.5 }}>{count}</span>
                    </button>
                  ))}
                </div>

                {showSourceFilter && (
                  <>
                    <div style={{ fontSize: 11, color: textTertiary, letterSpacing: 0.5, marginBottom: 6 }}>{t.source}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "nowrap", overflowX: "auto", paddingBottom: 4, marginBottom: "0.75rem", scrollbarWidth: "none" }}>
                      <button onClick={() => setActiveSource("All")} style={chipStyle(activeSource === "All")}>
                        {t.allSources}
                      </button>
                      {availableSources.map(({ source, count }) => (
                        <button key={source} onClick={() => setActiveSource(source)} style={chipStyle(activeSource === source)}>
                          {sourceShortLabel(source)}
                          <span style={{ opacity: 0.5 }}>{count}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box", fontSize: 13, padding: "8px 12px", borderRadius: 8, border: "0.5px solid " + border, background: inputBg, color: textPrimary, fontFamily: "inherit", outline: "none" }}
                />
              </div>
            )}

            <div style={{ height: "0.5px", background: border, marginBottom: "1rem" }} />

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <span style={{ fontSize: 12, color: textTertiary, letterSpacing: 0.4 }}>
                {status === "loading" ? t.loading : activeFeedKey ? t.feeds[activeFeedKey].toUpperCase() : t.selectFeed}
              </span>
              {status === "success" && (
                <span style={{ fontSize: 12, color: textTertiary }}>
                  {filteredNews.length} {t.articles}
                  {activeLabel !== "All" && <span style={{ color: currentFeed.color }}> · {t.labels[activeLabel] || activeLabel}</span>}
                  {activeSource !== "All" && <span style={{ color: currentFeed.color }}> · {sourceShortLabel(activeSource)}</span>}
                </span>
              )}
            </div>

            {status === "idle" && (
              <div style={{ textAlign: "center", padding: "4rem 0" }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: textPrimary, marginBottom: 6 }}>{t.whatRead}</div>
                <div style={{ fontSize: 13, color: textTertiary, marginBottom: 24 }}>{t.chooseFeed}</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
                  {FEEDS.map((feed) => (
                    <button key={feed.key} onClick={() => fetchNews(feed)} style={{ fontSize: 13, color: feed.textColor, background: feed.bg, border: "none", borderRadius: 8, padding: "8px 20px", cursor: "pointer", fontFamily: "inherit" }}>
                      {t.feeds[feed.key]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {status === "error" && (
              <div style={{ textAlign: "center", padding: "3rem 0" }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#A32D2D", marginBottom: 4 }}>{t.failedLoad}</div>
                <div style={{ fontSize: 13, color: textTertiary }}>{t.backendError}</div>
              </div>
            )}

            {status === "loading" && [1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ padding: "16px 0", borderBottom: "0.5px solid " + border }}>
                <div style={{ height: 14, background: skel, borderRadius: 4, width: "85%", marginBottom: 8 }} />
                <div style={{ height: 14, background: skel, borderRadius: 4, width: "60%", marginBottom: 10 }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ height: 12, background: skel, borderRadius: 4, width: 60 }} />
                  <div style={{ height: 12, background: skel, borderRadius: 4, width: 40 }} />
                </div>
              </div>
            ))}

            {status === "success" && filteredNews.length === 0 && (
              <div style={{ textAlign: "center", padding: "3rem 0" }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: textPrimary, marginBottom: 4 }}>{t.noArticles}</div>
                <div style={{ fontSize: 13, color: textTertiary }}>
                  {search || activeLabel !== "All" || activeSource !== "All" ? t.tryDifferent : t.tryLater}
                </div>
              </div>
            )}

            {status === "success" && filteredNews.map((item, i) => {
              const city = cityFromSource(item.source);
              return (
                <div key={item.link || i} style={{ padding: "16px 0", borderBottom: "0.5px solid " + border, borderTop: i === 0 ? "0.5px solid " + border : "none" }}>
                  {(item.label && item.label !== "News" || city) && (
                    <div style={{ marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                      {item.label && item.label !== "News" && (
                        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.4, color: currentFeed.textColor, background: currentFeed.bg, padding: "2px 8px", borderRadius: 999, textTransform: "uppercase" }}>
                          {LABEL_EMOJI[item.label]} {t.labels[item.label] || item.label}
                        </span>
                      )}
                      {city && (
                        <span style={{ fontSize: 10, fontWeight: 500, color: textTertiary, background: dark ? "#1e1e1e" : "#f0f0ee", padding: "2px 7px", borderRadius: 4, border: "0.5px solid " + border }}>
                          {city}
                        </span>
                      )}
                    </div>
                  )}
                  <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.45, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", color: textPrimary }}>
                    {item.title}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 18, height: 18, borderRadius: 4, background: currentFeed.bg, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 600, color: currentFeed.textColor }}>
                        {initials(item.source)}
                      </span>
                      <span style={{ fontSize: 12, color: textSecondary }}>{item.source}</span>
                      {item.pubDate && (
                        <>
                          <span style={{ color: border, fontSize: 11 }}>·</span>
                          <span style={{ fontSize: 12, color: textTertiary }}>{timeAgo(item.pubDate)}</span>
                        </>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <button
                        onClick={() => whatsappShare(item.title, item.link)}
                        style={{ fontSize: 12, color: "#25D366", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
                      >
                        ↗ WhatsApp
                      </button>
                      <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: currentFeed.color, textDecoration: "none" }}>
                        {t.read}
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}