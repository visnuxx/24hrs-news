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

  .list-item:hover { background: var(--surface2); }

  .jump-nav {
    position: sticky;
    top: 60px;
    z-index: 100;
    background: rgba(246,247,249,0.92);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    margin: 0 -20px;
    padding: 0 20px;
    transition: box-shadow 0.2s;
  }
  body.dark .jump-nav {
    background: rgba(17,16,9,0.92);
  }
  .jump-pill {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 500; letter-spacing: 0.2px;
    padding: 5px 13px; border-radius: 100px; border: none;
    cursor: pointer; white-space: nowrap; transition: all 0.15s;
    background: transparent; color: var(--text3);
    flex-shrink: 0;
  }
  .jump-pill:hover { color: var(--text1); background: var(--surface2); }
  .jump-pill.active { background: var(--surface); color: var(--text1); box-shadow: var(--shadow-sm); border: 1px solid var(--border); }

  .lead-story-card:hover .lead-story-title {
    text-decoration: underline;
    text-decoration-color: rgba(0,0,0,0.2);
  }

  @keyframes leadIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  .lead-in { animation: leadIn 0.3s ease both; }

  @media (max-width: 600px) {
    .card-grid { grid-template-columns: 1fr; }
    .hero-brief { flex-direction: column; align-items: flex-start !important; }
    .header-inner { height: 52px; }
  }
`;
document.head.appendChild(globalStyle);

// ---------- Constants ----------
