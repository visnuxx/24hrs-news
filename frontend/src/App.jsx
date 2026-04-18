import { useState, useEffect, useMemo, useCallback } from "react";

// ---------- Constants ----------
const API_BASE = "https://two4hrs-news.onrender.com";

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
    generating: "generating...", generatingBrief: "Generating brief...",
    category: "Category", source: "Source",
    searchPlaceholder: "Search headlines...",
    all: "All", allSources: "All sources",
    read: "Read", share: "Share",
    loading: "Loading...", selectFeed: "Select a feed",
    whatRead: "What would you like to read?",
    chooseFeed: "Choose a feed above",
    failedLoad: "Failed to load",
    backendError: "Backend not reachable (port 5000)",
    noArticles: "No articles found",
    tryDifferent: "Try a different filter",
    tryLater: "Try again later",
    todaysBriefLabel: "Today's Brief",
    generatedNote: "Generated once daily from",
    articles: "articles",
    poweredBy: "Powered by Gemini",
    failedSummary: "Summary unavailable",
    geminiError: "Check GEMINI_API_KEY",
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
    read: "படிக்க", share: "பகிர்",
    loading: "ஏற்றுகிறது...", selectFeed: "ஒரு செய்தி தேர்ந்தெடுக்கவும்",
    whatRead: "என்ன படிக்க விரும்புகிறீர்கள்?",
    chooseFeed: "மேலே ஒரு செய்தி தேர்ந்தெடுக்கவும்",
    failedLoad: "ஏற்றல் தோல்வி",
    backendError: "பின்தள சேவை இயங்கவில்லை",
    noArticles: "செய்திகள் இல்லை",
    tryDifferent: "வேறு வடிகட்டி முயற்சிக்கவும்",
    tryLater: "பின்னர் முயற்சிக்கவும்",
    todaysBriefLabel: "இன்றைய சுருக்கம்",
    generatedNote: "தினமும் ஒருமுறை",
    articles: "செய்திகள்",
    poweredBy: "Gemini மூலம்",
    failedSummary: "சுருக்கம் தோல்வி",
    geminiError: "GEMINI_API_KEY சரிபார்க்கவும்",
    keywordMode: "முக்கியசொல் முறை",
    feeds: { "tamil-nadu": "தமிழ்நாடு", international: "உலகம்", tamil: "தமிழ்" },
    labels: {
      Politics: "அரசியல்", Business: "வணிகம்", Technology: "தொழில்நுட்பம்",
      Sports: "விளையாட்டு", Crime: "குற்றம்", Entertainment: "பொழுதுபோக்கு",
      Health: "சுகாதாரம்", Climate: "காலநிலை", World: "உலகம்", Conflict: "மோதல்",
    },
  },
};

// ---------- Utility Functions ----------
const cityFromSource = (source) => {
  if (!source) return null;
  const match = source.match(/Google News · (.+)/);
  return match ? match[1] : null;
};

const sourceShortLabel = (source) => {
  if (!source) return source;
  return cityFromSource(source) || source;
};

const initials = (src) => {
  if (!src) return "?";
  const city = cityFromSource(src);
  if (city) return city.slice(0, 2).toUpperCase();
  return src.trim().split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
};

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (isNaN(diff)) return "";
  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + "m";
  if (diff < 86400) return Math.floor(diff / 3600) + "h";
  return Math.floor(diff / 86400) + "d";
};

const formatSummaryDate = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short",
  }) + " · " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

const whatsappShare = (title, link) => {
  const text = encodeURIComponent(`${title}\n${link}`);
  window.open(`https://wa.me/?text=${text}`, "_blank");
};

