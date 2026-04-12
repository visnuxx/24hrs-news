import { useState, useMemo } from "react";

const API_BASE = "http://localhost:5000";

const FEEDS = [
  {
    key: "tamil-nadu",
    label: "Tamil Nadu",
    endpoint: "/news/tamil-nadu",
    color: "#1D9E75",
    bg: "#E1F5EE",
    textColor: "#085041",
  },
  {
    key: "international",
    label: "International",
    endpoint: "/news/international",
    color: "#185FA5",
    bg: "#E6F1FB",
    textColor: "#0C447C",
  },
];

// Label → emoji for visual flair on chips
const LABEL_EMOJI = {
  Politics: "🏛️",
  Business: "📈",
  Technology: "💻",
  Sports: "⚽",
  Crime: "🔍",
  Entertainment: "🎬",
  Health: "🏥",
  Climate: "🌍",
  World: "🌐",
  Conflict: "⚔️",
  News: "📰",
};

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (isNaN(diff)) return "";
  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  return Math.floor(diff / 86400) + "d ago";
}

function initials(src) {
  if (!src) return "?";
  return src.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function dedupe(items) {
  const seen = new Set();
  return items.filter((i) => {
    const k = (i.title || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 60);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export default function App() {
  const [news, setNews] = useState([]);
  const [status, setStatus] = useState("idle");
  const [dark, setDark] = useState(false);
  const [activeFeedKey, setActiveFeedKey] = useState(null);
  const [activeLabel, setActiveLabel] = useState("All");
  const [search, setSearch] = useState("");

  const currentFeed = FEEDS.find((f) => f.key === activeFeedKey) || FEEDS[0];

  // Theme tokens
  const bg = dark ? "#0f0f0f" : "#ffffff";
  const textPrimary = dark ? "#f0f0ee" : "#1a1a1a";
  const textSecondary = dark ? "#888" : "#555";
  const textTertiary = dark ? "#555" : "#999";
  const border = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const skel = dark ? "#1e1e1e" : "#efefed";
  const tabBg = dark ? "#1a1a1a" : "#f5f5f3";
  const tabActiveBg = dark ? "#2a2a2a" : "#ffffff";
  const inputBg = dark ? "#1a1a1a" : "#f5f5f3";

  async function fetchNews(feed) {
    setActiveFeedKey(feed.key);
    setActiveLabel("All");
    setSearch("");
    setStatus("loading");
    setNews([]);
    try {
      const res = await fetch(API_BASE + feed.endpoint);
      if (!res.ok) throw new Error("bad response");
      const data = await res.json();
      // Backend already deduped + sorted + labeled; just set it
      setNews(data);
      setStatus("success");
    } catch {
      setNews([]);
      setStatus("error");
    }
  }

  // Derive available labels from actual data — only labels that exist in today's feed
  const availableLabels = useMemo(() => {
    const counts = {};
    news.forEach((item) => {
      const lbl = item.label || "News";
      counts[lbl] = (counts[lbl] || 0) + 1;
    });
    // Sort by frequency descending so most-common labels appear first
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({ label, count }));
  }, [news]);

  const filteredNews = useMemo(() => {
    let result = news;

    if (activeLabel !== "All") {
      result = result.filter((item) => (item.label || "News") === activeLabel);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((item) =>
        (item.title || "").toLowerCase().includes(q)
      );
    }

    return result;
  }, [news, activeLabel, search]);

  return (
    <div
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        background: bg,
        minHeight: "100vh",
        color: textPrimary,
        transition: "background 0.2s",
      }}
    >
      <div style={{ maxWidth: 660, margin: "0 auto", padding: "2rem 1.25rem 4rem" }}>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "2rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#378ADD" }} />
            <span style={{ fontSize: 20, fontWeight: 500, letterSpacing: -0.5 }}>briefed</span>
            <span
              style={{
                fontSize: 11,
                color: "#185FA5",
                background: "#E6F1FB",
                padding: "2px 8px",
                borderRadius: 999,
                fontWeight: 500,
              }}
            >
              live
            </span>
          </div>
          <button
            onClick={() => setDark((d) => !d)}
            style={{
              fontSize: 12,
              color: textTertiary,
              background: "none",
              border: "0.5px solid " + border,
              borderRadius: 8,
              padding: "5px 12px",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {dark ? "light" : "dark"}
          </button>
        </div>

        {/* Feed Tabs */}
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: "1rem",
            background: tabBg,
            borderRadius: 10,
            padding: 4,
          }}
        >
          {FEEDS.map((feed) => {
            const isActive = activeFeedKey === feed.key;
            return (
              <button
                key={feed.key}
                onClick={() => fetchNews(feed)}
                style={{
                  flex: 1,
                  fontSize: 13,
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? feed.textColor : textSecondary,
                  background: isActive ? tabActiveBg : "transparent",
                  border: isActive ? "0.5px solid " + border : "none",
                  borderRadius: 8,
                  padding: "8px 0",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {isActive && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: feed.color,
                      display: "inline-block",
                    }}
                  />
                )}
                {feed.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic chips + search */}
        {status === "success" && (
          <div style={{ marginBottom: "1rem" }}>
            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                marginBottom: "0.75rem",
              }}
            >
              {/* "All" chip */}
              <button
                onClick={() => setActiveLabel("All")}
                style={{
                  fontSize: 12,
                  padding: "4px 12px",
                  borderRadius: 999,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontWeight: activeLabel === "All" ? 500 : 400,
                  background: activeLabel === "All" ? currentFeed.bg : "transparent",
                  color: activeLabel === "All" ? currentFeed.textColor : textTertiary,
                  border:
                    activeLabel === "All"
                      ? "0.5px solid " + currentFeed.color
                      : "0.5px solid " + border,
                  transition: "all 0.15s",
                }}
              >
                All <span style={{ opacity: 0.6 }}>{news.length}</span>
              </button>

              {/* One chip per label that actually appears in today's feed */}
              {availableLabels.map(({ label, count }) => {
                const isActive = activeLabel === label;
                const emoji = LABEL_EMOJI[label] || "📰";
                return (
                  <button
                    key={label}
                    onClick={() => setActiveLabel(label)}
                    style={{
                      fontSize: 12,
                      padding: "4px 12px",
                      borderRadius: 999,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontWeight: isActive ? 500 : 400,
                      background: isActive ? currentFeed.bg : "transparent",
                      color: isActive ? currentFeed.textColor : textTertiary,
                      border: isActive
                        ? "0.5px solid " + currentFeed.color
                        : "0.5px solid " + border,
                      transition: "all 0.15s",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span style={{ fontSize: 11 }}>{emoji}</span>
                    {label}
                    <span style={{ opacity: 0.5 }}>{count}</span>
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              placeholder="Search headlines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                fontSize: 13,
                padding: "8px 12px",
                borderRadius: 8,
                border: "0.5px solid " + border,
                background: inputBg,
                color: textPrimary,
                fontFamily: "inherit",
                outline: "none",
              }}
            />
          </div>
        )}

        {/* Divider */}
        <div style={{ height: "0.5px", background: border, marginBottom: "1rem" }} />

        {/* Feed label row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.75rem",
          }}
        >
          <span style={{ fontSize: 12, color: textTertiary, letterSpacing: 0.4 }}>
            {status === "loading"
              ? "LOADING & LABELING..."
              : activeFeedKey
              ? currentFeed.label.toUpperCase()
              : "SELECT A FEED"}
          </span>
          {status === "success" && (
            <span style={{ fontSize: 12, color: textTertiary }}>
              {filteredNews.length} article{filteredNews.length !== 1 ? "s" : ""}
              {activeLabel !== "All" && (
                <span style={{ color: currentFeed.color }}> · {activeLabel}</span>
              )}
            </span>
          )}
        </div>

        {/* Idle state */}
        {status === "idle" && (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: textPrimary, marginBottom: 6 }}>
              What would you like to read?
            </div>
            <div style={{ fontSize: 13, color: textTertiary, marginBottom: 24 }}>
              Choose Tamil Nadu or International news above
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
              {FEEDS.map((feed) => (
                <button
                  key={feed.key}
                  onClick={() => fetchNews(feed)}
                  style={{
                    fontSize: 13,
                    color: feed.textColor,
                    background: feed.bg,
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 20px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {feed.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error state */}
        {status === "error" && (
          <div style={{ textAlign: "center", padding: "3rem 0" }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#A32D2D", marginBottom: 4 }}>
              Failed to load
            </div>
            <div style={{ fontSize: 13, color: textTertiary }}>
              Make sure the backend is running on port 5000
            </div>
          </div>
        )}

        {/* Loading skeletons */}
        {status === "loading" &&
          [1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ padding: "16px 0", borderBottom: "0.5px solid " + border }}>
              <div style={{ height: 14, background: skel, borderRadius: 4, width: "85%", marginBottom: 8 }} />
              <div style={{ height: 14, background: skel, borderRadius: 4, width: "60%", marginBottom: 10 }} />
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ height: 12, background: skel, borderRadius: 4, width: 60 }} />
                <div style={{ height: 12, background: skel, borderRadius: 4, width: 40 }} />
              </div>
            </div>
          ))}

        {/* No results */}
        {status === "success" && filteredNews.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem 0" }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: textPrimary, marginBottom: 4 }}>
              No articles found
            </div>
            <div style={{ fontSize: 13, color: textTertiary }}>
              {search || activeLabel !== "All"
                ? "Try a different label or clear the search"
                : "Try again later"}
            </div>
          </div>
        )}

        {/* News list */}
        {status === "success" &&
          filteredNews.map((item, i) => (
            <div
              key={item.link || i}
              style={{
                padding: "16px 0",
                borderBottom: "0.5px solid " + border,
                borderTop: i === 0 ? "0.5px solid " + border : "none",
              }}
            >
              {/* Label pill on each card */}
              {item.label && item.label !== "News" && (
                <div style={{ marginBottom: 6 }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: 0.4,
                      color: currentFeed.textColor,
                      background: currentFeed.bg,
                      padding: "2px 8px",
                      borderRadius: 999,
                      textTransform: "uppercase",
                    }}
                  >
                    {LABEL_EMOJI[item.label]} {item.label}
                  </span>
                </div>
              )}

              <div
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  lineHeight: 1.45,
                  marginBottom: 8,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  color: textPrimary,
                }}
              >
                {item.title}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      background: currentFeed.bg,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      fontWeight: 600,
                      color: currentFeed.textColor,
                    }}
                  >
                    {initials(item.source)}
                  </span>
                  <span style={{ fontSize: 12, color: textSecondary, fontWeight: 500 }}>
                    {item.source}
                  </span>
                  <span style={{ color: border, fontSize: 11 }}>·</span>
                  <span style={{ fontSize: 12, color: textTertiary }}>{timeAgo(item.pubDate)}</span>
                </div>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 12, color: currentFeed.color, textDecoration: "none" }}
                >
                  Read ↗
                </a>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}