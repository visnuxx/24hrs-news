# Briefed - 24hrs News

Briefed is a full-stack news aggregator for recent headlines. The backend collects RSS feeds, removes duplicates, labels stories with keyword rules, caches results on disk, and can generate daily editorial briefings with Gemini. The frontend is a React/Vite app with feed tabs, filtering, search, grid/list views, dark mode, and WhatsApp sharing.

Live demo: https://24hrs-news.vercel.app

## Features

- Tamil Nadu, Tamil-language, and International news feeds
- RSS fetching from BBC, Google News, The Hindu, Dinamalar, Vikatan, News18 Tamil, OneIndia, and other sources
- 24-hour article cache stored in `backend/.cache`
- One-hour briefing cache that resets after midnight
- Keyword-based topic labels: Politics, Business, Technology, Sports, Crime, Entertainment, Health, Climate, World, and Conflict
- Gemini-powered daily briefing with keyword-grouped fallback when `GEMINI_API_KEY` is missing or Gemini fails
- Article deduplication across overlapping sources
- Image extraction from common RSS media fields
- Grid and list article views
- Topic/source filters and headline search
- Dark/light mode
- English/Tamil UI strings
- WhatsApp article sharing

## Project Structure

```text
24hrs News/
|-- backend/
|   |-- app.js
|   |-- package.json
|   `-- src/
|       |-- config/
|       |   `-- newsConfig.js
|       |-- routes/
|       |   |-- cacheRoutes.js
|       |   `-- newsRoutes.js
|       |-- services/
|       |   |-- briefingService.js
|       |   |-- cacheService.js
|       |   |-- categoryService.js
|       |   `-- feedService.js
|       `-- utils/
|           `-- imageUtils.js
|-- frontend/
|   |-- index.html
|   |-- package.json
|   |-- vite.config.js
|   `-- src/
|       |-- App.jsx
|       |-- main.jsx
|       |-- components/
|       |   `-- index.jsx
|       |-- constants/
|       |   |-- news.js
|       |   `-- translations.js
|       |-- styles/
|       |   `-- globalStyles.js
|       `-- utils/
|           |-- newsUtils.js
|           `-- theme.js
|-- README.md
`-- .gitignore
```

## Tech Stack

| Area | Tools |
| --- | --- |
| Frontend | React 19, Vite 8 |
| Backend | Node.js, Express 5 |
| RSS | axios, xml2js |
| AI briefing | Gemini 2.0 Flash |
| Styling | CSS-in-JS/global style injection |
| Cache | Local JSON files |

## Requirements

- Node.js 18 or newer
- npm
- Gemini API key, optional

The app still runs without a Gemini key. Articles continue to load and briefings use the built-in keyword fallback.

## Setup

Install backend dependencies:

```bash
cd backend
npm install
```

Optional: create `backend/.env` for AI briefings:

```env
GEMINI_API_KEY=your_api_key_here
```

Start the backend:

```bash
npm run dev
```

When you run the backend on your machine, it runs on:

```text
http://localhost:5000
```

The frontend is currently configured to use the deployed backend:

```text
https://two4hrs-news.onrender.com
```

Install frontend dependencies in another terminal:

```bash
cd frontend
npm install
```

Start the frontend:

```bash
npm run dev
```

The frontend usually runs on:

```text
http://localhost:5173
```

## Scripts

Backend:

```bash
npm run dev
npm start
```

Frontend:

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/news/international` | International headlines |
| GET | `/news/tamil-nadu` | Tamil Nadu English headlines |
| GET | `/news/tamil` | Tamil-language headlines |
| GET | `/news/briefing/:feedKey` | Daily briefing for `international`, `tamilNadu`, or `tamil` |
| DELETE | `/cache/:feedKey` | Clear article cache for a feed |
| DELETE | `/cache/briefing/:feedKey` | Clear briefing cache for a feed |

Example article:

```json
{
  "title": "Example headline",
  "link": "https://example.com/story",
  "pubDate": "Wed, 06 May 2026 10:30:00 GMT",
  "source": "BBC News",
  "image": "https://example.com/image.jpg",
  "label": "World"
}
```

Example briefing:

```json
{
  "generatedAt": "2026-05-06T10:30:00.000Z",
  "feedKey": "international",
  "totalArticles": 24,
  "fallback": false,
  "sections": [
    {
      "number": 1,
      "heading": "Top Stories",
      "summary": "A short section summary.",
      "bullets": [
        {
          "text": "A rewritten briefing bullet.",
          "source": "BBC News",
          "link": "https://example.com/story",
          "pubDate": "Wed, 06 May 2026 10:30:00 GMT",
          "label": "World"
        }
      ]
    }
  ]
}
```

## Cache

Article cache files are stored in:

```text
backend/.cache/
```

Article cache TTL is 24 hours. Briefing cache TTL is 1 hour and is invalidated when the day changes.

Clear caches manually on your local backend:

```bash
curl -X DELETE http://localhost:5000/cache/international
curl -X DELETE http://localhost:5000/cache/tamilNadu
curl -X DELETE http://localhost:5000/cache/tamil
curl -X DELETE http://localhost:5000/cache/briefing/international
curl -X DELETE http://localhost:5000/cache/briefing/tamilNadu
curl -X DELETE http://localhost:5000/cache/briefing/tamil
```

For the deployed backend, replace `http://localhost:5000` with:

```text
https://two4hrs-news.onrender.com
```

## Configuration

Backend configuration lives in:

```text
backend/src/config/newsConfig.js
```

Use this file to change:

- `CACHE_DIR`
- `CACHE_TTL_MS`
- RSS feed lists
- valid topic labels

Topic keyword rules live in:

```text
backend/src/services/categoryService.js
```

Gemini briefing logic lives in:

```text
backend/src/services/briefingService.js
```

Frontend feed constants live in:

```text
frontend/src/constants/news.js
```

## Production Build

Build the frontend:

```bash
cd frontend
npm run build
```

The output is written to:

```text
frontend/dist/
```

Start the backend in production mode:

```bash
cd backend
npm start
```

## Notes

- `frontend/src/constants/news.js` currently uses `https://two4hrs-news.onrender.com`.
- `http://localhost:5000` appears in this README only for local backend development.
- If you want frontend and backend to run fully locally, change `API_BASE` to `http://localhost:5000`.
- The backend warms all three feeds shortly after startup.

## License

ISC
