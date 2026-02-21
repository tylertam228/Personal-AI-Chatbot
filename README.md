# Tigris Umbra AI

An RPG-style AI chatbot frontend built with Next.js 16, Tailwind CSS, and Framer Motion.

## Current Status

**Frontend completed** — The chat UI is fully functional with:
- JRPG-style dialogue box with pixel-art borders
- Animated tiger avatar (Tigris Umbra)
- Typewriter text animation for AI responses
- Pixel forest background GIF
- Question logging to `questions.txt`

**No chat features yet** — All AI responses currently return a placeholder message. The RAG (Retrieval-Augmented Generation) backend integration is planned for a future update.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site in development.

## Production Deployment

```bash
npm run build
npm start
```

**Note:** Production runs on port **3002** (configured in `package.json`). This port was chosen because ports 3000 and 3001 are already in use by other services on the server.

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Framer Motion
- react-type-animation

## Planned Features

- RAG system integration for personalized AI responses
- Document ingestion (resume, project details, skills)
- Streaming chat responses via Vercel AI SDK
