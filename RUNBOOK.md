# Omkara E-Commerce Architecture - Runbook

## Overview

Omkara is a 100% free, zero-maintenance, serverless architecture running entirely on Cloudflare's edge.

### The Stack

- **Admin App:** Next.js deployed on Cloudflare Pages.
- **Database:** Firebase Auth + Firestore (NoSQL Document Store).
- **Storefront App:** Next.js deployed on Cloudflare Pages.
- **Cache / API Delivery:** Cloudflare Workers KV.

---

## 1. Local Development

Because of OpenSSL legacy constraints in Cloudflare `wrangler`, always use `$env:NODE_OPTIONS='--openssl-legacy-provider'` in Windows before running scripts.

```bash
# Start Admin CMS (localhost:3000)
$env:NODE_OPTIONS='--openssl-legacy-provider'; npm run dev -w @omkara/admin

# Start Storefront (localhost:3001)
$env:NODE_OPTIONS='--openssl-legacy-provider'; npm run dev -w @omkara/storefront
```

---

## 2. Deployment Instructions

### Prerequisites

1. Create a free Cloudflare account.
2. Create a Firebase project (Blaze plan required only if using Cloud Functions, but we only use Firestore, so Spark free tier is fine).
3. Connect your GitHub repository to Cloudflare Pages.

### Step 1: Deploy Admin Panel

- **Framework Preset:** Next.js
- **Build command:** `npx @cloudflare/next-on-pages` (or let Cloudflare auto-detect)
- **Environment Variables:**
  - Add your `NEXT_PUBLIC_FIREBASE_*` keys to Cloudflare Pages Settings.
- **KV Binding:**
  - Create a KV Namespace in Cloudflare Dashboard called `OMKARA_MANIFESTS`.
  - In the Pages Settings -> Functions -> KV namespace bindings: bind `MANIFEST_KV` to the `OMKARA_MANIFESTS` namespace.

### Step 2: Deploy Storefront

- **Framework Preset:** Next.js
- **Build command:** `npx @cloudflare/next-on-pages`
- **KV Binding:**
  - In the Pages Settings -> Functions -> KV namespace bindings: bind `MANIFEST_KV` to the exact same `OMKARA_MANIFESTS` namespace.

### Step 3: GitHub Asset CDN Setup (10/10 Architecture)

1. Create a public GitHub repository (e.g., `omkara-assets`).
2. Generate a Fine-grained Personal Access Token (PAT) with **Contents: Read & Write** permissions for this specific repository.
3. Add the PAT to the Admin Panel's environment variables as `NEXT_PUBLIC_GITHUB_PAT`.
4. Assets uploaded via the Admin Panel will be pushed to GitHub and served globally via jsDelivr (`https://cdn.jsdelivr.net/gh/owner/repo@version/path`).

---

## 3. Operations & Publishing Flow

1. **Content Editing:** Log into the Admin Panel using a Firebase-authorized email.
2. **Drafting:** Make changes to Products, Categories, Theme, or Hero.
3. **Publishing:** Click the "Publish" button in the Topbar. This will:
   - Assemble all Firestore data into a single JSON object.
   - Hash the object.
   - Write the JSON to the Cloudflare `MANIFEST_KV` namespace under the key `manifest_LATEST.json`.
4. **Instant Global Update:** The Storefront reads directly from `MANIFEST_KV` on every request. Thanks to Cloudflare's edge network, the updated manifest is globally available in milliseconds.

---

## 4. Disaster Recovery

If you ever need to rollback the storefront to a previous state:

1. Every publish creates a history log in Firestore (`manifest_log` collection).
2. Use the `api/rollback` endpoint (or build a visual UI for it) to flip the `manifest_LATEST.json` pointer in KV back to an older version.
