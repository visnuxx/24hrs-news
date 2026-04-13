# briefed · 24hrs News

A minimal, full-stack news aggregator that pulls the last 24 hours of headlines from RSS feeds, auto-labels each article by topic using the Gemini API (with a keyword-based fallback), and serves them through a clean React frontend.


## Features

- **Two news feeds** — Tamil Nadu (regional) and International headlines
- **AI-powered labeling** — Gemini 2.0 Flash categorizes articles into 10 topics: Politics, Business, Technology, Sports, Crime, Entertainment, Health, Climate, World, and Conflict
- **Keyword fallback** — if Gemini is unavailable or the API key is missing, a deterministic keyword-matching system labels articles instead; nothing ever breaks silently
- **24-hour file cache** — fetched feeds are cached to disk so repeat requests are instant and upstream RSS sources aren't hammered
- **Deduplication** — near-duplicate headlines from overlapping sources are removed on both the backend and frontend
- **Filter & search** — filter articles by topic label or search headlines in real time
- **Dark / light mode** — toggle in one click
- **No database required** — JSON file cache only

---

## Project Structure

```
24hrs-news/
├── backend/
│   ├── app.js          # Express server — feed fetching, labeling, caching, routes
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx     # React UI — tabs, label chips, search, article list
│       └── main.jsx
└── .gitignore
```

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

> If you skip this step the app still works — all articles will be labeled using the built-in keyword rules instead of Gemini.

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
| `GET` | `/news/tamil-nadu` | Tamil Nadu headlines (The Hindu, Google News) |
| `DELETE` | `/cache/:feedKey` | Force-clear the cache for a feed (`international` or `tamilNadu`) |

### Example response item

```json
{
  "title": "India signs new trade agreement with EU",
  "link": "https://...",
  "pubDate": "Mon, 13 Apr 2026 08:30:00 +0000",
  "source": "BBC News",
  "label": "Business"
}
```

### Force a cache refresh

```bash
curl -X DELETE http://localhost:5000/cache/international
curl -X DELETE http://localhost:5000/cache/tamilNadu
```

---

## Configuration

All configuration lives at the top of `backend/app.js`:

| Constant | Default | Description |
|----------|---------|-------------|
| `CACHE_TTL_MS` | `86400000` (24 h) | How long a cached feed is considered fresh |
| `CACHE_DIR` | `backend/.cache/` | Directory where JSON cache files are written |
| `FEEDS` | BBC, Google News, The Hindu | RSS sources per feed key |
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

---

## Building for Production

```bash
# Build the frontend
cd frontend
npm run build
# Output: frontend/dist/

# Optionally serve the dist folder from Express by adding:
# app.use(express.static(path.join(__dirname, '../frontend/dist')));
```

---

## License

ISC