// ---------- Styles (CSS Variables) ----------
const theme = {
  light: {
    bg: "#faf9f6",
    surface: "#ffffff",
    textPrimary: "#1e1e1e",
    textSecondary: "#5e5e5e",
    textTertiary: "#8a8a8a",
    border: "rgba(0,0,0,0.08)",
    skeleton: "#eaeaea",
    inputBg: "#f3f3f1",
    shadow: "0 4px 12px rgba(0,0,0,0.04)",
    cardBg: "#ffffff",
  },
  dark: {
    bg: "#0f0f0f",
    surface: "#1c1c1c",
    textPrimary: "#ededed",
    textSecondary: "#a0a0a0",
    textTertiary: "#6a6a6a",
    border: "rgba(255,255,255,0.08)",
    skeleton: "#2a2a2a",
    inputBg: "#1e1e1e",
    shadow: "0 8px 20px rgba(0,0,0,0.5)",
    cardBg: "#181818",
  },
};

// ---------- Sub-components ----------
const Header = ({ lang, setLang, dark, setDark, t }) => (
  <header style={styles.header}>
    <div style={styles.logo}>
      <span style={styles.logoDot} />
      <span style={styles.logoText}>briefed</span>
      <span style={styles.liveBadge}>live</span>
    </div>
    <div style={styles.headerActions}>
      <button onClick={() => setLang(l => l === "en" ? "ta" : "en")} style={styles.langButton(dark)}>
        {lang === "en" ? "தமிழ்" : "EN"}
      </button>
      <button onClick={() => setDark(d => !d)} style={styles.themeButton(dark)}>
        {dark ? t.light : t.dark}
      </button>
    </div>
  </header>
);

const FeedTabs = ({ feeds, activeFeed, onSelect, newsCount, status, t, dark }) => (
  <div style={styles.feedTabs(dark)}>
    {feeds.map(feed => {
      const isActive = activeFeed?.key === feed.key;
      const count = isActive && status === "success" ? newsCount : null;
      return (
        <button
          key={feed.key}
          onClick={() => onSelect(feed)}
          style={styles.feedTab(isActive, feed, dark)}
        >
          {isActive && <span style={styles.feedTabDot(feed.color)} />}
          {t.feeds[feed.key]}
          {count !== null && <span style={styles.countBadge}>{count}</span>}
        </button>
      );
    })}
  </div>
);

const ViewToggle = ({ activeTab, onSelect, currentFeed, summaryStatus, t, dark }) => (
  <div style={styles.viewToggle}>
    <button
      onClick={() => onSelect("feed")}
      style={styles.viewToggleBtn(activeTab === "feed", currentFeed, dark)}
    >
      {t.allStories}
    </button>
    <button
      onClick={() => onSelect("brief")}
      style={styles.viewToggleBtn(activeTab === "brief", currentFeed, dark)}
    >
      <span style={styles.briefIcon}>✦</span> {t.todaysBrief}
      {summaryStatus === "loading" && <span style={styles.generatingText}>{t.generating}</span>}
    </button>
  </div>
);

const FilterBar = ({
  labels, activeLabel, setActiveLabel,
  sources, activeSource, setActiveSource,
  search, setSearch, showSourceFilter,
  currentFeed, t, dark, newsLength
}) => (
  <div style={styles.filterBar}>
    <div style={styles.filterSection}>
      <div style={styles.filterLabel}>{t.category}</div>
      <div style={styles.chipContainer}>
        <button onClick={() => setActiveLabel("All")} style={styles.chip(activeLabel === "All", currentFeed, dark)}>
          {t.all} <span style={styles.chipCount}>{newsLength}</span>
        </button>
        {labels.map(({ label, count }) => (
          <button key={label} onClick={() => setActiveLabel(label)} style={styles.chip(activeLabel === label, currentFeed, dark)}>
            <span>{LABEL_EMOJI[label] || "📰"}</span>
            {t.labels[label] || label}
            <span style={styles.chipCount}>{count}</span>
          </button>
        ))}
      </div>
    </div>

    {showSourceFilter && (
      <div style={styles.filterSection}>
        <div style={styles.filterLabel}>{t.source}</div>
        <div style={styles.chipContainer}>
          <button onClick={() => setActiveSource("All")} style={styles.chip(activeSource === "All", currentFeed, dark)}>
            {t.allSources}
          </button>
          {sources.map(({ source, count }) => (
            <button key={source} onClick={() => setActiveSource(source)} style={styles.chip(activeSource === source, currentFeed, dark)}>
              {sourceShortLabel(source)}
              <span style={styles.chipCount}>{count}</span>
            </button>
          ))}
        </div>
      </div>
    )}

    <input
      type="text"
      placeholder={t.searchPlaceholder}
      value={search}
      onChange={e => setSearch(e.target.value)}
      style={styles.searchInput(dark)}
    />
  </div>
);

