# OMKARA — Task Tracker

## Phase 0 — Foundation & Template Harvest (Days 1–3)

### 0.1 Account & Secrets Provisioning
- [x] 0.1.1 — Document account setup requirements in README
- [x] 0.1.2 — Create `.env.example` files for admin and storefront

### 0.2 Monorepo Scaffold
- [x] 0.2.1 — Init Turborepo + npm workspaces + TypeScript strict
- [ ] 0.2.2 — ESLint config (import restrictions, framer-motion ban, dangerouslySetInnerHTML ban)
- [x] 0.2.3 — Prettier + shared configs
- [x] 0.2.4 — Create `apps/storefront` (placeholder)
- [x] 0.2.5 — Create `apps/admin` (placeholder)
- [x] 0.2.6 — Create `packages/core-schemas` (full Zod schemas + tests)
- [x] 0.2.7 — Create `packages/ui-tokens` (design tokens)
- [x] 0.2.8 — Create `packages/test-utils` (fixtures + builders)
- [x] 0.2.9 — Verify `turbo build` runs from clean state
- [x] 0.2.10 — Create CI skeleton (GitHub Actions: ci.yml, rules.yml)

### 0.3 Template Harvest
- [x] 0.3.1 — Create `HARVEST_LOG.md`
- [ ] 0.3.2 — Plan harvesting approach (documented, not yet cloned)

**Gate 0:** `npm run build` succeeds from clean clone

---

## Phase 1 — Core Schemas & Contracts (Days 4–6)

### 1.1 Schema Package
- [x] 1.1.1 — Primitives (MoneyPaise, Slug, HexColor, FocalPoint, CloudinaryId, YouTubeId, TokenizedString)
- [x] 1.1.2 — Utility functions (formatPaise, parsePaise, hashLine)
- [x] 1.1.3 — Entity schemas (Variant, Addon, Tag, Category, Product)
- [x] 1.1.4 — Settings schemas (StoreSettings, NavigationItem, Hero, WhatsAppTemplates, UIConfig)
- [x] 1.1.5 — Manifest schema (strict + passthrough variants)
- [x] 1.1.6 — Cart schemas (CartLine, CartState, cartVersion migration, hashLine)
- [x] 1.1.7 — Test fixtures & builders (mockManifest, mockCart, mockProduct, dummy-brand)
- [x] 1.1.8 — WhatsApp serializer (serializeWhatsAppMessage, buildWhatsAppUrl)
- [x] 1.1.9 — Unit tests (67 cases passing)

**Gate 1:** Contract-break test proves schemas bind across packages

---

## Phase 2 — Firebase Layer (Days 7–9)
- [ ] 2.1 — Firestore data model definition
- [x] 2.2 — Security rules (`firebase/firestore.rules`)
- [x] 2.3 — `scripts/make-admin.mjs`
- [ ] 2.4 — Firebase Emulator test suite (25 tests)
- [ ] 2.5 — TanStack Query Firestore hooks
- [ ] 2.6 — Offline resilience

**Gate 2:** Emulator tests green + malicious-client test denied

---

## Phase 3 — Publishing Engine (Days 10–13)
- [ ] 3.1 — Draft assembler
- [ ] 3.2 — Validation wall (ManifestSchema.strict + error drawer)
- [ ] 3.3 — Size budget enforcer (≤300KB)
- [ ] 3.4 — Hash & upload to R2 via Pages Function
- [ ] 3.5 — LATEST pointer management
- [ ] 3.6 — Draft preview (`?manifest=draft`)
- [ ] 3.7 — Rollback (pointer flip)
- [ ] 3.8 — Audit trail

**Gate 3:** Mid-publish kill test — live site never in half-published state

---

## Phase 4 — Admin Panel Features (Days 14–28)
- [ ] 4.1 — Auth gate (route guard, idle timeout)
- [ ] 4.2 — Dashboard home (widgets, usage gauges)
- [ ] 4.3 — Store settings editor
- [ ] 4.4 — Navigation editor (dnd sort)
- [ ] 4.5 — Hero editor + focal crosshair
- [ ] 4.6 — Magic Drop Zone (media pipeline)
- [ ] 4.7 — Category manager
- [ ] 4.8 — Product manager
- [ ] 4.9 — Tag manager
- [ ] 4.10 — WhatsApp template editor
- [ ] 4.11 — Publish & version center
- [ ] 4.12 — UI theme editor

**Gate 4:** All editability round-trips green + chaos roleplay test

---

## Phase 5 — Storefront (Days 29–41)
- [ ] 5.1 — Boot + manifest loader
- [ ] 5.2 — Shell: TopBar + Hero + BottomNav
- [ ] 5.3 — Category rail + Product rails/grid
- [ ] 5.4 — ProductCard + 6 status treatments
- [ ] 5.5 — ProductSheet (dual renderer)
- [ ] 5.6 — Cart engine (Zustand)
- [ ] 5.7 — WhatsApp checkout + fallback
- [ ] 5.8 — PWA / Offline
- [ ] 5.9 — SEO / Social

**Gate 5:** Slow-4G order flow, offline flow, viewport matrix, axe clean

---

## Phase 6 — Cross-Cutting Hardening (Days 42–46)
- [ ] 6.1 — Security pass (CSP, headers, secret scan)
- [ ] 6.2 — Performance pass (bundle audit, font, code splitting)
- [ ] 6.3 — Free-tier guardrails (admin dashboard gauges)
- [ ] 6.4 — Template universality proof (dummy-brand fixture)

**Gate 6:** Full CI suite + security checklist + universality proof

---

## Phase 7 — Launch & Operations (Days 47–50)
- [ ] 7.1 — Content load (real products via admin)
- [ ] 7.2 — UAT script (30-step)
- [ ] 7.3 — QR run (5 devices)
- [ ] 7.4 — DNS + go-live
- [ ] 7.5 — Runbook handover
- [ ] 7.6 — Post-launch watch (day-1, day-7)

**Gate 7:** Business runs 7 days with zero code touches
