# HARVEST_LOG.md — Template Harvesting Record

Every external component or pattern borrowed from an open-source template is recorded here
for **license compliance** and **future update tracking**.

## Protocol

1. Clone template to a temp directory (never directly into the repo)
2. Copy ONLY the listed components/patterns
3. After each copy: verify build and bundle size (single component < 8KB gzipped)
4. Record source here with commit hash

---

## Harvested Components

### Admin Dashboard Shell

| Property                | Value                                                                            |
| ----------------------- | -------------------------------------------------------------------------------- |
| **Source**              | `Kiranism/next-shadcn-dashboard-starter`                                         |
| **License**             | MIT                                                                              |
| **Commit**              | _(to be filled during Phase 0.3)_                                                |
| **Components Taken**    | Sidebar layout, header, data-table primitives, form patterns, dark/light theme   |
| **Components Stripped** | Clerk auth (replaced with Firebase), Kanban board, Chat, AI-chat, Billing module |
| **Notes**               | Clerk completely removed; Firebase Auth guard wired in its place                 |

### Storefront UI Blocks

| Property                | Value                                                                                   |
| ----------------------- | --------------------------------------------------------------------------------------- |
| **Source**              | `shadcnspace/ecommerce-shadcn-nextjs-template`                                          |
| **License**             | MIT                                                                                     |
| **Commit**              | _(to be filled during Phase 0.3)_                                                       |
| **Components Taken**    | ProductCard layout, Hero section, Category section, shop grid structure                 |
| **Components Stripped** | Framer Motion (all imports), Wishlist, Payment/checkout backend, Pages Router structure |
| **Notes**               | Ported to App Router; all Framer Motion replaced with CSS transitions                   |

### Cart → WhatsApp Pattern (Reference Only)

| Property                | Value                                                                     |
| ----------------------- | ------------------------------------------------------------------------- |
| **Source**              | `LucasAlvaresA/shadcn-ui-store`                                           |
| **License**             | MIT                                                                       |
| **Commit**              | _(to be filled during Phase 0.3)_                                         |
| **Components Taken**    | Pattern reference only (message construction, cart-drawer pattern)        |
| **Components Stripped** | N/A (studied, not forked)                                                 |
| **Notes**               | Reimplemented from scratch against our own schema and WhatsApp serializer |

### Video Facade

| Property    | Value                                      |
| ----------- | ------------------------------------------ |
| **Source**  | `lite-youtube-embed` (npm)                 |
| **License** | Apache-2.0                                 |
| **Version** | _(to be filled)_                           |
| **Notes**   | ~2KB; zero YouTube JS until user taps play |
