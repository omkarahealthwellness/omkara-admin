# OMKARA Universal Template

A business-agnostic, free-tier, universal food/retail catalog template with:

- **Admin panel** — full CMS for products, categories, media, WhatsApp templates
- **Public storefront** — static, PWA-enabled, WhatsApp checkout
- **Publishing engine** — draft → validate → publish → rollback

## Architecture

```
apps/storefront  → Cloudflare Pages (static, zero secrets, PWA)
apps/admin       → Cloudflare Pages (Firebase Auth, Firestore drafts)
packages/core-schemas → Zod schemas (single source of truth)
packages/ui-tokens    → Design tokens (spacing, colors, radius)
packages/test-utils   → Fixtures & builders
```

## Tech Stack

| Layer      | Choice                                         |
| ---------- | ---------------------------------------------- |
| Framework  | Next.js (App Router)                           |
| UI         | shadcn/ui + Tailwind CSS                       |
| Validation | Zod (shared schemas)                           |
| Auth       | Firebase Auth (email/password + custom claims) |
| Database   | Firestore Spark (drafts only, admin-only)      |
| Images     | GitHub + jsDelivr (immutable, versioned CDN)   |
| Video      | YouTube (unlisted) + lite-youtube-embed        |
| Hosting    | Cloudflare Pages (free)                        |
| Manifest   | Cloudflare Workers KV (versioned JSON)         |

## Getting Started

```bash
npm install
npm run build     # build all packages & apps
npm run dev       # start dev servers
npm run test      # run all tests
npm run lint      # lint all packages
npm run typecheck # typecheck all packages
```

## Monorepo Structure

- `apps/storefront` — Public-facing menu/catalog (static export)
- `apps/admin` — Admin CMS (Firebase-authenticated)
- `packages/core-schemas` — Zod schemas shared by both apps
- `packages/ui-tokens` — Design tokens
- `packages/test-utils` — Test fixtures & builders
- `firebase/` — Firestore rules (CI-deployed only)
- `scripts/` — One-time admin setup scripts
- `e2e/` — Playwright E2E test suites

## Key Principles

1. **Storefront never touches a database** — reads one JSON manifest from R2
2. **All data validated by Zod** — same schema in admin, publish function, and storefront
3. **Three-tier editability** — Content (free edit), Config (bounded), System-Locked (code only)
4. **Zero cost** — runs entirely on free tiers ($0, no credit card)
5. **Business-agnostic** — no hardcoded brand strings; swap manifest = different business
