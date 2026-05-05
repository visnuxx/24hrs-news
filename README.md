# Briefed · 24hrs News

A minimal, full-stack news aggregator that pulls the last 24 hours of headlines from RSS feeds, auto-labels each article by topic using the Gemini API (with a keyword-based fallback), and serves them through a clean React frontend.

🔗 **Live demo:** [24hrs-news.vercel.app](https://24hrs-news.vercel.app)

---

## Features

- **Three news feeds** — Tamil Nadu (English), Tamil-language, and International headlines
- **AI-powered labeling** — Gemini 2.0 Flash categorizes articles into 10 topics: Politics, Business, Technology, Sports, Crime, Entertainment, Health, Climate, World, and Conflict
- **AI Daily Briefing** — Gemini generates an editorial-style digest with lead stories, section summaries, and grouped bullets per feed; falls back to a keyword-grouped layout if Gemini is unavailable
- **Bilingual UI** — full English / Tamil (தமிழ்) interface toggle, with all labels, prompts, and placeholders translated
- **Grid & List views** — switch between a card grid and a compact list layout
- **Filter & search** — filter articles by topic label or source, and search headlines in real time
- **Source avatars** — each article shows an initials badge for its source; Google News city bylines are resolved automatically
- **WhatsApp share** — one-tap share button on every article
- **Skeleton loading** — shimmer placeholders while feeds are fetching
- **Dark / light mode** — toggle in one click; preference is applied instantly
- **24-hour file cache** — fetched feeds and AI briefings are cached to disk so repeat requests are instant and upstream RSS sources aren't hammered
- **Deduplication** — near-duplicate headlines from overlapping sources are removed on both the backend and frontend
- **Keyword fallback** — if Gemini is unavailable or the API key is missing, a deterministic keyword-matching system labels articles; nothing ever breaks silently
- **No database required** — JSON file cache only

---

## Project Structure

```
24hrs-news/
├── backend/
│   ├── app.js          # Express server — feed fetching, labeling, briefing, caching, routes
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx     # React UI — tabs, briefing view, label chips, search, grid/list, share
│       └── main.jsx
└── .gitignore
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8 |
| Backend | Node.js (v18+), Express 5 |
| AI | Google Gemini 2.0 Flash |
| RSS parsing | xml2js, axios |
| Styling | Vanilla CSS-in-JS (no framework) |
| Fonts | Playfair Display, Inter (Google Fonts) |
| Deployment | Vercel (frontend), Render (backend) |

---

## Prerequisites

- **Node.js** v18 or later
- A **Gemini API key** (optional — the app works without one via keyword fallback)
  - Get a free key at [Google AI Studio](https://aistudio.google.com/app/apikey)

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/visnuxx/24hrs-news.git
cd 24hrs-news
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
GEMINI_API_KEY=your_api_key_here
```

> If you skip this step the app still works — articles will be labeled using built-in keyword rules, and the AI Briefing will fall back to a keyword-grouped digest.

Start the backend:

```bash
npm run dev      # development (nodemon, auto-restarts)
# or
npm start        # production
```

The server runs on **http://localhost:5000**.

### 3. Set up the frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server runs on **http://localhost:5173** (default Vite port).

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/news/international` | International headlines (BBC, Google News) |
| `GET` | `/news/tamil-nadu` | Tamil Nadu English headlines (The Hindu, Google News) |
| `GET` | `/news/tamil` | Tamil-language headlines (Dinamalar, BBC Tamil, News18 Tamil, OneIndia Tamil) |
| `GET` | `/news/briefing/:feedKey` | AI-generated daily briefing for a feed (`international`, `tamilNadu`, or `tamil`) |
| `DELETE` | `/cache/:feedKey` | Force-clear the article cache for a feed |
| `DELETE` | `/cache/briefing/:feedKey` | Force-clear the briefing cache for a feed |

### Example article response item

```json
{
  "title": "India signs new trade agreement with EU",
  "link": "https://...",
  "pubDate": "Mon, 13 Apr 2026 08:30:00 +0000",
  "source": "BBC News",
  "label": "Business"
}
```

### Example briefing response

```json
{
  "sections": [
    {
      "topic": "Politics",
      "summary": "One-sentence section summary.",
      "bullets": [
        { "title": "Headline text", "link": "https://...", "pubDate": "..." }
      ]
    }
  ]
}
```

### Force a cache refresh

```bash
# Clear article cache
curl -X DELETE http://localhost:5000/cache/international
curl -X DELETE http://localhost:5000/cache/tamilNadu
curl -X DELETE http://localhost:5000/cache/tamil

# Clear briefing cache
curl -X DELETE http://localhost:5000/cache/briefing/international
curl -X DELETE http://localhost:5000/cache/briefing/tamilNadu
```

---

## Configuration

All configuration lives at the top of `backend/app.js`:

| Constant | Default | Description |
|----------|---------|-------------|
| `CACHE_TTL_MS` | `86400000` (24 h) | How long a cached feed is considered fresh |
| `CACHE_DIR` | `backend/.cache/` | Directory where JSON cache files are written |
| `FEEDS` | BBC, Google News, The Hindu, Dinamalar, BBC Tamil, etc. | RSS sources per feed key |
| `VALID_LABELS` | 10 topic strings | Labels Gemini is allowed to assign |

To add a new RSS source, append an entry to the relevant array inside `FEEDS`:

```js
const FEEDS = {
  international: [
    { url: "http://feeds.bbci.co.uk/news/rss.xml", source: "BBC News" },
    { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", source: "NYT" }, // new
  ],
  ...
};
```

---

## How Labeling Works

1. After fetching and deduplicating articles, the backend sends titles to **Gemini 2.0 Flash** in batches of 150 with a strict JSON-only prompt.
2. If Gemini returns a valid label from the allowed list, it is used.
3. If Gemini fails, is rate-limited, or returns an unrecognized label, the article falls back to **keyword matching** — a priority-ordered list of exact and partial keyword rules (see `KEYWORD_RULES` in `app.js`).
4. The final labeled list is written to the disk cache and served directly on subsequent requests until the TTL expires.

## How the AI Briefing Works

1. When `/news/briefing/:feedKey` is requested, the backend fetches the current article list for that feed.
2. Titles are sent to **Gemini 2.0 Flash** with an editorial prompt asking for grouped sections, a lead story, bullet summaries, and one-sentence section overviews — all as strict JSON.
3. The response is validated and written to a separate briefing cache file.
4. Concurrent requests for the same feed await the same in-flight Gemini call (lock-based deduplication) instead of triggering duplicate API calls.
5. If Gemini is unavailable, a keyword-grouped fallback briefing is returned instead.

---

## Building for Production

```bash
# Build the frontend
cd frontend
npm run build
# Output: frontend/dist/

# Optionally serve the dist folder from Express by adding to app.js:
# app.use(express.static(path.join(__dirname, '../frontend/dist')));
```

---

## License

ISC