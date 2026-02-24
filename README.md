# Tigris Umbra AI

A JRPG-style AI chatbot website with a built-in RAG (Retrieval-Augmented Generation) system.
Users can ask questions through the dialogue box, and the AI responds based on the knowledge base documents.

## Current Status

**Completed** — Frontend UI + AI Backend RAG integration:

- JRPG-style dialogue box with pixel-art borders
- Animated tiger avatar (Tigris Umbra)
- Typewriter animation for AI responses
- Pixel forest background
- Question logging to `questions.txt`
- RAG system: answers questions based on documents in `docs/`
- Fallback message with contact email when no answer is found
- Friendly message when Gemini API free tier quota is exceeded

## Tech Stack

### Frontend

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Framer Motion
- react-type-animation
- [Ark Pixel Font (方舟像素字體)](https://github.com/TakWolf/ark-pixel-font) — 10px proportional, OFL-licensed pixel font with unified metrics across Latin, 繁中, 简中, 日本語, 한국어

### AI Backend

- Python 3.10+ (server runs 3.10.12)
- FastAPI + uvicorn
- LangChain
- Google Gemini API (gemini-embedding-001 + gemini-2.5-flash)
- ChromaDB (local vector database)

## Architecture

```
User types question → DialogueBox.tsx
        ↓
/api/log-question (log question + forward to AI)
        ↓
FastAPI /chat (port 8000)
        ↓
gemini-embedding-001 embeds query → ChromaDB searches Top 3 chunks
        ↓
Found relevant docs  → gemini-2.5-flash generates answer
No relevant docs     → "My human didn't told me that..."
429 rate limit       → "Sorry, my human is poor..."
        ↓
Response sent back → TypeAnimation typewriter effect
```

## Local Development

### 1. Frontend

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### 2. AI Backend

```bash
cd src/ai_backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file:

```
GOOGLE_API_KEY=your-google-api-key
CONTACT_EMAIL=your-email@example.com
```

Place your knowledge base files in `src/ai_backend/docs/` (supports `.txt`, `.md`, `.pdf`), then build the vector database:

```bash
python ingest.py
```

Start FastAPI:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Environment Variables


| Variable          | Location                         | Description                                               |
| ----------------- | -------------------------------- | --------------------------------------------------------- |
| `GOOGLE_API_KEY`  | `src/ai_backend/.env`            | Google Gemini API key                                     |
| `CONTACT_EMAIL`   | `src/ai_backend/.env`            | Email shown when AI has no answer                         |
| `ALLOWED_ORIGINS` | `src/ai_backend/.env` (optional) | CORS allowed origins, defaults to `http://localhost:3002` |
| `FASTAPI_URL`     | Next.js env (optional)           | FastAPI URL, defaults to `http://localhost:8000`          |


## Updating the Knowledge Base

1. Add, edit, or remove files in `src/ai_backend/docs/` (`.txt` / `.md` / `.pdf`)
2. Rebuild the vector database:
  ```bash
   cd src/ai_backend
   source venv/bin/activate
   python ingest.py
  ```
3. No need to restart FastAPI — next query will use the updated vectors

## Ubuntu Server Deployment Guide

### Prerequisites

- Ubuntu 22.04 server
- Node.js 18+
- Python 3.10+ (server runs 3.10.12)
- nginx (configured to reverse-proxy to port 3002)
- pm2 (`npm install -g pm2`)

> **Important:** Local testing may fail on Python 3.14 due to ChromaDB/Pydantic v1 compatibility.
> The code is designed for Python 3.10-3.12 and will work correctly on your Ubuntu server.

---

## Scenario: Already Deployed Frontend, Now Adding AI Backend

If you previously deployed only the Next.js frontend and now want to add the AI chatbot backend, follow these complete steps on your Ubuntu server:

### Step 1 — Push and pull code

```bash
# On your local machine
git add .
git commit -m "Add AI chatbot backend"
git push

# SSH into your Ubuntu server
ssh your-user@your-server-ip

# Navigate to project and pull
cd /var/www/ai.tyhstudio.com   # or your actual project path
git pull
```

### Step 2 — Rebuild frontend (code changed)

```bash
npm install
npm run build
```

### Step 3 — Set up Python environment (first time for AI backend)

```bash
cd src/ai_backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Step 4 — Create .env file

```bash
nano .env
```

Add these lines (replace with your actual values):

```
GOOGLE_API_KEY=your-google-api-key
CONTACT_EMAIL=your-email@example.com
```

Save and exit (Ctrl+X, Y, Enter).

### Step 5 — Prepare knowledge base

Your docs are already in `src/ai_backend/docs/`. Edit them as needed:

```bash
nano docs/about.txt
```

Supported formats: `.txt`, `.md`, `.pdf`

### Step 6 — Build vector database

```bash
source venv/bin/activate
python ingest.py
```

You should see output like:

```
Loading documents from docs/ ...
  **/*.txt: 1 document(s)
Total: 1 document(s), split into 1 chunk(s).
Successfully ingested 1 chunk(s) into ChromaDB.
```

### Step 7 — Start FastAPI with pm2

```bash
cd /var/www/ai.tyhstudio.com   # back to project root

# Start AI backend (new service)
pm2 start "cd /var/www/ai.tyhstudio.com/src/ai_backend && source venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port 8000" --name ai-backend

# Restart existing Next.js frontend
pm2 restart nextjs-ai   # or whatever you named it

# Save pm2 config
pm2 save
```

### Step 8 — Verify everything works

```bash
# Check all services are running
pm2 list

# Test FastAPI directly
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What topics are in your knowledge base?"}'

# Check logs if issues
pm2 logs ai-backend --lines 50
pm2 logs nextjs-ai --lines 50
```

### Step 9 — Test from browser

Open your website and try asking a question in the chat box. The AI should now respond based on your `docs/` content.

---

## Future Updates Cheatsheet

### Code changes (frontend or backend)

```bash
cd /var/www/ai.tyhstudio.com
git pull
npm install && npm run build
cd src/ai_backend && source venv/bin/activate && pip install -r requirements.txt
cd ../..
pm2 restart all
```

### Knowledge base docs changed

```bash
cd /var/www/ai.tyhstudio.com/src/ai_backend
source venv/bin/activate
python ingest.py
# No need to restart — changes take effect on next query
```

### Check service status

```bash
pm2 list
pm2 logs ai-backend
pm2 logs nextjs-ai
```

---

## Port Configuration

| Port | Service              |
| ---- | -------------------- |
| 3002 | Next.js (frontend)   |
| 8000 | FastAPI (AI backend) |

# Common Error

You may not be able to run it because the Gemini API is unavailable in some regions. Please use a VPN when local test.

