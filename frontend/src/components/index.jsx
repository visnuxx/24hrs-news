import { useState, useEffect, useMemo, useRef } from "react";
import { API_BASE, FEEDS, TAMIL_FEED } from "../constants/news.js";
import { getCat, sourceLabel, initials, timeAgo, formatDate, formatFullDate, whatsappShare } from "../utils/newsUtils.js";
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
          ? <img src={image} alt="" onError={() => setImgErr(true)} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
          : <span style={{ fontSize:size * 0.38 }}>{cat.icon}</span>
        }
      </div>
    );
  }
  return (
    <div style={{ width:"100%", height, background:bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, overflow:"hidden", position:"relative" }}>
      {showImg
        ? <img src={image} alt="" onError={() => setImgErr(true)} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
        : <span style={{ fontSize:44 }}>{cat.icon}</span>
      }
    </div>
  );
};

// ---------- Sticky Header ----------
const Header = ({ dark, setDark, t }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive:true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header style={{
      position:"sticky", top:0, zIndex:200,
      background: scrolled ? "rgba(246,247,249,0.90)" : "transparent",
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

// ---------- Hero Banner ----------
const HeroBanner = ({ activeFeed, onReadBriefing, t }) => (
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
        ✦ Today's Briefing · {activeFeed ? t.feeds[activeFeed.key] : ""}
      </div>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:21, fontWeight:600, color:"var(--text1)", marginBottom:6, lineHeight:1.3 }}>
        {t.aiSummary}
      </div>
      <div style={{ fontSize:13, color:"var(--text2)", lineHeight:1.55 }}>{t.aiSubtitle}</div>
    </div>
    <div style={{ display:"flex", flexDirection:"column", gap:10, flexShrink:0 }}>
      <button onClick={onReadBriefing} style={{
        fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight:600,
        color:"#854F0B", background:"var(--surface)",
        border:"1.5px solid #854F0B", borderRadius:100,
        padding:"10px 22px", cursor:"pointer", whiteSpace:"nowrap",
        boxShadow:"var(--shadow-sm)", transition:"all 0.18s",
      }}
        onMouseEnter={e => { e.currentTarget.style.background = "#854F0B"; e.currentTarget.style.color = "white"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.color = "#854F0B"; }}
      >
        {t.readBriefing}
      </button>
    </div>
  </div>
);

// ============================================================
// ---------- BRIEFING VIEW (editorial, AI-powered) ----------
// ============================================================

// ── slug helper for section IDs ───────────────────────────────────────────────
const toSlug = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// ---------- Briefing Masthead ----------
const BriefingMasthead = ({ feedLabel, totalArticles, t }) => {
  const dateStr = formatFullDate(new Date().toISOString());
  const now = new Date();
  const readMins = totalArticles ? Math.max(3, Math.round(totalArticles / 18)) : null;
  return (
    <div style={{ marginBottom: 28, textAlign: "center" }}>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: 1.6,
        textTransform: "uppercase", color: "var(--text3)", marginBottom: 8,
      }}>
        {feedLabel} · Daily Briefing
      </div>
      <h1 style={{
        fontFamily: "'Playfair Display',serif",
        fontSize: 44, fontWeight: 600, letterSpacing: -1.2,
        color: "var(--text1)", lineHeight: 1.05, marginBottom: 12,
      }}>
        Today's Briefing
      </h1>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 12, fontSize: 12, color: "var(--text2)", fontStyle: "italic",
        marginBottom: 18, flexWrap: "wrap",
      }}>
        <span>{dateStr}</span>
        {readMins && (
          <>
            <span style={{ color: "var(--border)", fontStyle: "normal" }}>·</span>
            <span style={{ fontStyle: "normal", color: "var(--text3)", fontSize: 11 }}>~{readMins} min read</span>
          </>
        )}
      </div>
      <div style={{ height: 1, background: "var(--border)", width: 80, margin: "0 auto" }} />
    </div>
  );
};

