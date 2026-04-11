import { useState } from "react";

const API_BASE = "http://localhost:5000";

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
    const k = (i.title || "").toLowerCase().slice(0, 60);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function within24h(item) {
  if (!item.pubDate) return true;
  return Date.now() - new Date(item.pubDate) < 86400000;
}

export default function App() {
  const [news, setNews] = useState([]);
  const [status, setStatus] = useState("idle");
  const [dark, setDark] = useState(false);

  const bg = dark ? "#0f0f0f" : "#ffffff";
  const textPrimary = dark ? "#f0f0ee" : "#1a1a1a";
  const textSecondary = dark ? "#888" : "#555";
  const textTertiary = dark ? "#555" : "#999";
  const border = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const skel = dark ? "#1e1e1e" : "#efefed";

  async function fetchNews() {
    setStatus("loading");
    try {
      const res = await fetch(`${API_BASE}/news`);
      if (!res.ok) throw new Error();
      let data = await res.json();
      data = dedupe(data.filter(within24h));
      setNews(data);
      setStatus("success");
    } catch {
      setNews([]);
      setStatus("error");
    }
  }

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: bg, minHeight: "100vh", color: textPrimary, transition: "background 0.2s" }}>
      <div style={{ maxWidth: 660, margin: "0 auto", padding: "2rem 1.25rem 4rem" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#378ADD" }} />
            <span style={{ fontSize: 20, fontWeight: 500, letterSpacing: -0.5 }}>briefed</span>
            <span style={{ fontSize: 11, color: "#185FA5", background: "#E6F1FB", padding: "2px 8px", borderRadius: 999, fontWeight: 500 }}>live</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={fetchNews}
              style={{ fontSize: 12, color: "#185FA5", background: "#E6F1FB", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontFamily: "inherit" }}
            >
              Load News
            </button>
            <button
              onClick={() => setDark(d => !d)}
              style={{ fontSize: 12, color: textTertiary, background: "none", border: `0.5px solid ${border}`, borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit" }}
            >
              {dark ? "light" : "dark"}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: "0.5px", background: border, marginBottom: "1.5rem" }} />

        {/* Feed label */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <span style={{ fontSize: 12, color: textTertiary, letterSpacing: 0.4 }}>
            {status === "loading" ? "LOADING..." : "LATEST"}
          </span>
          {status === "success" && (
            <span style={{ fontSize: 12, color: textTertiary }}>{news.length} article{news.length !== 1 ? "s" : ""}</span>
          )}
        </div>

        {/* Idle */}
        {status === "idle" && (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: textPrimary, marginBottom: 6 }}>Latest BBC News</div>
            <div style={{ fontSize: 13, color: textTertiary, marginBottom: 24 }}>Click the button to load today's headlines</div>
            <button
              onClick={fetchNews}
              style={{ fontSize: 13, color: "#185FA5", background: "#E6F1FB", border: "none", borderRadius: 8, padding: "8px 20px", cursor: "pointer", fontFamily: "inherit" }}
            >
              Load News
            </button>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div style={{ textAlign: "center", padding: "3rem 0" }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#A32D2D", marginBottom: 4 }}>Failed to load</div>
            <div style={{ fontSize: 13, color: textTertiary }}>Make sure the backend is running on port 5000</div>
          </div>
        )}

        {/* Loading skeletons */}
        {status === "loading" && [1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ padding: "16px 0", borderBottom: `0.5px solid ${border}` }}>
            <div style={{ height: 14, background: skel, borderRadius: 4, width: "85%", marginBottom: 8 }} />
            <div style={{ height: 14, background: skel, borderRadius: 4, width: "60%", marginBottom: 10 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ height: 12, background: skel, borderRadius: 4, width: 60 }} />
              <div style={{ height: 12, background: skel, borderRadius: 4, width: 40 }} />
            </div>
          </div>
        ))}

        {/* Empty */}
        {status === "success" && news.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem 0" }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: textPrimary, marginBottom: 4 }}>No articles found</div>
            <div style={{ fontSize: 13, color: textTertiary }}>Try again later</div>
          </div>
        )}

        {/* News feed */}
        {status === "success" && news.map((item, i) => (
          <div key={item.link || i} style={{
            padding: "16px 0",
            borderBottom: `0.5px solid ${border}`,
            borderTop: i === 0 ? `0.5px solid ${border}` : "none"
          }}>
            <div style={{
              fontSize: 15, fontWeight: 500, lineHeight: 1.45, marginBottom: 8,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
              color: textPrimary
            }}>
              {item.title}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  width: 20, height: 20, borderRadius: 4, background: "#E6F1FB",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, fontWeight: 600, color: "#185FA5"
                }}>
                  {initials(item.source || "BBC")}
                </span>
                <span style={{ fontSize: 12, color: textSecondary, fontWeight: 500 }}>{item.source || "BBC News"}</span>
                <span style={{ color: border, fontSize: 11 }}>·</span>
                <span style={{ fontSize: 12, color: textTertiary }}>{timeAgo(item.pubDate)}</span>
              </div>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, color: "#185FA5", textDecoration: "none" }}
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