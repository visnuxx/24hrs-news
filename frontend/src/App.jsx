import { useState, useEffect, useMemo, useCallback, useRef } from "react";

// ---------- Google Fonts ----------
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap";
document.head.appendChild(fontLink);

// ---------- Global Styles ----------
const globalStyle = document.createElement("style");
globalStyle.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { margin: 0; padding: 0; }

  :root {
    --bg: #F6F7F9;
    --surface: #FFFFFF;
    --surface2: #F0F2F5;
    --hero-bg: #EEF6FF;
    --hero-border: #C7DFF5;
    --text1: #111827;
    --text2: #6B7280;
    --text3: #9CA3AF;
    --border: #E5E7EB;
    --border2: rgba(0,0,0,0.06);
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
    --shadow-md: 0 4px 12px rgba(0,0,0,0.10);
    --shadow-lg: 0 8px 24px rgba(0,0,0,0.13);
  }

  body.dark {
    --bg: #111009;
    --surface: #1C1A15;
    --surface2: #242118;
    --hero-bg: #0D1F35;
    --hero-border: #1A3A5C;
    --text1: #F0EDE4;
    --text2: #A09890;
    --text3: #6A6460;
    --border: rgba(240,237,228,0.10);
    --border2: rgba(240,237,228,0.06);
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.4);
    --shadow-md: 0 4px 12px rgba(0,0,0,0.5);
    --shadow-lg: 0 8px 24px rgba(0,0,0,0.6);
  }

  @keyframes pulse    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.75)} }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shimmer  { 0%{background-position:200% center} 100%{background-position:-200% center} }
  @keyframes spin     { to{transform:rotate(360deg)} }

  .fade-up  { animation: fadeUp 0.22s ease both; }
  .live-dot { animation: pulse 2.5s ease-in-out infinite; }

  .skel {
    background: linear-gradient(90deg, var(--surface2) 25%, var(--border) 50%, var(--surface2) 75%);
    background-size: 400%;
    animation: shimmer 1.6s ease-in-out infinite;
    border-radius: 6px;
  }

  input::placeholder { opacity: 0.55; }
  a { text-decoration: none; }
  button { font-family: 'Inter', sans-serif; cursor: pointer; border: none; }
  ::-webkit-scrollbar { display: none; }

  .chip-scroll {
    display: flex; gap: 7px; overflow-x: auto; padding-bottom: 2px;
    -ms-overflow-style: none; scrollbar-width: none;
  }

  .card-grid {
    display: grid;
    gap: 20px;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }

  .news-card:hover {
    transform: translateY(-3px) scale(1.015);
    box-shadow: var(--shadow-lg);
  }

  .list-item:hover {
    background: var(--surface2);
  }

  @media (max-width: 600px) {
    .card-grid { grid-template-columns: 1fr; }
    .hero-brief { flex-direction: column; align-items: flex-start !important; }
    .header-inner { height: 52px; }
  }
