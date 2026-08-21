# RECOVA — Vercel deployment

RECOVA is a full-stack TanStack Start app (SSR + server functions), **not** a static Vite site.
The build uses Nitro's `vercel` preset, which emits the Build Output API bundle in
`.vercel/output` — server functions and every `/api/*` route run as Vercel functions.

## Project settings

| Setting          | Value             |
| ---------------- | ----------------- |
| Framework preset | Other             |
| Install command  | `bun install`     |
| Build command    | `bun run build`   |
| Output directory | `.vercel/output`  |

`vercel.json` in the repo already sets these plus `NITRO_PRESET=vercel`.

## Required Production environment variables

Server-only (never prefixed with `VITE_`, never referenced from client code):

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_PUBLISHABLE_KEY`
- `CONFIG_ENCRYPTION_KEY`
- `OPENROUTER_API_KEY` — the only reasoning provider for RECOVA AI
- `OPENROUTER_MODEL` (optional, defaults to `openai/gpt-4o-mini`)
- `COASTY_API_KEY`
- `FIRECRAWL_API_KEY`
- `POLLINATION_API_KEY`
- `GROQ_API_KEY` — media/image fallback only, never reasoning
- `OKX_API_KEY`, `OKX_SECRET_KEY`, `OKX_PASSPHRASE`, `OKX_PROJECT_ID`

Client-visible (safe, publishable):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SITE_URL` — your production origin, e.g. `https://recova.vercel.app`
  (used for absolute `og:image` / `twitter:image` link previews)

## Market data

Token price/volume comes from the OKX Onchain DEX API when all four OKX
credentials (including `OKX_PROJECT_ID`) are present, and automatically falls
back to the public Dexscreener API otherwise.