// ---------- Lead Story (section 1 hero) ----------
const LeadStory = ({ section }) => {
  const lead = section.bullets[0];
  const rest = section.bullets.slice(1);
  const ago  = timeAgo(lead?.pubDate);
  if (!lead) return null;

  return (
    <div className="lead-in" style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      overflow: "hidden",
      marginBottom: 48,
    }}>
      {/* amber top bar */}
      <div style={{ height: 3, background: "linear-gradient(90deg, #BA7517, #EF9F27)" }} />

      <div style={{ padding: "28px 32px 24px" }}>
        {/* eyebrow */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 9, fontWeight: 700, letterSpacing: 1.2,
          textTransform: "uppercase", color: "#854F0B",
          background: "#FAEEDA", padding: "3px 10px",
          borderRadius: 100, marginBottom: 16,
        }}>
          ★ Lead Story
        </div>

        {/* section heading */}
        <div style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: 11, fontWeight: 400, color: "var(--text3)",
          letterSpacing: 1, textTransform: "uppercase", marginBottom: 8,
        }}>
          {section.heading}
        </div>

        {/* lead bullet as big headline */}
        <a
          href={lead.link || "#"} target="_blank" rel="noopener noreferrer"
          className="lead-story-card"
          style={{ display: "block", textDecoration: "none", marginBottom: 14 }}
        >
          <h2 className="lead-story-title" style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: 26, fontWeight: 600, lineHeight: 1.35,
            color: "var(--text1)", letterSpacing: -0.3,
          }}>
            {lead.text}
          </h2>
        </a>

        {/* section summary below headline */}
        {section.summary && (
          <p style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: 15, fontStyle: "italic",
            lineHeight: 1.65, color: "var(--text2)",
            marginBottom: 20,
          }}>
            {section.summary}
          </p>
        )}

        {/* source + time */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "var(--text3)", marginBottom: rest.length ? 22 : 0 }}>
          {lead.link ? (
            <a href={lead.link} target="_blank" rel="noopener noreferrer"
              style={{ color: "var(--text2)", borderBottom: "1px dotted var(--border)" }}>
              {sourceLabel(lead.source)}
            </a>
          ) : <span>{sourceLabel(lead.source)}</span>}
          {ago && <><span>·</span><span>{ago}</span></>}
        </div>

        {/* remaining bullets as compact list */}
        {rest.length > 0 && (
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <div style={{
              fontSize: 9, fontWeight: 700, letterSpacing: 1,
              textTransform: "uppercase", color: "var(--text3)", marginBottom: 12,
            }}>
              Also in this story
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {rest.map((b, i) => {
                const bAgo = timeAgo(b.pubDate);
                return (
                  <li key={b.link || i} style={{
                    position: "relative", paddingLeft: 18, marginBottom: 12,
                    fontSize: 14, lineHeight: 1.55, color: "var(--text1)",
                  }}>
                    <span style={{
                      position: "absolute", left: 0, top: 9,
                      width: 5, height: 5, borderRadius: "50%",
                      background: "#BA7517",
                    }} />
                    <span>{b.text}</span>
                    <span style={{ display: "block", marginTop: 3, fontSize: 11, color: "var(--text3)" }}>
                      {b.link
                        ? <a href={b.link} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text2)", borderBottom: "1px dotted var(--border)" }}>{sourceLabel(b.source)}</a>
                        : <span>{sourceLabel(b.source)}</span>
                      }
                      {bAgo && <> · {bAgo}</>}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// ---------- Jump Nav ----------
const JumpNav = ({ sections, activeSlug }) => {
  const navRef = useRef(null);

  // scroll the active pill into view inside the nav
  useEffect(() => {
    if (!navRef.current) return;
    const active = navRef.current.querySelector(".jump-pill.active");
    if (active) active.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeSlug]);

  const scrollTo = (slug) => {
    const el = document.getElementById(`section-${slug}`);
    if (!el) return;
    // offset for sticky header (60px) + jump nav (44px) + small gap
    const top = el.getBoundingClientRect().top + window.scrollY - 116;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div className="jump-nav" style={{ marginBottom: 0 }}>
      <div ref={navRef} className="chip-scroll" style={{ padding: "8px 0", gap: 4 }}>
        {sections.map((sec, i) => {
          const slug = toSlug(sec.heading);
          const isLead = i === 0;
          const on = activeSlug === slug;
          return (
            <button
              key={slug}
              className={`jump-pill${on ? " active" : ""}`}
              onClick={() => scrollTo(slug)}
            >
              {isLead && <span style={{ fontSize: 9, color: "#BA7517" }}>★</span>}
              {sec.heading}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ---------- Editorial Bullet ----------
const EditorialBullet = ({ bullet }) => {
  const ago = timeAgo(bullet.pubDate);
  return (
    <li style={{
      position: "relative",
      paddingLeft: 22, marginBottom: 14,
      fontFamily: "'Inter',sans-serif", fontSize: 15,
      lineHeight: 1.65, color: "var(--text1)",
      listStyle: "none",
    }}>
      <span style={{
        position: "absolute", left: 0, top: 10,
        width: 6, height: 6, borderRadius: "50%",
        background: "var(--text2)",
      }} />
      <span>{bullet.text}</span>
      <span style={{ display: "block", marginTop: 4, fontSize: 11, color: "var(--text3)" }}>
        {bullet.link ? (
          <a href={bullet.link} target="_blank" rel="noopener noreferrer"
            style={{ color: "var(--text2)", borderBottom: "1px dotted var(--text3)", paddingBottom: 1 }}>
            {sourceLabel(bullet.source)}
          </a>
        ) : (
          <span>{sourceLabel(bullet.source)}</span>
        )}
        {ago && <> · {ago}</>}
      </span>
    </li>
  );
};

// ---------- Editorial Section (sections 2+) ----------
const EditorialSection = ({ section, delay }) => {
  const slug = toSlug(section.heading);
  return (
    <section
      id={`section-${slug}`}
      className="fade-up"
      style={{ marginBottom: 44, animationDelay: `${delay}s`, scrollMarginTop: 120 }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 8 }}>
        <span style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: 22, fontWeight: 600, fontStyle: "italic",
          color: "var(--text3)", lineHeight: 1, minWidth: 28,
        }}>
          {String(section.number).padStart(2, "0")}.
        </span>
        <h2 style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: 24, fontWeight: 600, lineHeight: 1.25,
          color: "var(--text1)", letterSpacing: -0.4, flex: 1,
        }}>
          {section.heading}
        </h2>
      </div>

      {section.summary && (
        <p style={{
          marginLeft: 42, marginBottom: 18,
          fontFamily: "'Playfair Display',serif",
          fontSize: 15, fontStyle: "italic",
          lineHeight: 1.6, color: "var(--text2)",
        }}>
          {section.summary}
        </p>
      )}

      <ul style={{ marginLeft: 42, padding: 0 }}>
        {section.bullets.map((b, i) => (
          <EditorialBullet key={b.link || i} bullet={b} />
        ))}
      </ul>
    </section>
  );
};

// ---------- Skeleton Briefing ----------
const SkeletonBriefing = () => (
  <div>
    {/* skeleton lead */}
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)", padding: "28px 32px 24px", marginBottom: 48,
    }}>
      <div className="skel" style={{ width: 80, height: 18, borderRadius: 100, marginBottom: 16 }} />
      <div className="skel" style={{ width: "78%", height: 28, marginBottom: 10 }} />
      <div className="skel" style={{ width: "55%", height: 28, marginBottom: 16 }} />
      <div className="skel" style={{ width: "90%", height: 14, marginBottom: 6 }} />
      <div className="skel" style={{ width: "65%", height: 14 }} />
    </div>
    {[0, 1, 2, 3].map(i => (
      <div key={i} style={{ marginBottom: 44 }}>
        <div style={{ display: "flex", gap: 14, marginBottom: 12 }}>
          <div className="skel" style={{ width: 28, height: 22 }} />
          <div className="skel" style={{ width: "55%", height: 24 }} />
        </div>
        <div className="skel" style={{ width: "85%", height: 14, marginLeft: 42, marginBottom: 18 }} />
        <div style={{ marginLeft: 42 }}>
          {[0, 1, 2, 3].map(j => (
            <div key={j} style={{ marginBottom: 14 }}>
              <div className="skel" style={{ width: "92%", height: 14, marginBottom: 5 }} />
              <div className="skel" style={{ width: "30%", height: 10 }} />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// ---------- Briefing View ----------
const BriefingView = ({ feedKey, digestKey, t }) => {
  const [digest, setDigest]   = useState(null);
  const [status, setStatus]   = useState("loading");
  const [activeSlug, setActiveSlug] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setStatus("loading");
    setDigest(null);
    setActiveSlug(null);
    fetch(`${API_BASE}/news/briefing/${digestKey}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { setDigest(d); setStatus("success"); })
      .catch(() => setStatus("error"));
  }, [digestKey]);

  // Intersection observer to highlight active section in jump nav
  useEffect(() => {
    if (!digest || digest.sections.length === 0) return;
    const slugs = digest.sections.map(s => toSlug(s.heading));

    const observers = [];
    slugs.forEach((slug, i) => {
      const el = document.getElementById(`section-${slug}`);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSlug(slug); },
        { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach(o => o.disconnect());
  }, [digest]);

  // set initial active slug when sections load
  useEffect(() => {
    if (digest?.sections?.length > 0) {
      setActiveSlug(toSlug(digest.sections[0].heading));
    }
  }, [digest]);

  const [leadSection, ...restSections] = digest?.sections || [];

  return (
    <div ref={containerRef} style={{ maxWidth: 680, margin: "0 auto", padding: "0 4px" }}>
      <BriefingMasthead
        feedLabel={t.feeds[feedKey] || feedKey}
        totalArticles={digest?.totalArticles}
        t={t}
      />

      {status === "loading" && (
        <>
          <div style={{ textAlign: "center", fontSize: 12, color: "var(--text3)", letterSpacing: 0.4, marginBottom: 28 }}>
            {t.briefingLoading}
          </div>
          <SkeletonBriefing />
        </>
      )}

      {status === "error" && (
        <EmptyState icon="✦" title={t.briefingFailed} sub={t.backendError} />
      )}

      {status === "success" && digest && digest.sections.length === 0 && (
        <EmptyState icon="🌙" title={t.briefingEmpty} sub={t.briefingEmptySub} />
      )}

      {status === "success" && digest && digest.sections.length > 0 && (
        <>
          {digest.fallback && (
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <span style={{
                display: "inline-block", fontSize: 11, color: "var(--text3)",
                padding: "8px 14px", background: "var(--surface2)",
                border: "1px solid var(--border)", borderRadius: 100,
              }}>
                ⚠ {t.keywordFallback}
              </span>
            </div>
          )}

          {/* sticky jump nav */}
          <JumpNav sections={digest.sections} activeSlug={activeSlug} />

          {/* lead story — first section gets hero treatment */}
          {leadSection && (
            <div id={`section-${toSlug(leadSection.heading)}`} style={{ scrollMarginTop: 120, marginTop: 24 }}>
              <LeadStory section={leadSection} />
            </div>
          )}

          {/* remaining sections */}
          {restSections.map((section, i) => (
            <EditorialSection
              key={section.number || i}
              section={section}
              delay={Math.min(i * 0.07, 0.45)}
            />
          ))}

          <div style={{
            textAlign: "center", marginTop: 48, paddingTop: 24,
            borderTop: "1px solid var(--border)",
            fontSize: 11, color: "var(--text3)", letterSpacing: 0.4,
          }}>
            {digest.totalArticles} {t.articles} · {t.poweredByGemini}
            <div style={{ marginTop: 6, fontStyle: "italic" }}>briefed</div>
          </div>
        </>
      )}
    </div>
  );
};

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

      {advOpen && (
        <div style={{
          background:"var(--surface2)", border:"1px solid var(--border)",
          borderRadius:"var(--radius-md)", padding:"16px 16px 12px", marginBottom:12,
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
                <button style={chip(activeSource === "All", cf)} onClick={() => setActiveSource("All")}>{t.allSources}</button>
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

      <div style={{ position:"relative" }}>
        <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"var(--text3)", fontSize:15, pointerEvents:"none" }}>⌕</span>
        <input
          type="text" placeholder={t.searchPlaceholder} value={search}
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

// ---------- News Card ----------
const NewsCard = ({ item, feed, t, dark, delay }) => {
  const label = item.label || "News";
  const ago   = timeAgo(item.pubDate);

  return (
    <article
      className="news-card fade-up"
      onClick={() => item.link && window.open(item.link, "_blank", "noopener,noreferrer")}
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
        <div style={{ marginBottom:9 }}><CatBadge label={label} dark={dark} size="sm" /></div>
        <h3 style={{
          fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:400,
          lineHeight:1.55, color:"var(--text1)", flex:1, marginBottom:12,
          display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden",
        }}>
          {item.title}
        </h3>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", borderTop:"1px solid var(--border2)", paddingTop:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:7, minWidth:0 }}>
            <SourceAvatar src={item.source} feed={feed} size={22} />
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:11, color:"var(--text2)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:110 }}>{sourceLabel(item.source)}</div>
              {ago && <div style={{ fontSize:10, color:"var(--text3)" }}>{ago}</div>}
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:9, flexShrink:0 }}>
            <button onClick={e => { e.stopPropagation(); whatsappShare(item.title, item.link); }} style={{ fontSize:12, fontWeight:500, color:"#25D366", background:"none", border:"none", padding:0 }}>↗</button>
            <a href={item.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              style={{ fontSize:11, fontWeight:600, color:feed.accent, padding:"4px 11px", borderRadius:100, border:`1px solid ${feed.accent}` }}>
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
        animationDelay:`${delay}s`, borderRadius:"var(--radius-sm)",
      }}
    >
      <Thumb label={label} dark={dark} image={item.image} mode="square" size={76} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ marginBottom:6 }}><CatBadge label={label} dark={dark} size="xs" /></div>
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
            <span style={{ fontSize:11, color:"var(--text2)", maxWidth:100, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{sourceLabel(item.source)}</span>
            {ago && <><span style={{ fontSize:10, color:"var(--text3)" }}>·</span><span style={{ fontSize:10, color:"var(--text3)" }}>{ago}</span></>}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:9, flexShrink:0 }}>
            <button onClick={e => { e.stopPropagation(); whatsappShare(item.title, item.link); }} style={{ fontSize:11, fontWeight:500, color:"#25D366", background:"none", border:"none", padding:0 }}>↗</button>
            <a href={item.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize:11, fontWeight:600, color:feed.accent }}>{t.read} →</a>
          </div>
        </div>
      </div>
    </article>
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
export {
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
};