`;
document.head.appendChild(globalStyle);

// ---------- Constants ----------
const API_BASE = "https://two4hrs-news.onrender.com";

const FEEDS = [
  { key:"tamil-nadu",    label:"Tamil Nadu",    taLabel:"தமிழ்நாடு", endpoint:"/news/tamil-nadu",    summaryKey:"tamilNadu",     accent:"#1D9E75", fill:"#E1F5EE", ink:"#085041" },
  { key:"international", label:"International", taLabel:"உலகம்",     endpoint:"/news/international", summaryKey:"international", accent:"#185FA5", fill:"#E6F1FB", ink:"#0C447C" },
];

const TAMIL_FEED = FEEDS[2];

const CATEGORIES = {
  Politics:      { bg:"#FEF3C7", ink:"#92400E", darkBg:"#412402", darkInk:"#FAC775", icon:"🏛" },
  Business:      { bg:"#D1FAE5", ink:"#065F46", darkBg:"#173404", darkInk:"#6EE7B7", icon:"📈" },
  Technology:    { bg:"#EDE9FE", ink:"#5B21B6", darkBg:"#26215C", darkInk:"#C4B5FD", icon:"💻" },
  Sports:        { bg:"#DBEAFE", ink:"#1E40AF", darkBg:"#042C53", darkInk:"#93C5FD", icon:"⚽" },
  Crime:         { bg:"#FEE2E2", ink:"#991B1B", darkBg:"#501313", darkInk:"#FCA5A5", icon:"🔍" },
  Entertainment: { bg:"#FCE7F3", ink:"#9D174D", darkBg:"#4B1528", darkInk:"#F9A8D4", icon:"🎬" },
  Health:        { bg:"#D1FAE5", ink:"#065F46", darkBg:"#173404", darkInk:"#6EE7B7", icon:"🏥" },
  Climate:       { bg:"#ECFDF5", ink:"#065F46", darkBg:"#173404", darkInk:"#6EE7B7", icon:"🌍" },
  World:         { bg:"#DBEAFE", ink:"#1E40AF", darkBg:"#042C53", darkInk:"#93C5FD", icon:"🌐" },
  Conflict:      { bg:"#FEE2E2", ink:"#991B1B", darkBg:"#501313", darkInk:"#FCA5A5", icon:"⚔" },
  News:          { bg:"#F3F4F6", ink:"#374151", darkBg:"#2C2C2A", darkInk:"#D1D5DB", icon:"📰" },
};

const TRANSLATIONS = {
  en: {
    dark:"Dark", light:"Light",
    allStories:"All stories", todaysBrief:"Today's Brief",
    generating:"generating…", generatingBrief:"Generating brief…",
    category:"Category", source:"Source", searchPlaceholder:"Search headlines…",
    all:"All", allSources:"All sources", read:"Read", share:"Share",
    loading:"Loading…", selectFeed:"Select a feed",
    whatRead:"What would you like to read?", chooseFeed:"Choose a feed above",
    failedLoad:"Failed to load", backendError:"Backend not reachable",
    noArticles:"No articles found", tryDifferent:"Try a different filter", tryLater:"Try again later",
    todaysBriefLabel:"Today's Brief", generatedNote:"Generated from", articles:"articles",
    poweredBy:"Powered by Gemini", failedSummary:"Summary unavailable",
    geminiError:"Check GEMINI_API_KEY", keywordMode:"keyword mode",
    feeds:{"tamil-nadu":"Tamil Nadu", international:"International", tamil:"தமிழ்"},
    gridView:"Grid", listView:"List", filters:"Filters", language:"Language",
    aiSummary:"AI-powered news summary",
    aiSubtitle:"Key stories distilled into insights, powered by Gemini.",
    readBrief:"✦  Read Brief",
  },
  ta: {
    dark:"இருள்", light:"ஒளி",
    allStories:"அனைத்து செய்திகள்", todaysBrief:"இன்றைய சுருக்கம்",
    generating:"உருவாக்குகிறது…", generatingBrief:"சுருக்கம் உருவாக்குகிறது…",
    category:"வகை", source:"மூலம்", searchPlaceholder:"செய்திகள் தேடுக…",
    all:"அனைத்தும்", allSources:"அனைத்து மூலங்கள்", read:"படிக்க", share:"பகிர்",
    loading:"ஏற்றுகிறது…", selectFeed:"ஒரு செய்தி தேர்ந்தெடுக்கவும்",
    whatRead:"என்ன படிக்க விரும்புகிறீர்கள்?", chooseFeed:"மேலே ஒரு செய்தி தேர்ந்தெடுக்கவும்",
    failedLoad:"ஏற்றல் தோல்வி", backendError:"பின்தள சேவை இயங்கவில்லை",
    noArticles:"செய்திகள் இல்லை", tryDifferent:"வேறு வடிகட்டி முயற்சிக்கவும்", tryLater:"பின்னர் முயற்சிக்கவும்",
    todaysBriefLabel:"இன்றைய சுருக்கம்", generatedNote:"உருவாக்கப்பட்டது", articles:"செய்திகள்",
    poweredBy:"Gemini மூலம்", failedSummary:"சுருக்கம் தோல்வி",
    geminiError:"GEMINI_API_KEY சரிபார்க்கவும்", keywordMode:"முக்கியசொல் முறை",
    feeds:{"tamil-nadu":"தமிழ்நாடு", international:"உலகம்", tamil:"தமிழ்"},
    gridView:"கட்டம்", listView:"பட்டியல்", filters:"வடிகட்டிகள்", language:"மொழி",
    aiSummary:"AI செய்தி சுருக்கம்",
    aiSubtitle:"முக்கிய செய்திகள் Gemini மூலம் சுருக்கப்பட்டது.",
    readBrief:"✦  சுருக்கம் படிக்க",
  },
};

// ---------- Theme ----------
const applyTheme = (dark) => {
  if (dark) document.body.classList.add("dark");
  else document.body.classList.remove("dark");
};

// ---------- Utilities ----------
const getCat = (label) => CATEGORIES[label] || CATEGORIES.News;
const cityFromSource = (src) => { if (!src) return null; const m = src.match(/Google News · (.+)/); return m ? m[1] : null; };
const sourceLabel = (src) => cityFromSource(src) || src || "";
const initials = (src) => { if (!src) return "?"; const c = cityFromSource(src); if (c) return c.slice(0, 2).toUpperCase(); return src.trim().split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase(); };
const timeAgo = (d) => { if (!d) return ""; const s = Math.floor((Date.now() - new Date(d)) / 1000); if (isNaN(s) || s < 0) return ""; if (s < 60) return "now"; if (s < 3600) return Math.floor(s / 60) + "m"; if (s < 86400) return Math.floor(s / 3600) + "h"; return Math.floor(s / 86400) + "d"; };
const formatDate = (iso) => { if (!iso) return ""; const d = new Date(iso); return d.toLocaleDateString("en-IN", { weekday:"short", day:"numeric", month:"short" }) + " · " + d.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" }); };
const whatsappShare = (title, link) => window.open(`https://wa.me/?text=${encodeURIComponent(`${title}\n${link}`)}`, "_blank");