const ArticleCard = ({ item, currentFeed, t, dark }) => {
  const city = cityFromSource(item.source);
  return (
    <article style={styles.articleCard(dark)}>
      {(item.label && item.label !== "News" || city) && (
        <div style={styles.cardMeta}>
          {item.label && item.label !== "News" && (
            <span style={styles.labelBadge(currentFeed)}>
              {LABEL_EMOJI[item.label]} {t.labels[item.label] || item.label}
            </span>
          )}
          {city && <span style={styles.cityBadge(dark)}>{city}</span>}
        </div>
      )}
      <h3 style={styles.cardTitle(dark)}>{item.title}</h3>
      <div style={styles.cardFooter}>
        <div style={styles.sourceInfo}>
          <span style={styles.sourceInitials(currentFeed)}>{initials(item.source)}</span>
          <span style={styles.sourceName(dark)}>{item.source}</span>
          {item.pubDate && (
            <>
              <span style={styles.separator}>·</span>
              <span style={styles.timeAgo(dark)}>{timeAgo(item.pubDate)}</span>
            </>
          )}
        </div>
        <div style={styles.cardActions}>
          <button onClick={() => whatsappShare(item.title, item.link)} style={styles.shareButton}>
            ↗ {t.share}
          </button>
          <a href={item.link} target="_blank" rel="noopener noreferrer" style={styles.readLink(currentFeed.color)}>
            {t.read}
          </a>
        </div>
      </div>
    </article>
  );
};

const BriefCard = ({ item, rank, currentFeed, t, dark }) => (
  <div style={styles.briefCard(dark)}>
    <div style={styles.briefHeader}>
      <span style={styles.briefRank(currentFeed.color)}>{rank}</span>
      <span style={styles.briefLabel(currentFeed)}>
        {LABEL_EMOJI[item.label] || "📰"} {t.labels[item.label] || item.label}
      </span>
    </div>
    <h4 style={styles.briefHeadline(dark)}>{item.headline}</h4>
    {item.brief && <p style={styles.briefText(dark)}>{item.brief}</p>}
    <div style={styles.cardFooter}>
      <div style={styles.sourceInfo}>
        <span style={styles.sourceInitials(currentFeed)}>{initials(item.source)}</span>
        <span style={styles.sourceName(dark)}>{item.source}</span>
        {item.pubDate && (
          <>
            <span style={styles.separator}>·</span>
            <span style={styles.timeAgo(dark)}>{timeAgo(item.pubDate)}</span>
          </>
        )}
      </div>
      <div style={styles.cardActions}>
        <button onClick={() => whatsappShare(item.headline, item.link)} style={styles.shareButton}>
          ↗ {t.share}
        </button>
        {item.link && (
          <a href={item.link} target="_blank" rel="noopener noreferrer" style={styles.readLink(currentFeed.color)}>
            {t.read}
          </a>
        )}
      </div>
    </div>
  </div>
);

const SkeletonCard = ({ dark }) => (
  <div style={styles.skeletonCard(dark)}>
    <div style={styles.skeletonLine("80%", 14, dark)} />
    <div style={styles.skeletonLine("60%", 14, dark, 8)} />
    <div style={styles.skeletonFooter}>
      <div style={styles.skeletonLine("60px", 12, dark)} />
      <div style={styles.skeletonLine("40px", 12, dark)} />
    </div>
  </div>
);

