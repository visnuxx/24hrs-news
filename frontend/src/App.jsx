import { useState, useEffect, useMemo, useCallback } from "react";
import "./styles/globalStyles.js";
import { API_BASE, FEEDS, TAMIL_FEED } from "./constants/news.js";
import { TRANSLATIONS } from "./constants/translations.js";
import { applyTheme } from "./utils/theme.js";
import {
  Header,
  FeedTabs,
  HeroBanner,
  BriefingView,
  FilterBar,
  FeedMeta,
  NewsCard,
  ListItem,
  SkeletonGrid,
  SkeletonList,
  EmptyState,
} from "./components/index.jsx";
function App() {
  const [dark, setDark]         = useState(false);
  const [lang, setLang]         = useState("en");
  const t = TRANSLATIONS[lang];

  const [news, setNews]             = useState([]);
  const [status, setStatus]         = useState("idle");
  const [activeFeed, setActiveFeed] = useState(null);

  // "feed" | "briefing"
  const [activeTab, setActiveTab]       = useState("feed");
  const [activeLabel, setActiveLabel]   = useState("All");
  const [activeSource, setActiveSource] = useState("All");
  const [search, setSearch]             = useState("");
  const [viewMode, setViewMode]         = useState("grid");
  const [advOpen, setAdvOpen]           = useState(false);

  const [tamilSubActive, setTamilSubActive] = useState(false);
  const [tamilSubNews, setTamilSubNews]     = useState([]);
  const [tamilSubStatus, setTamilSubStatus] = useState("idle");

  const currentFeed   = activeFeed || FEEDS[0];
  const displayNews   = tamilSubActive ? tamilSubNews : news;
  const displayStatus = tamilSubActive ? tamilSubStatus : status;
  const useCardLayout = activeFeed?.key !== "tamil" && !tamilSubActive;

  useEffect(() => { applyTheme(dark); }, [dark]);

  const availableLabels = useMemo(() => {
    const c = {};
    displayNews.forEach(i => { const l = i.label || "News"; c[l] = (c[l] || 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1]).map(([label, count]) => ({ label, count }));
  }, [displayNews]);

  const availableSources = useMemo(() => {
    const c = {};
    displayNews.forEach(i => { const s = i.source || "Unknown"; c[s] = (c[s] || 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1]).map(([source, count]) => ({ source, count }));
  }, [displayNews]);

  const filteredNews = useMemo(() => {
    let r = displayNews;
    if (activeLabel !== "All") r = r.filter(i => (i.label || "News") === activeLabel);
    if (activeSource !== "All") r = r.filter(i => (i.source || "") === activeSource);
    if (search.trim()) { const q = search.trim().toLowerCase(); r = r.filter(i => (i.title || "").toLowerCase().includes(q)); }
    return r;
  }, [displayNews, activeLabel, activeSource, search]);

  const fetchNews = useCallback(async (feed) => {
    setActiveFeed(feed);
    setActiveTab("feed");
    setActiveLabel("All"); setActiveSource("All"); setSearch("");
    setStatus("loading"); setNews([]);
    setTamilSubActive(false); setTamilSubNews([]); setTamilSubStatus("idle");
    try {
      const res = await fetch(API_BASE + feed.endpoint);
      if (!res.ok) throw new Error();
      setNews(await res.json());
      setStatus("success");
    } catch { setStatus("error"); }
  }, []);

  const handleTamilSub = useCallback(async () => {
    if (tamilSubActive) {
      setTamilSubActive(false);
      setActiveLabel("All"); setActiveSource("All"); setSearch("");
      return;
    }
    setTamilSubActive(true);
    setActiveLabel("All"); setActiveSource("All"); setSearch("");
    if (tamilSubNews.length > 0) return;
    setTamilSubStatus("loading");
    try {
      const res = await fetch(API_BASE + "/news/tamil");
      if (!res.ok) throw new Error();
      setTamilSubNews(await res.json());
      setTamilSubStatus("success");
    } catch { setTamilSubStatus("error"); }
  }, [tamilSubActive, tamilSubNews]);

  useEffect(() => { fetchNews(FEEDS[0]); }, [fetchNews]);

  const showFilters = status === "success" || tamilSubActive;
  const showHero    = status === "success" || status === "loading";

  const TabPill = ({ id, label, icon }) => {
    const on = activeTab === id;
    return (
      <button
        onClick={() => setActiveTab(id)}
        style={{
          fontSize:12, fontWeight: on ? 600 : 400,
          color: on ? currentFeed.ink : "var(--text3)",
          background: on ? currentFeed.fill : "transparent",
          border: on ? `1px solid ${currentFeed.accent}40` : "1px solid transparent",
          borderRadius:100, padding:"6px 16px",
          display:"flex", alignItems:"center", gap:5,
          transition:"all 0.18s", cursor:"pointer", whiteSpace:"nowrap",
        }}
      >
        {icon} {label}
      </button>
    );
  };

  return (
    <div style={{
      fontFamily:"'Inter',-apple-system,sans-serif",
      background:"var(--bg)", color:"var(--text1)",
      minHeight:"100vh", transition:"background 0.2s, color 0.2s",
    }}>
      <div style={{ maxWidth:1040, margin:"0 auto", padding:"0 20px 64px" }}>

        <Header dark={dark} setDark={setDark} t={t} />

        <FeedTabs
          activeFeed={activeFeed} onSelect={fetchNews}
          newsCount={news.length} status={status}
          t={t} dark={dark}
        />

        {showHero && (
          <HeroBanner
            activeFeed={activeFeed}
            onReadBriefing={() => setActiveTab("briefing")}
            t={t}
          />
        )}

        {(status === "success" || activeTab === "briefing") && (
          <div style={{
            display:"flex", gap:6, marginBottom:20,
            padding:"4px", background:"var(--surface)",
            border:"1px solid var(--border)", borderRadius:100,
            width:"fit-content", flexWrap:"wrap",
          }}>
            <TabPill id="feed"     label={t.allStories} icon="📋" />
            <TabPill id="briefing" label={t.briefing}   icon="✦"  />
          </div>
        )}

        {/* ---- BRIEFING VIEW ---- */}
        {activeTab === "briefing" && activeFeed && (
          <BriefingView
            feedKey={activeFeed.key}
            digestKey={activeFeed.digestKey}
            t={t}
          />
        )}

        {/* ---- FEED VIEW ---- */}
        {activeTab === "feed" && (
          <>
            {showFilters && (
              <FilterBar
                labels={availableLabels} activeLabel={activeLabel} setActiveLabel={v => setActiveLabel(v)}
                sources={availableSources} activeSource={activeSource} setActiveSource={v => setActiveSource(v)}
                search={search} setSearch={setSearch}
                currentFeed={currentFeed} t={t} dark={dark}
                newsLength={displayNews.length}
                showTamilChip={activeFeed?.key === "tamil-nadu"}
                tamilSubActive={tamilSubActive} onTamilSub={handleTamilSub} tamilSubCount={tamilSubNews.length}
                advOpen={advOpen} setAdvOpen={setAdvOpen}
              />
            )}

            <FeedMeta
              label={
                displayStatus === "loading" ? t.loading
                : tamilSubActive ? "தமிழ் செய்திகள்"
                : activeFeed ? t.feeds[activeFeed.key]
                : t.selectFeed
              }
              count={filteredNews.length}
              t={t}
              viewMode={viewMode}
              setViewMode={setViewMode}
              showToggle={displayStatus === "success"}
            />

            {status === "idle" && (
              <EmptyState icon="📰" title={t.whatRead} sub={t.chooseFeed}>
                <div style={{ display:"flex", justifyContent:"center", gap:10, flexWrap:"wrap" }}>
                  {FEEDS.map(f => (
                    <button key={f.key} onClick={() => fetchNews(f)} style={{
                      fontSize:13, fontWeight:500, padding:"9px 22px", borderRadius:100, border:"none",
                      background:f.fill, color:f.ink, cursor:"pointer",
                    }}>
                      {t.feeds[f.key]}
                    </button>
                  ))}
                </div>
              </EmptyState>
            )}

            {displayStatus === "loading" && (
              useCardLayout && viewMode === "grid" ? <SkeletonGrid /> : <SkeletonList />
            )}

            {displayStatus === "error" && <EmptyState icon="⚠️" title={t.failedLoad} sub={t.backendError} />}

            {displayStatus === "success" && filteredNews.length === 0 && (
              <EmptyState
                icon="🔍" title={t.noArticles}
                sub={search || activeLabel !== "All" || activeSource !== "All" ? t.tryDifferent : t.tryLater}
              />
            )}

            {displayStatus === "success" && filteredNews.length > 0 && useCardLayout && viewMode === "grid" && (
              <div className="card-grid">
                {filteredNews.map((item, i) => (
                  <NewsCard key={item.link || i} item={item} feed={currentFeed} t={t} dark={dark} delay={Math.min(i * 0.04, 0.4)} />
                ))}
              </div>
            )}

            {displayStatus === "success" && filteredNews.length > 0 && (!useCardLayout || viewMode === "list") && (
              <div>
                {filteredNews.map((item, i) => (
                  <ListItem key={item.link || i} item={item} feed={tamilSubActive ? TAMIL_FEED : currentFeed} t={t} dark={dark} delay={Math.min(i * 0.03, 0.3)} />
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
export default App;