// ---------- Category Badge ----------
const CatBadge = ({ label, dark, size = "sm" }) => {
  const cat = getCat(label);
  const bg   = dark ? cat.darkBg  : cat.bg;
  const ink  = dark ? cat.darkInk : cat.ink;
  const fs   = size === "sm" ? 9 : 11;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:4,
      fontSize:fs, fontWeight:600, letterSpacing:0.3,
      textTransform:"uppercase", padding:"3px 9px",
      borderRadius:100, background:bg, color:ink,
      whiteSpace:"nowrap", flexShrink:0,
    }}>
      {cat.icon} {label}
    </span>
  );
};

// ---------- Source Avatar ----------
const SourceAvatar = ({ src, feed, size = 22 }) => (
  <span style={{
    width:size, height:size, borderRadius:Math.round(size * 0.27),
    background:feed.fill, color:feed.ink,
    display:"flex", alignItems:"center", justifyContent:"center",
    fontSize:Math.round(size * 0.36), fontWeight:700, flexShrink:0,
  }}>
    {initials(src)}
  </span>
);

// ---------- Thumbnail ----------
const Thumb = ({ label, dark, image, mode = "banner", height = 140, size = 76 }) => {
  const cat = getCat(label);
  const bg  = dark ? cat.darkBg : cat.bg;
  const [imgErr, setImgErr] = useState(false);
  const showImg = image && !imgErr;

  if (mode === "square") {
    return (
      <div style={{ width:size, height:size, borderRadius:10, background:bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, overflow:"hidden", position:"relative" }}>
        {showImg
          ? <img src={image} alt="" onError={() => setImgErr(true)}
              style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
          : <span style={{ fontSize:size * 0.38 }}>{cat.icon}</span>
        }
      </div>
    );
  }
  return (
    <div style={{ width:"100%", height, background:bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, overflow:"hidden", position:"relative" }}>
      {showImg
        ? <img src={image} alt="" onError={() => setImgErr(true)}
            style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
        : <span style={{ fontSize:44 }}>{cat.icon}</span>
      }
    </div>
  );
};

// ---------- Sticky Header ----------
const Header = ({ lang, setLang, dark, setDark, t }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive:true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header style={{
      position:"sticky", top:0, zIndex:200,
      background: scrolled
        ? "rgba(246,247,249,0.90)"
        : "transparent",
      backdropFilter: scrolled ? "blur(14px)" : "none",
      WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
      borderBottom:`1px solid ${scrolled ? "var(--border)" : "transparent"}`,
      boxShadow: scrolled ? "var(--shadow-sm)" : "none",
      transition:"all 0.2s ease",
      margin:"0 -20px", padding:"0 20px",
    }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", height:60 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span className="live-dot" style={{ display:"inline-block", width:8, height:8, borderRadius:"50%", background:"#1D9E75" }} />
          <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:600, fontSize:26, letterSpacing:-0.5, color:"var(--text1)", lineHeight:1 }}>briefed</span>
          <span style={{ fontSize:10, fontWeight:600, letterSpacing:0.8, textTransform:"uppercase", color:"var(--text3)", background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:100, padding:"2px 8px" }}>LIVE</span>
        </div>
        <div style={{ display:"flex", gap:7 }}>
          <button onClick={() => setDark(d => !d)} style={{
            fontSize:12, fontWeight:500, color:"var(--text2)",
            background:"var(--surface)", border:"1px solid var(--border)",
            borderRadius:100, padding:"6px 14px", letterSpacing:0.2,
            transition:"all 0.15s",
          }}>
            {dark ? t.light : t.dark}
          </button>
        </div>
      </div>
    </header>
  );
};

// ---------- Feed Tabs ----------
const FeedTabs = ({ activeFeed, onSelect, newsCount, status, t, dark }) => (
  <div style={{
    display:"grid", gridTemplateColumns:"repeat(2,1fr)",
    background:"var(--surface)", border:"1px solid var(--border)",
    borderRadius:"var(--radius-md)", padding:4, marginBottom:24,
  }}>
    {FEEDS.map(feed => {
      const on = activeFeed?.key === feed.key;
      const count = on && status === "success" ? newsCount : null;
      return (
        <button key={feed.key} onClick={() => onSelect(feed)} style={{
          fontSize:13, fontWeight: on ? 600 : 400,
          color: on ? feed.ink : "var(--text3)",
          background: on ? "var(--surface2)" : "transparent",
          border: on ? "1px solid var(--border)" : "none",
          borderRadius:10, padding:"10px 4px",
          display:"flex", alignItems:"center", justifyContent:"center", gap:5,
          transition:"all 0.18s",
        }}>
          {on && <span style={{ width:5, height:5, borderRadius:"50%", background:feed.accent, flexShrink:0 }} />}
          {t.feeds[feed.key]}
          {count !== null && <span style={{ fontSize:11, fontWeight:400, opacity:0.5 }}>{count}</span>}
        </button>
      );
    })}
  </div>
);

