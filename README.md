# Briefed - 24hrs News

Briefed is a full-stack news briefing app for recent Tamil Nadu, Tamil-language, and international headlines. It fetches public RSS feeds, removes duplicate stories, labels topics, caches results locally, and generates an optional daily editorial briefing with Gemini.

Live demo: https://24hrs-news.vercel.app

## Why This Project Matters

The project is built like a practical newsroom dashboard: it can still serve news when AI is unavailable, keeps free API usage under control with caching, and gives readers fast filters, search, source labels, dark mode, Tamil UI text, and WhatsApp sharing.

## Features

- Tamil Nadu, Tamil-language, and international news feeds
- RSS aggregation from BBC, Google News, The Hindu, Dinamalar, Vikatan, News18 Tamil, OneIndia, and more
- 24-hour article cache stored in `backend/.cache`
- One-hour briefing cache that also resets after midnight
- Gemini-powered daily briefing with a keyword-grouped fallback
- Quota-safe Gemini behavior: no Gemini call is made while a valid briefing cache exists
- Article deduplication across overlapping RSS sources
- Topic/source filters, headline search, grid/list views, dark mode, and Tamil/English UI toggle
- Free-tier friendly deployment with Vercel frontend and Render backend

## Architecture

```text
React/Vite frontend
  -> Express API
    -> RSS feed fetchers
    -> local JSON cache
    -> keyword labels
    -> optional Gemini briefing
    -> keyword fallback when Gemini is missing, quota-limited, or unavailable
```

## Tech Stack

| Area | Tools |
| --- | --- |
| Frontend | React 19, Vite 8 |
| Backend | Node.js, Express 5 |
| RSS | axios, xml2js |
| AI briefing | Gemini 2.0 Flash API, optional |
| Styling | CSS-in-JS/global style injection |
| Cache | Local JSON files |
| Tests | Node built-in test runner |

## Requirements

- Node.js 18 or newer
- npm
- Optional free Gemini API key

The app works without Gemini. When `GEMINI_API_KEY` is missing, invalid, quota-limited, or temporarily unavailable, the backend returns a keyword-grouped briefing fallback.

## Local Setup

Install backend dependencies:

```bash
cd backend
npm install
```

Create a backend env file:

```bash
copy .env.example .env
```

Set `GEMINI_API_KEY` only if you want AI-generated briefings. Leave it blank for fallback mode.

Start the backend:

```bash
npm run dev
```

The backend defaults to:

```text
http://localhost:5000
```

Install frontend dependencies in another terminal:

```bash
cd frontend
npm install
```

Create a frontend env file:

```bash
copy .env.example .env
```

Start the frontend:

```bash
npm run dev
```

The frontend usually runs on:

```text
http://localhost:5173
```

## Environment Variables

Backend:

| Name | Required | Default | Notes |
| --- | --- | --- | --- |
| `PORT` | No | `5000` | Render sets this automatically in production. |
| `GEMINI_API_KEY` | No | empty | Optional free Gemini key for AI briefings. |

Frontend:

| Name | Required | Default | Notes |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | No | `http://localhost:5000` | Set this to the deployed backend URL on Vercel. |

## Scripts

Backend:

```bash
npm run dev
npm start
npm test
```

Frontend:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/health` | Basic backend health check |
| GET | `/news/international` | International headlines |
| GET | `/news/tamil-nadu` | Tamil Nadu English headlines |
| GET | `/news/tamil` | Tamil-language headlines |
| GET | `/news/briefing/:feedKey` | Daily briefing for `international`, `tamilNadu`, or `tamil` |
| DELETE | `/cache/:feedKey` | Clear article cache for a feed |
| DELETE | `/cache/briefing/:feedKey` | Clear briefing cache for a feed |

Example health response:

```json
{
  "status": "ok",
  "uptime": 42,
  "timestamp": "2026-05-08T10:30:00.000Z"
}
```

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

## Gemini Free API Usage

Gemini is used carefully because free API quota is limited:

- Briefings are cached for one hour.
- Briefing cache also expires when the date changes.
- The backend does not call Gemini when a valid briefing cache exists.
- Gemini input is capped to the latest 60 same-day articles.
- If Gemini fails, returns quota errors, or the key is absent, the app uses the built-in keyword fallback.
- API keys are never logged or committed.

## Free Deployment

Frontend: deploy `frontend/` to Vercel free tier.

Set this Vercel env var:

```text
VITE_API_BASE_URL=https://your-render-backend.onrender.com
```

Backend: deploy `backend/` to Render free tier.

Set this Render env var only if using Gemini:

```text
GEMINI_API_KEY=your_free_gemini_key
```

Free-tier limitations to expect:

- Render free backend can sleep and take a moment to wake up.
- Public RSS sources can rate-limit or change feeds.
- Gemini free quota can be exhausted; fallback mode keeps the app usable.

## Test And Build

Run backend tests:

```bash
cd backend
npm test
```

Run frontend checks:

```bash
cd frontend
npm run lint
npm run build
```

## Project Structure

```text
24hrs News/
|-- backend/
|   |-- app.js
|   |-- .env.example
|   |-- package.json
|   |-- src/
|   `-- test/
|-- frontend/
|   |-- .env.example
|   |-- eslint.config.js
|   |-- package.json
|   `-- src/
|-- README.md
`-- .gitignore
```

## Notes

- Local JSON cache files are stored in `backend/.cache/` and ignored by Git.
- The frontend defaults to local backend development when no `.env` file exists.
- Existing deployed URLs can still be used by setting `VITE_API_BASE_URL`.
- The app is designed to remain usable without paid hosting, paid databases, or paid APIs.

## License

ISC
