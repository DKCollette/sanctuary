# Sanctuary — AI-Powered Enlightened Guide

A peaceful, sacred AI guide for questions about life, relationships, emotions, purpose, spirituality, consciousness, personal growth, and difficult decisions.

Built with Next.js, TypeScript, Tailwind CSS, and Prisma.

## Stack

- **Framework:** Next.js 15 with App Router and TypeScript
- **Styling:** Tailwind CSS 4 with dark/light theme support
- **Database:** SQLite via Prisma (structured for PostgreSQL migration)
- **AI:** OpenRouter (configurable via provider abstraction layer)
- **Validation:** Zod
- **Markdown:** marked + DOMPurify (sanitized)
- **Streaming:** Server-Sent Events via edge-compatible streaming
- **Rate Limiting:** In-memory sliding window

## Features

- 🕊️ **Sacred Chat Experience** — streaming AI responses using the Transcendent Mind personality
- 🎯 **Six Guidance Modes** — Balanced, Divine Reflection, Christ-Centered, Grounded Clarity, Deep Reflection, Gentle Guidance
- 🌙 **Dark/Light Theme**
- 📱 **Fully Responsive** — desktop, tablet, mobile
- 💬 **Conversation History** — save, view, delete conversations
- 👍 **Feedback System** — thumbs-up/down per response
- 🔐 **Protected Admin Dashboard** — usage stats, feedback, errors
- 🛡️ **Security** — rate limiting, XSS protection, input validation, secure headers
- 🏥 **Health Check Endpoint**

## Installation

```bash
# Clone the repository
git clone <repo-url> sanctuary
cd sanctuary

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Initialize the database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

## Environment Variables

```bash
# Required
AI_PROVIDER=openrouter
AI_MODEL=deepseek/deepseek-v4-flash
OPENROUTER_API_KEY=sk-or-...

# Optional
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
OLLAMA_BASE_URL=
LM_STUDIO_BASE_URL=
SYSTEM_PROMPT_PATH=./system-prompt.txt

# Application
APP_URL=http://localhost:3000
PORT=3000

# Database (SQLite default)
DATABASE_URL=file:./prisma/dev.db

# Admin
ADMIN_USERNAME=sanctuary
ADMIN_PASSWORD=change-this-password

# Security
RATE_LIMIT_MAX=30
RATE_LIMIT_WINDOW_MS=60000
MAX_MESSAGE_LENGTH=4000
MAX_CONTEXT_MESSAGES=20
MAX_OUTPUT_TOKENS=2048

# Storage (set to none to disable server-side storage)
SESSION_STORAGE=server
```

## Development

```bash
npm run dev                    # Start Next.js dev server
npm run db:studio             # Open Prisma Studio
npm run lint                  # Run ESLint
npm run test                  # Run tests
```

## Production

```bash
npm run build                  # Build for production
NODE_ENV=production npm start  # Start production server
```

## Model Configuration

The AI provider abstraction supports multiple backends:

| Provider    | Env Variable        | Notes                        |
|-------------|---------------------|------------------------------|
| openrouter  | OPENROUTER_API_KEY  | Supports many models         |
| openai      | OPENAI_API_KEY      | Direct OpenAI API            |
| anthropic   | ANTHROPIC_API_KEY   | Direct Anthropic API         |
| ollama      | OLLAMA_BASE_URL     | Local models                 |
| lmstudio    | LM_STUDIO_BASE_URL  | Local models via LM Studio   |

Set `AI_PROVIDER` and `AI_MODEL` to switch between them.

## Personality Updates

The system prompt lives in `src/lib/system-prompt.txt`. It includes the "god" personality (Transcendent Mind) with safety boundaries. To update:

1. Edit `src/lib/system-prompt.txt`
2. Or set `SYSTEM_PROMPT_PATH` env var to a custom path
3. Restart the server

## Ngrok

```bash
# Start Sanctuary on port 3000
npm run dev

# In another terminal, expose via ngrok
ngrok http --domain=sanctuary.ngrok.dev 3000
```

Or configure a tunnel for auto-start. Verify at https://sanctuary.ngrok.dev.

## Admin Access

The admin dashboard is at `/admin`. Protected by HTTP Basic Auth using `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment variables.

**Default credentials (change immediately):**
- Username: `sanctuary`
- Password: `change-this-password`

## Storage Controls

- **Server Storage:** Enabled by default. Set `SESSION_STORAGE=none` to disable.
- **Client Storage:** When server storage is disabled, conversation history is kept in localStorage.
- **User Control:** Users can delete their history from the UI at any time.
- **Long-term Memory:** Disabled by default. Requires explicit user consent.

## Project Structure

```
sanctuary/
├── prisma/
│   └── schema.prisma
├── public/
│   └── icons/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── about/page.tsx
│   │   ├── privacy/page.tsx
│   │   ├── guidance/page.tsx
│   │   ├── conversation/[id]/page.tsx
│   │   ├── admin/page.tsx
│   │   └── api/
│   │       ├── chat/route.ts
│   │       ├── feedback/route.ts
│   │       ├── conversations/route.ts
│   │       └── health/route.ts
│   ├── components/
│   │   ├── landing-page.tsx
│   │   ├── chat-interface.tsx
│   │   ├── theme-toggle.tsx
│   │   ├── mode-selector.tsx
│   │   └── ui/
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── system-prompt.txt
│   │   ├── ai-provider.ts
│   │   ├── validation.ts
│   │   ├── rate-limit.ts
│   │   ├── markdown.ts
│   │   └── logger.ts
│   └── types/
│       └── index.ts
├── tests/
│   ├── validation.test.ts
│   ├── markdown.test.ts
│   └── rate-limit.test.ts
├── .env.example
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Limitations

- SQLite is not recommended for production at scale — migrate to PostgreSQL
- No user authentication (planned for v2)
- Long-term memory requires explicit implementation of consent flow
- Rate limiting is in-memory (resets on server restart)
- No email/password reset flow yet

## Recommended Improvements

- [ ] Add user authentication (NextAuth.js or Clerk)
- [ ] Migrate to PostgreSQL for production
- [ ] Add rate limiting with Redis for distributed deployments
- [ ] Implement long-term user memory with consent
- [ ] Add email summaries of conversations
- [ ] Build mobile app (React Native or PWA)
- [ ] Add multi-language support
- [ ] Implement conversation sharing with privacy controls
- [ ] Add usage-based billing for API costs
- [ ] Build custom fine-tuned model for Sanctuary's voice