// ---------- Hero Brief ----------
const HeroBrief = ({ activeFeed, onReadBrief, t }) => (
  <div className="hero-brief" style={{
    background:"var(--hero-bg)", border:"1px solid var(--hero-border)",
    borderRadius:"var(--radius-lg)", padding:"24px 28px",
    marginBottom:24, display:"flex",
    alignItems:"center", justifyContent:"space-between",
    gap:20, flexWrap:"wrap",
  }}>
    <div style={{ flex:1, minWidth:200 }}>
      <div style={{
        display:"inline-flex", alignItems:"center", gap:5,
        fontSize:10, fontWeight:700, textTransform:"uppercase",
        letterSpacing:0.7, color:"#185FA5",
        background:"rgba(24,95,165,0.12)",
        padding:"4px 11px", borderRadius:100, marginBottom:10,
      }}>
        ✦ Today's Brief · {activeFeed ? t.feeds[activeFeed.key] : ""}
      </div>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:21, fontWeight:600, color:"var(--text1)", marginBottom:6, lineHeight:1.3 }}>
        {t.aiSummary}
      </div>
      <div style={{ fontSize:13, color:"var(--text2)", lineHeight:1.55 }}>{t.aiSubtitle}</div>
    </div>
    <button onClick={onReadBrief} style={{
      fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight:600,
      color:"#185FA5", background:"var(--surface)",
      border:"1.5px solid #185FA5", borderRadius:100,
      padding:"10px 22px", cursor:"pointer", whiteSpace:"nowrap",
      boxShadow:"var(--shadow-sm)", transition:"all 0.18s",
    }}
      onMouseEnter={e => { e.currentTarget.style.background = "#185FA5"; e.currentTarget.style.color = "white"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.color = "#185FA5"; }}
    >
      {t.readBrief}
    </button>
  </div>
);

// ---------- Filter Bar ----------
const FilterBar = ({
  labels, activeLabel, setActiveLabel,
  sources, activeSource, setActiveSource,
  search, setSearch,
  currentFeed, t, dark,
  newsLength,
  showTamilChip, tamilSubActive, onTamilSub, tamilSubCount,
  advOpen, setAdvOpen,
}) => {
  const chip = (on, feed) => ({
    fontSize:12, fontWeight: on ? 500 : 400,
    padding:"5px 13px", borderRadius:100, whiteSpace:"nowrap",
    display:"inline-flex", alignItems:"center", gap:4,
    transition:"all 0.15s",
    background: on ? feed.fill : "transparent",
    color: on ? feed.ink : "var(--text2)",
    border: on ? `1px solid ${feed.accent}40` : "1px solid var(--border)",
    flexShrink:0, cursor:"pointer",
  });
  const cf = tamilSubActive ? TAMIL_FEED : currentFeed;

  return (
    <div style={{ marginBottom:20 }}>
      {/* Category row */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
        <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, color:"var(--text3)" }}>{t.category}</div>
        <button onClick={() => setAdvOpen(v => !v)} style={{
          fontSize:12, fontWeight:500, color:"var(--text2)",
          background:"transparent", border:"1px solid var(--border)",
          borderRadius:"var(--radius-sm)", padding:"5px 12px",
          display:"flex", alignItems:"center", gap:5, transition:"all 0.15s",
        }}>
          ⚙ {t.filters} {advOpen ? "▲" : "▼"}
        </button>
      </div>

      <div className="chip-scroll" style={{ marginBottom:12 }}>
        <button style={chip(activeLabel === "All", cf)} onClick={() => setActiveLabel("All")}>
          {t.all} <span style={{ opacity:0.5, fontSize:11 }}>{newsLength}</span>
        </button>
        {labels.map(({ label, count }) => (
          <button key={label} style={chip(activeLabel === label, cf)} onClick={() => setActiveLabel(label)}>
            {getCat(label).icon} {label}
            <span style={{ opacity:0.5, fontSize:11 }}>{count}</span>
          </button>
        ))}
      </div>

      {/* Advanced filters */}
      {advOpen && (
        <div style={{
          background:"var(--surface2)", border:"1px solid var(--border)",
          borderRadius:"var(--radius-md)", padding:"16px 16px 12px",
          marginBottom:12,
        }}>
          {showTamilChip && (
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, color:"var(--text3)", marginBottom:7 }}>{t.language}</div>
              <div className="chip-scroll">
                <button style={chip(!tamilSubActive, currentFeed)} onClick={() => tamilSubActive && onTamilSub()}>
                  English {!tamilSubActive && <span style={{ opacity:0.5, fontSize:11 }}>{newsLength}</span>}
                </button>
                <button style={chip(tamilSubActive, TAMIL_FEED)} onClick={() => !tamilSubActive && onTamilSub()}>
                  தமிழ் {tamilSubActive && tamilSubCount > 0 && <span style={{ opacity:0.5, fontSize:11 }}>{tamilSubCount}</span>}
                </button>
              </div>
            </div>
          )}
          {sources.length > 1 && (
            <div>
              <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, color:"var(--text3)", marginBottom:7 }}>{t.source}</div>
              <div className="chip-scroll">
                <button style={chip(activeSource === "All", cf)} onClick={() => setActiveSource("All")}>
                  {t.allSources}
                </button>
                {sources.map(({ source, count }) => (
                  <button key={source} style={chip(activeSource === source, cf)} onClick={() => setActiveSource(source)}>
                    {sourceLabel(source)} <span style={{ opacity:0.5, fontSize:11 }}>{count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search */}
      <div style={{ position:"relative" }}>
        <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"var(--text3)", fontSize:15, pointerEvents:"none" }}>⌕</span>
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            fontFamily:"'Inter',sans-serif", fontSize:13, width:"100%",
            padding:"10px 14px 10px 38px", borderRadius:"var(--radius-sm)",
            border:"1px solid var(--border)", background:"var(--surface)",
            color:"var(--text1)", outline:"none", transition:"border-color 0.15s",
          }}
          onFocus={e => e.target.style.borderColor = "#9CA3AF"}
          onBlur={e => e.target.style.borderColor = "var(--border)"}
        />
      </div>
    </div>
  );
};