// ---------- Main App Component ----------
export default function App() {
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState("en");
  const t = TRANSLATIONS[lang];
  const currentTheme = dark ? theme.dark : theme.light;

  // Data state
  const [news, setNews] = useState([]);
  const [status, setStatus] = useState("idle");
  const [activeFeed, setActiveFeed] = useState(null);
  const [activeTab, setActiveTab] = useState("feed");
  const [activeLabel, setActiveLabel] = useState("All");
  const [activeSource, setActiveSource] = useState("All");
  const [search, setSearch] = useState("");
  const [summary, setSummary] = useState(null);
  const [summaryStatus, setSummaryStatus] = useState("idle");

  const currentFeed = activeFeed || FEEDS[0];

  // Derived data
  const availableLabels = useMemo(() => {
    const counts = {};
    news.forEach(item => { const lbl = item.label || "News"; counts[lbl] = (counts[lbl] || 0) + 1; });
    return Object.entries(counts).sort((a,b) => b[1]-a[1]).map(([label, count]) => ({ label, count }));
  }, [news]);

  const availableSources = useMemo(() => {
    const counts = {};
    news.forEach(item => { const s = item.source || "Unknown"; counts[s] = (counts[s] || 0) + 1; });
    return Object.entries(counts).sort((a,b) => b[1]-a[1]).map(([source, count]) => ({ source, count }));
  }, [news]);

  const showSourceFilter = (activeFeed?.key === "tamil-nadu" || activeFeed?.key === "tamil") && availableSources.length > 1;

  const filteredNews = useMemo(() => {
    let result = news;
    if (activeLabel !== "All") result = result.filter(item => (item.label || "News") === activeLabel);
    if (activeSource !== "All") result = result.filter(item => (item.source || "") === activeSource);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(item => (item.title || "").toLowerCase().includes(q));
    }
    return result;
  }, [news, activeLabel, activeSource, search]);

  // Fetch handlers
  const fetchNews = useCallback(async (feed) => {
    setActiveFeed(feed);
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
  }, []);

  const fetchSummary = useCallback(async (feed) => {
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
  }, [summary, summaryStatus]);

  // Initial load
  useEffect(() => {
    fetchNews(FEEDS[0]);
  }, [fetchNews]);

  return (
    <div style={{ ...styles.app, backgroundColor: currentTheme.bg, color: currentTheme.textPrimary }}>
      <div style={styles.container}>
        <Header lang={lang} setLang={setLang} dark={dark} setDark={setDark} t={t} />

        <FeedTabs
          feeds={FEEDS}
          activeFeed={activeFeed}
          onSelect={fetchNews}
          newsCount={news.length}
          status={status}
          t={t}
          dark={dark}
        />

        {activeFeed && status === "success" && (
          <>
            <ViewToggle
              activeTab={activeTab}
              onSelect={(tab) => tab === "brief" ? fetchSummary(currentFeed) : setActiveTab("feed")}
              currentFeed={currentFeed}
              summaryStatus={summaryStatus}
              t={t}
              dark={dark}
            />

            {activeTab === "feed" && (
              <FilterBar
                labels={availableLabels}
                activeLabel={activeLabel}
                setActiveLabel={setActiveLabel}
                sources={availableSources}
                activeSource={activeSource}
                setActiveSource={setActiveSource}
                search={search}
                setSearch={setSearch}
                showSourceFilter={showSourceFilter}
                currentFeed={currentFeed}
                t={t}
                dark={dark}
                newsLength={news.length}
              />
            )}
          </>
        )}

        <div style={styles.contentDivider(dark)} />

        {/* Status indicators */}
        {status === "idle" && (
          <div style={styles.emptyState}>
            <h3 style={styles.emptyTitle(dark)}>{t.whatRead}</h3>
            <p style={styles.emptySub(dark)}>{t.chooseFeed}</p>
            <div style={styles.feedButtons}>
              {FEEDS.map(feed => (
                <button key={feed.key} onClick={() => fetchNews(feed)} style={styles.feedButton(feed)}>
                  {t.feeds[feed.key]}
                </button>
              ))}
            </div>
          </div>
        )}

        {status === "error" && (
          <div style={styles.errorState}>
            <div style={styles.errorTitle}>⚠️ {t.failedLoad}</div>
            <div style={styles.errorSub(dark)}>{t.backendError}</div>
          </div>
        )}

        {/* Brief View */}
        {activeTab === "brief" && activeFeed && (
          <div>
            {summaryStatus === "loading" && (
              <div>
                <div style={styles.generatingHeader(dark)}>{t.generatingBrief}</div>
                {[1,2,3,4].map(i => <SkeletonCard key={i} dark={dark} />)}
              </div>
            )}
            {summaryStatus === "error" && (
              <div style={styles.errorState}>
                <div style={styles.errorTitle}>⚠️ {t.failedSummary}</div>
                <div style={styles.errorSub(dark)}>{t.geminiError}</div>
              </div>
            )}
            {summaryStatus === "success" && summary && (
              <div>
                <div style={styles.briefMeta}>
                  <div>
                    <div style={styles.briefTitle(dark)}>{t.todaysBriefLabel} · {t.feeds[activeFeed.key].toUpperCase()}</div>
                    <div style={styles.briefDate(dark)}>{formatSummaryDate(summary.generatedAt)}</div>
                  </div>
                  {summary.fallback && <span style={styles.fallbackBadge(dark)}>{t.keywordMode}</span>}
                </div>
                {summary.items.map((item, idx) => (
                  <BriefCard key={item.rank || idx} item={item} rank={item.rank} currentFeed={currentFeed} t={t} dark={dark} />
                ))}
                <div style={styles.briefFooter(dark)}>
                  {t.generatedNote} {news.length} {t.articles} · {t.poweredBy}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Feed View */}
        {activeTab === "feed" && (
          <div>
            <div style={styles.feedStats(dark)}>
              <span>{status === "loading" ? t.loading : activeFeed ? t.feeds[activeFeed.key].toUpperCase() : t.selectFeed}</span>
              {status === "success" && (
                <span>
                  {filteredNews.length} {t.articles}
                  {activeLabel !== "All" && <span style={{ color: currentFeed.color }}> · {t.labels[activeLabel] || activeLabel}</span>}
                  {activeSource !== "All" && <span style={{ color: currentFeed.color }}> · {sourceShortLabel(activeSource)}</span>}
                </span>
              )}
            </div>

            {status === "loading" && [1,2,3,4,5].map(i => <SkeletonCard key={i} dark={dark} />)}

            {status === "success" && filteredNews.length === 0 && (
              <div style={styles.emptyState}>
                <div style={styles.emptyTitle(dark)}>{t.noArticles}</div>
                <div style={styles.emptySub(dark)}>{search || activeLabel !== "All" || activeSource !== "All" ? t.tryDifferent : t.tryLater}</div>
              </div>
            )}

            {status === "success" && filteredNews.map((item, i) => (
              <ArticleCard key={item.link || i} item={item} currentFeed={currentFeed} t={t} dark={dark} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Styles (inline with theme variables) ----------
const styles = {
  app: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    minHeight: "100vh",
    transition: "background-color 0.2s ease",
  },
  container: {
    maxWidth: 700,
    margin: "0 auto",
    padding: "2rem 1.5rem 4rem",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "2rem",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#378ADD",
    boxShadow: "0 0 0 2px rgba(55,138,221,0.2)",
  },
  logoText: {
    fontSize: 22,
    fontWeight: 600,
    letterSpacing: -0.5,
    color: "inherit",
  },
  liveBadge: {
    fontSize: 11,
    fontWeight: 600,
    color: "#185FA5",
    background: "#E6F1FB",
    padding: "3px 10px",
    borderRadius: 20,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  headerActions: {
    display: "flex",
    gap: 8,
  },
  langButton: (dark) => ({
    fontSize: 13,
    fontWeight: 500,
    color: dark ? "#aaa" : "#666",
    background: "transparent",
    border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"}`,
    borderRadius: 20,
    padding: "6px 14px",
    cursor: "pointer",
    transition: "all 0.15s",
  }),
  themeButton: (dark) => ({
    fontSize: 13,
    fontWeight: 500,
    color: dark ? "#aaa" : "#666",
    background: "transparent",
    border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"}`,
    borderRadius: 20,
    padding: "6px 14px",
    cursor: "pointer",
    transition: "all 0.15s",
  }),
  feedTabs: (dark) => ({
    display: "flex",
    gap: 6,
    marginBottom: 20,
    background: dark ? "#1c1c1c" : "#f0f0ee",
    borderRadius: 14,
    padding: 5,
  }),
  feedTab: (isActive, feed, dark) => ({
    flex: 1,
    fontSize: 14,
    fontWeight: isActive ? 600 : 400,
    color: isActive ? feed.textColor : (dark ? "#aaa" : "#555"),
    background: isActive ? (dark ? "#2a2a2a" : "#ffffff") : "transparent",
    border: isActive ? `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}` : "none",
    borderRadius: 10,
    padding: "10px 0",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transition: "all 0.2s",
    boxShadow: isActive ? "0 2px 6px rgba(0,0,0,0.04)" : "none",
  }),
  feedTabDot: (color) => ({
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: color,
    display: "inline-block",
  }),
  countBadge: {
    fontSize: 12,
    opacity: 0.7,
    fontWeight: 400,
  },
  viewToggle: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
  },
  viewToggleBtn: (isActive, feed, dark) => ({
    fontSize: 13,
    padding: "8px 18px",
    borderRadius: 30,
    cursor: "pointer",
    fontWeight: isActive ? 500 : 400,
    background: isActive ? feed.bg : "transparent",
    color: isActive ? feed.textColor : (dark ? "#999" : "#666"),
    border: isActive ? `1px solid ${feed.color}40` : `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
    transition: "all 0.15s",
    display: "flex",
    alignItems: "center",
    gap: 6,
  }),
  briefIcon: {
    fontSize: 14,
  },
  generatingText: {
    fontSize: 11,
    opacity: 0.7,
    marginLeft: 4,
  },
  filterBar: {
    marginBottom: 24,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#888",
    marginBottom: 8,
  },
  chipContainer: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  chip: (isActive, feed, dark) => ({
    fontSize: 12,
    padding: "6px 14px",
    borderRadius: 30,
    cursor: "pointer",
    fontWeight: isActive ? 500 : 400,
    background: isActive ? feed.bg : "transparent",
    color: isActive ? feed.textColor : (dark ? "#aaa" : "#666"),
    border: isActive ? `1px solid ${feed.color}60` : `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
    transition: "all 0.15s",
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    whiteSpace: "nowrap",
  }),
  chipCount: {
    opacity: 0.6,
    fontSize: 11,
  },
  searchInput: (dark) => ({
    width: "100%",
    boxSizing: "border-box",
    fontSize: 14,
    padding: "12px 16px",
    borderRadius: 14,
    border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
    background: dark ? "#1c1c1c" : "#ffffff",
    color: dark ? "#eee" : "#222",
    outline: "none",
    transition: "border 0.15s",
    marginTop: 4,
  }),
  contentDivider: (dark) => ({
    height: 1,
    background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
    margin: "20px 0 24px",
  }),
  feedStats: (dark) => ({
    display: "flex",
    justifyContent: "space-between",
    fontSize: 12,
    color: dark ? "#888" : "#777",
    marginBottom: 16,
  }),
  articleCard: (dark) => ({
    padding: "20px 0",
    borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
  }),
  cardMeta: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  labelBadge: (feed) => ({
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: 0.3,
    color: feed.textColor,
    background: feed.bg,
    padding: "3px 10px",
    borderRadius: 20,
    textTransform: "uppercase",
  }),
  cityBadge: (dark) => ({
    fontSize: 10,
    fontWeight: 500,
    color: dark ? "#aaa" : "#666",
    background: dark ? "#2a2a2a" : "#f0f0ee",
    padding: "3px 8px",
    borderRadius: 6,
    border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
  }),
  cardTitle: (dark) => ({
    fontSize: 16,
    fontWeight: 600,
    lineHeight: 1.45,
    margin: "0 0 12px",
    color: dark ? "#f0f0f0" : "#1a1a1a",
  }),
  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sourceInfo: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  sourceInitials: (feed) => ({
    width: 22,
    height: 22,
    borderRadius: 6,
    background: feed.bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 9,
    fontWeight: 700,
    color: feed.textColor,
  }),
  sourceName: (dark) => ({
    fontSize: 12,
    color: dark ? "#aaa" : "#666",
  }),
  separator: {
    color: "rgba(0,0,0,0.2)",
    fontSize: 12,
    margin: "0 2px",
  },
  timeAgo: (dark) => ({
    fontSize: 12,
    color: dark ? "#777" : "#999",
  }),
  cardActions: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  shareButton: {
    fontSize: 12,
    color: "#25D366",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    fontWeight: 500,
  },
  readLink: (color) => ({
    fontSize: 12,
    fontWeight: 500,
    color: color,
    textDecoration: "none",
  }),
  briefCard: (dark) => ({
    padding: "20px",
    marginBottom: 12,
    borderRadius: 18,
    background: dark ? "#1c1c1c" : "#ffffff",
    border: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}`,
    boxShadow: dark ? "none" : "0 4px 12px rgba(0,0,0,0.02)",
  }),
  briefHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  briefRank: (color) => ({
    fontSize: 15,
    fontWeight: 700,
    color: color,
    minWidth: 24,
  }),
  briefLabel: (feed) => ({
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: 0.4,
    color: feed.textColor,
    background: feed.bg,
    padding: "3px 10px",
    borderRadius: 20,
    textTransform: "uppercase",
  }),
  briefHeadline: (dark) => ({
    fontSize: 16,
    fontWeight: 600,
    lineHeight: 1.4,
    margin: "0 0 8px",
    color: dark ? "#f0f0f0" : "#1a1a1a",
  }),
  briefText: (dark) => ({
    fontSize: 13,
    lineHeight: 1.6,
    color: dark ? "#aaa" : "#555",
    margin: "0 0 16px",
  }),
  briefMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  briefTitle: (dark) => ({
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: 0.3,
    color: dark ? "#aaa" : "#666",
    marginBottom: 4,
  }),
  briefDate: (dark) => ({
    fontSize: 12,
    color: dark ? "#777" : "#999",
  }),
  fallbackBadge: (dark) => ({
    fontSize: 10,
    color: dark ? "#aaa" : "#666",
    background: dark ? "#2a2a2a" : "#f0f0ee",
    padding: "4px 10px",
    borderRadius: 20,
    border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
  }),
  briefFooter: (dark) => ({
    textAlign: "center",
    paddingTop: 20,
    fontSize: 12,
    color: dark ? "#777" : "#999",
  }),
  skeletonCard: (dark) => ({
    padding: "20px 0",
    borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
  }),
  skeletonLine: (width, height, dark, marginBottom = 6) => ({
    width,
    height,
    background: dark ? "#2a2a2a" : "#eaeaea",
    borderRadius: 6,
    marginBottom,
  }),
  skeletonFooter: {
    display: "flex",
    gap: 12,
    marginTop: 12,
  },
  emptyState: {
    textAlign: "center",
    padding: "4rem 0",
  },
  emptyTitle: (dark) => ({
    fontSize: 18,
    fontWeight: 500,
    color: dark ? "#ddd" : "#333",
    marginBottom: 8,
  }),
  emptySub: (dark) => ({
    fontSize: 14,
    color: dark ? "#888" : "#777",
    marginBottom: 24,
  }),
  feedButtons: {
    display: "flex",
    justifyContent: "center",
    gap: 12,
  },
  feedButton: (feed) => ({
    fontSize: 14,
    fontWeight: 500,
    color: feed.textColor,
    background: feed.bg,
    border: "none",
    borderRadius: 30,
    padding: "10px 24px",
    cursor: "pointer",
    transition: "transform 0.1s",
  }),
  errorState: {
    textAlign: "center",
    padding: "3rem 0",
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "#c0392b",
    marginBottom: 8,
  },
  errorSub: (dark) => ({
    fontSize: 13,
    color: dark ? "#888" : "#777",
  }),
  generatingHeader: (dark) => ({
    fontSize: 12,
    color: dark ? "#888" : "#777",
    letterSpacing: 0.5,
    marginBottom: 16,
  }),
};