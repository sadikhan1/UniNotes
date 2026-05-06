# UniNotes

A full-stack web application for sharing and managing university notes.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Deployment | Vercel (frontend) · Render (backend) |

## Project Structure

```
UniNotes/
├── frontend/   # React + Vite + Tailwind client
└── backend/    # Node.js + Express API server
```

## Local Setup

### Prerequisites

- Node.js v18+
- npm v9+
- A [Supabase](https://supabase.com) project (free tier is fine)

### 1. Clone the repository

```bash
git clone https://github.com/sadikhan1/UniNotes.git
cd UniNotes
```

### 2. Backend

```bash
cd backend
cp .env.example .env      # fill in your Supabase keys
npm install
npm run dev
```

The API will start on `http://localhost:5010`.

### 3. Frontend

```bash
cd frontend
cp .env.example .env      # set VITE_API_URL
npm install
npm run dev
```

The app will open on `http://localhost:5173`.

## Environment Variables

**backend/.env** (see `.env.example`)
```
PORT=5010
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
```

**frontend/.env** (see `.env.example`)
```
VITE_API_URL=http://localhost:5010
```

> Never commit real secrets. Only `.env.example` files are tracked in Git.

## Deployment

### Backend on Render

1. Create a new **Web Service** on Render and connect this repository.
2. Set **Root Directory** to `backend`.
3. Use these values:

```txt
Build Command: npm install
Start Command: npm start
```

4. Add environment variables from `backend/.env.example`:

```txt
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-vercel-app.vercel.app
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...
```

If you use multiple frontend domains (for example Vercel preview + production), set `FRONTEND_URL` as a comma-separated list.

### Frontend on Vercel

1. Import this repository into Vercel.
2. Set **Root Directory** to `frontend`.
3. Add the environment variable:

```txt
VITE_API_URL=https://your-render-service.onrender.com/api
```

4. Deploy.

This project includes an SPA rewrite config (`frontend/vercel.json`) so direct route refreshes (e.g. `/notes/123`) work correctly.