// ---------- Feed Meta Bar ----------
const FeedMeta = ({ label, count, t, viewMode, setViewMode, showToggle }) => (
  <div style={{
    display:"flex", alignItems:"center", justifyContent:"space-between",
    marginBottom:20, paddingBottom:12, borderBottom:"1px solid var(--border)",
  }}>
    <span style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.5, color:"var(--text3)" }}>{label}</span>
    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
      {showToggle && <span style={{ fontSize:12, color:"var(--text3)" }}>{count} {t.articles}</span>}
      {showToggle && (
        <div style={{ display:"flex", gap:3, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", padding:3 }}>
          {[
            { key:"grid", icon:<svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor"><rect x="0" y="0" width="6" height="6" rx="1.2"/><rect x="8" y="0" width="6" height="6" rx="1.2"/><rect x="0" y="8" width="6" height="6" rx="1.2"/><rect x="8" y="8" width="6" height="6" rx="1.2"/></svg> },
            { key:"list", icon:<svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor"><rect x="0" y="1" width="14" height="2.5" rx="1.2"/><rect x="0" y="5.75" width="14" height="2.5" rx="1.2"/><rect x="0" y="10.5" width="14" height="2.5" rx="1.2"/></svg> },
          ].map(({ key, icon }) => (
            <button key={key} onClick={() => setViewMode(key)} style={{
              width:30, height:30, borderRadius:6, border:"none",
              background: viewMode === key ? "var(--surface2)" : "transparent",
              color: viewMode === key ? "var(--text1)" : "var(--text3)",
              display:"flex", alignItems:"center", justifyContent:"center",
              cursor:"pointer", transition:"all 0.15s",
            }}>
              {icon}
            </button>
          ))}
        </div>
      )}
    </div>
  </div>
);

// ---------- News Card (Grid) ----------
const NewsCard = ({ item, feed, t, dark, delay }) => {
  const label = item.label || "News";
  const ago   = timeAgo(item.pubDate);
  const cat   = getCat(label);

  const handleCardClick = (e) => {
    if (e.target.tagName === "A" || e.target.tagName === "BUTTON") return;
    if (item.link) window.open(item.link, "_blank", "noopener,noreferrer");
  };

  return (
    <article
      className="news-card fade-up"
      onClick={handleCardClick}
      style={{
        background:"var(--surface)", border:"1px solid var(--border2)",
        borderRadius:"var(--radius-lg)", overflow:"hidden",
        display:"flex", flexDirection:"column", cursor:"pointer",
        transition:"transform 0.18s ease, box-shadow 0.18s ease",
        animationDelay:`${delay}s`,
      }}
    >
      <Thumb label={label} dark={dark} image={item.image} mode="banner" height={140} />
      <div style={{ padding:"14px 16px 16px", display:"flex", flexDirection:"column", flex:1 }}>
        <div style={{ marginBottom:9 }}>
          <CatBadge label={label} dark={dark} size="sm" />
        </div>
        <h3 style={{
          fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:400,
          lineHeight:1.55, color:"var(--text1)", flex:1, marginBottom:12,
          display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden",
        }}>
          {item.title}
        </h3>
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          borderTop:"1px solid var(--border2)", paddingTop:10,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:7, minWidth:0 }}>
            <SourceAvatar src={item.source} feed={feed} size={22} />
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:11, color:"var(--text2)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:110 }}>
                {sourceLabel(item.source)}
              </div>
              {ago && <div style={{ fontSize:10, color:"var(--text3)" }}>{ago}</div>}
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:9, flexShrink:0 }}>
            <button
              onClick={e => { e.stopPropagation(); whatsappShare(item.title, item.link); }}
              style={{ fontSize:12, fontWeight:500, color:"#25D366", background:"none", border:"none", padding:0 }}
            >↗</button>
            <a
              href={item.link} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{
                fontSize:11, fontWeight:600, color:feed.accent,
                padding:"4px 11px", borderRadius:100,
                border:`1px solid ${feed.accent}`,
              }}
            >
              {t.read}
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};

