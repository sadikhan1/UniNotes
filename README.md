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
git clone https://github.com/sadikhan0/UniNotes.git
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