// ---------- News List Item ----------
const ListItem = ({ item, feed, t, dark, delay }) => {
  const label = item.label || "News";
  const ago   = timeAgo(item.pubDate);
  return (
    <article
      className="list-item fade-up"
      onClick={() => item.link && window.open(item.link, "_blank", "noopener,noreferrer")}
      style={{
        padding:"16px 0", borderBottom:"1px solid var(--border)",
        display:"flex", gap:14, alignItems:"flex-start",
        cursor:"pointer", transition:"background 0.15s, padding 0.15s",
        animationDelay:`${delay}s`,
        borderRadius:"var(--radius-sm)",
      }}
    >
      <Thumb label={label} dark={dark} image={item.image} mode="square" size={76} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ marginBottom:6 }}>
          <CatBadge label={label} dark={dark} size="xs" />
        </div>
        <h3 style={{
          fontFamily:"'Playfair Display',serif", fontSize:14, fontWeight:400,
          lineHeight:1.5, color:"var(--text1)", marginBottom:8,
          display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden",
        }}>
          {item.title}
        </h3>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <SourceAvatar src={item.source} feed={feed} size={18} />
            <span style={{ fontSize:11, color:"var(--text2)", maxWidth:100, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {sourceLabel(item.source)}
            </span>
            {ago && <><span style={{ fontSize:10, color:"var(--text3)" }}>·</span><span style={{ fontSize:10, color:"var(--text3)" }}>{ago}</span></>}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:9, flexShrink:0 }}>
            <button
              onClick={e => { e.stopPropagation(); whatsappShare(item.title, item.link); }}
              style={{ fontSize:11, fontWeight:500, color:"#25D366", background:"none", border:"none", padding:0 }}
            >↗</button>
            <a
              href={item.link} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ fontSize:11, fontWeight:600, color:feed.accent }}
            >
              {t.read} →
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};

// ---------- Brief Card ----------
const BriefCard = ({ item, rank, feed, t, dark, delay }) => {
  const label = item.label || "News";
  const ago   = timeAgo(item.pubDate);
  const [imgErr, setImgErr] = useState(false);
  const showImg = item.image && !imgErr;
  return (
    <div className="fade-up" style={{
      background:"var(--surface)", border:"1px solid var(--border2)",
      borderRadius:"var(--radius-lg)", overflow:"hidden", marginBottom:14,
      animationDelay:`${delay}s`,
    }}>
      <div style={{ display:"flex" }}>
        <div style={{ width:4, background:feed.accent, flexShrink:0 }} />
        <div style={{ padding:"16px 18px", flex:1, minWidth:0 }}>
          <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:9 }}>
                <span style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:600, color:feed.accent, lineHeight:1 }}>{rank}</span>
                <CatBadge label={label} dark={dark} size="sm" />
              </div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:400, lineHeight:1.5, color:"var(--text1)", marginBottom: item.brief ? 7 : 12 }}>
                {item.headline}
              </div>
              {item.brief && (
                <p style={{ fontSize:13, lineHeight:1.7, color:"var(--text2)", marginBottom:12 }}>{item.brief}</p>
              )}
            </div>
            {showImg && (
              <div style={{ width:80, height:80, borderRadius:10, overflow:"hidden", flexShrink:0 }}>
                <img src={item.image} alt="" onError={() => setImgErr(true)}
                  style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
              </div>
            )}
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <SourceAvatar src={item.source} feed={feed} size={20} />
              <span style={{ fontSize:11, color:"var(--text2)" }}>{sourceLabel(item.source)}</span>
              {ago && <><span style={{ fontSize:10, color:"var(--text3)" }}>·</span><span style={{ fontSize:10, color:"var(--text3)" }}>{ago}</span></>}
            </div>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <button
                onClick={() => whatsappShare(item.headline, item.link)}
                style={{ fontSize:11, fontWeight:500, color:"#25D366", background:"none", border:"none", padding:0 }}
              >
                ↗ {t.share}
              </button>
              {item.link && (
                <a
                  href={item.link} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize:11, fontWeight:600, color:feed.accent, padding:"4px 11px", borderRadius:100, border:`1px solid ${feed.accent}` }}
                >
                  {t.read}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Skeletons ----------
const SkeletonGrid = () => (
  <div className="card-grid">
    {[0,1,2,3,4,5].map(i => (
      <div key={i} style={{ background:"var(--surface)", border:"1px solid var(--border2)", borderRadius:"var(--radius-lg)", overflow:"hidden" }}>
        <div className="skel" style={{ width:"100%", height:140 }} />
        <div style={{ padding:"14px 16px 16px" }}>
          <div className="skel" style={{ width:"48%", height:10, marginBottom:10 }} />
          <div className="skel" style={{ width:"92%", height:14, marginBottom:6 }} />
          <div className="skel" style={{ width:"70%", height:14, marginBottom:18 }} />
          <div style={{ display:"flex", gap:8 }}>
            <div className="skel" style={{ width:52, height:10 }} />
            <div className="skel" style={{ width:38, height:10 }} />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const SkeletonList = () => (
  <div>
    {[0,1,2,3,4].map(i => (
      <div key={i} style={{ padding:"16px 0", borderBottom:"1px solid var(--border)", display:"flex", gap:14 }}>
        <div className="skel" style={{ width:76, height:76, borderRadius:10, flexShrink:0 }} />
        <div style={{ flex:1 }}>
          <div className="skel" style={{ width:"38%", height:10, marginBottom:9 }} />
          <div className="skel" style={{ width:"90%", height:14, marginBottom:5 }} />
          <div className="skel" style={{ width:"65%", height:14, marginBottom:13 }} />
          <div style={{ display:"flex", gap:8 }}>
            <div className="skel" style={{ width:52, height:10 }} />
            <div className="skel" style={{ width:38, height:10 }} />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const SkeletonBrief = () => (
  <>
    {[0,1,2,3].map(i => (
      <div key={i} className="fade-up" style={{
        background:"var(--surface)", border:"1px solid var(--border2)",
        borderRadius:"var(--radius-lg)", overflow:"hidden", marginBottom:14,
        animationDelay:`${i * 0.08}s`,
      }}>
        <div style={{ display:"flex" }}>
          <div className="skel" style={{ width:4, flexShrink:0 }} />
          <div style={{ padding:"16px 18px", flex:1 }}>
            <div className="skel" style={{ width:"30%", height:10, marginBottom:11 }} />
            <div className="skel" style={{ width:"85%", height:14, marginBottom:7 }} />
            <div className="skel" style={{ width:"60%", height:14, marginBottom:15 }} />
            <div style={{ display:"flex", gap:8 }}>
              <div className="skel" style={{ width:52, height:10 }} />
              <div className="skel" style={{ width:38, height:10 }} />
            </div>
          </div>
        </div>
      </div>
    ))}
  </>
);

// ---------- Empty / Error ----------
const EmptyState = ({ icon, title, sub, children }) => (
  <div style={{ textAlign:"center", padding:"5rem 0" }}>
    <div style={{ fontSize:32, marginBottom:12, opacity:0.3 }}>{icon}</div>
    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:19, fontWeight:400, color:"var(--text1)", marginBottom:6 }}>{title}</div>
    <div style={{ fontSize:13, color:"var(--text3)", marginBottom: children ? "1.5rem" : 0 }}>{sub}</div>
    {children}
  </div>
);

// ============================================================
// ---------- MAIN APP ----------
// ============================================================
export default function App() {
  const [dark, setDark]     = useState(false);
  const [lang, setLang]     = useState("en");
  const t  = TRANSLATIONS[lang];

  // Feed state
  const [news, setNews]         = useState([]);
  const [status, setStatus]     = useState("idle");
  const [activeFeed, setActiveFeed] = useState(null);

  // UI state
  const [activeTab, setActiveTab]   = useState("feed");
  const [activeLabel, setActiveLabel] = useState("All");
  const [activeSource, setActiveSource] = useState("All");
  const [search, setSearch]           = useState("");
  const [viewMode, setViewMode]       = useState("grid");
  const [advOpen, setAdvOpen]         = useState(false);

  // Brief state
  const [summary, setSummary]           = useState(null);
  const [summaryStatus, setSummaryStatus] = useState("idle");

  // Tamil sub-feed state
  const [tamilSubActive, setTamilSubActive]   = useState(false);
  const [tamilSubNews, setTamilSubNews]       = useState([]);
  const [tamilSubStatus, setTamilSubStatus]   = useState("idle");

  // Derived
  const currentFeed   = activeFeed || FEEDS[0];
  const displayNews   = tamilSubActive ? tamilSubNews : news;
  const displayStatus = tamilSubActive ? tamilSubStatus : status;
  const useCardLayout = activeFeed?.key !== "tamil" && !tamilSubActive;

  // Dark mode side effect
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
    setSummary(null); setSummaryStatus("idle");
    setTamilSubActive(false); setTamilSubNews([]); setTamilSubStatus("idle");
    try {
      const res = await fetch(API_BASE + feed.endpoint);
      if (!res.ok) throw new Error();
      setNews(await res.json());
      setStatus("success");
    } catch { setStatus("error"); }
  }, []);

  const fetchSummary = useCallback(async (feed) => {
    setActiveTab("brief");
    if (summary && summaryStatus === "success") return;
    setSummaryStatus("loading");
    try {
      const res = await fetch(`${API_BASE}/news/summary/${feed.summaryKey}`);
      if (!res.ok) throw new Error();
      setSummary(await res.json());
      setSummaryStatus("success");
    } catch { setSummaryStatus("error"); }
  }, [summary, summaryStatus]);

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

  // Boot — fetch default feed
  useEffect(() => { fetchNews(FEEDS[0]); }, [fetchNews]);

  const showFilters = status === "success" || tamilSubActive;
  const showHero    = status === "success" || status === "loading";

  return (
    <div style={{
      fontFamily:"'Inter',-apple-system,sans-serif",
      background:"var(--bg)", color:"var(--text1)",
      minHeight:"100vh", transition:"background 0.2s, color 0.2s",
    }}>
      <div style={{ maxWidth:1040, margin:"0 auto", padding:"0 20px 64px" }}>

        <Header lang={lang} setLang={setLang} dark={dark} setDark={setDark} t={t} />

        <FeedTabs
          activeFeed={activeFeed} onSelect={fetchNews}
          newsCount={news.length} status={status}
          t={t} dark={dark}
        />

        {showHero && (
          <HeroBrief
            activeFeed={activeFeed}
            onReadBrief={() => fetchSummary(currentFeed)}
            t={t}
          />
        )}

        {/* ---- BRIEF VIEW ---- */}
        {activeTab === "brief" && activeFeed && (
          <div style={{ maxWidth:700, margin:"0 auto" }}>
            {summaryStatus === "loading" && (
              <>
                <div style={{ fontSize:12, color:"var(--text3)", letterSpacing:0.4, marginBottom:16 }}>{t.generatingBrief}</div>
                <SkeletonBrief />
              </>
            )}
            {summaryStatus === "error" && <EmptyState icon="✦" title={t.failedSummary} sub={t.geminiError} />}
            {summaryStatus === "success" && summary && (
              <>
                <div style={{
                  display:"flex", justifyContent:"space-between", alignItems:"flex-start",
                  marginBottom:24, paddingBottom:16, borderBottom:"1px solid var(--border)",
                }}>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.6, color:"var(--text3)", marginBottom:3 }}>
                      {t.todaysBriefLabel} · {t.feeds[activeFeed.key]}
                    </div>
                    <div style={{ fontSize:12, color:"var(--text3)" }}>{formatDate(summary.generatedAt)}</div>
                  </div>
                  {summary.fallback && (
                    <span style={{ fontSize:10, fontWeight:500, padding:"4px 10px", borderRadius:100, background:"var(--surface2)", color:"var(--text3)", border:"1px solid var(--border)" }}>
                      {t.keywordMode}
                    </span>
                  )}
                </div>
                {summary.items.map((item, idx) => (
                  <BriefCard
                    key={item.rank || idx} item={item} rank={item.rank}
                    feed={currentFeed} t={t} dark={dark}
                    delay={Math.min(idx * 0.04, 0.4)}
                  />
                ))}
                <div style={{ textAlign:"center", padding:"20px 0 8px", fontSize:11, color:"var(--text3)" }}>
                  {t.generatedNote} {news.length} {t.articles} · {t.poweredBy}
                </div>
              </>
            )}
          </div>
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

            {/* States */}
            {status === "idle" && (
              <EmptyState icon="📰" title={t.whatRead} sub={t.chooseFeed}>
                <div style={{ display:"flex", justifyContent:"center", gap:10, flexWrap:"wrap" }}>
                  {FEEDS.map(f => (
                    <button key={f.key} onClick={() => fetchNews(f)} style={{
                      fontSize:13, fontWeight:500, padding:"9px 22px",
                      borderRadius:100, border:"none",
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

            {displayStatus === "error" && (
              <EmptyState icon="⚠️" title={t.failedLoad} sub={t.backendError} />
            )}

            {displayStatus === "success" && filteredNews.length === 0 && (
              <EmptyState
                icon="🔍"
                title={t.noArticles}
                sub={search || activeLabel !== "All" || activeSource !== "All" ? t.tryDifferent : t.tryLater}
              />
            )}

            {/* Card grid */}
            {displayStatus === "success" && filteredNews.length > 0 && useCardLayout && viewMode === "grid" && (
              <div className="card-grid">
                {filteredNews.map((item, i) => (
                  <NewsCard
                    key={item.link || i} item={item}
                    feed={currentFeed} t={t} dark={dark}
                    delay={Math.min(i * 0.04, 0.4)}
                  />
                ))}
              </div>
            )}

            {/* List feed */}
            {displayStatus === "success" && filteredNews.length > 0 && (!useCardLayout || viewMode === "list") && (
              <div>
                {filteredNews.map((item, i) => (
                  <ListItem
                    key={item.link || i} item={item}
                    feed={tamilSubActive ? TAMIL_FEED : currentFeed}
                    t={t} dark={dark}
                    delay={Math.min(i * 0.03, 0.3)}
                  />
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}