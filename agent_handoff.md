# Omkara Architecture Handoff & Context

This document contains the complete context, current state, and next steps for the Omkara Template setup. Provide this document to the agent in your next session to immediately pick up exactly where we left off.

## 🏗️ System Architecture

The ecosystem consists of three main pillars, all successfully deployed on Cloudflare Pages:

1. **Storefront** (`omkara-store.pages.dev`)
   - **Framework:** Next.js (App Router)
   - **Data Source:** Reads statically from Cloudflare KV (`OMKARA_MANIFESTS`). Does NOT talk to Firebase.
   - **Status:** Live. Content Security Policy (CSP) updated to allow images from `omkara-cdn.pages.dev`.

2. **Admin Panel** (`omkara-admin.pages.dev`)
   - **Framework:** Next.js (Client-side SPA)
   - **Data Source:** Reads/Writes to Firebase Firestore. Publishes to Cloudflare KV.
   - **Status:** Live. UI has been polished (Slugs hidden, INR pricing logic, Category Dropdowns, Emoji Tag Icons).
   - **Bundle Size Issue:** Resolved by removing `runtime: 'edge'` from the layout, dropping size from 26MB to 1.18MB.

3. **Image CDN** (`omkara-cdn.pages.dev`)
   - **Framework:** None (Raw static file server)
   - **Data Source:** The `omkara-assets-products` GitHub repository.
   - **Status:** Live. Properly configured as a pure file server with no build step.

## 🔐 Credentials & Environment

- **GitHub Repository Owner:** `omkarahealthwellness`
- **GitHub PAT:** `[REDACTED_BY_GITHUB_PUSH_PROTECTION]`
  - _Context:_ This Fine-Grained PAT has `Contents: Read and write` access to `omkara-assets-products` to allow image uploads from the Admin panel.
- **Firebase Project:** `omkara-bkn`
- **Cloudflare KV:** `OMKARA_MANIFESTS` is bound to both the Admin and Storefront projects.

## 🚧 Current State & Known Blockers

Everything is fully deployed and communicating correctly, EXCEPT for one strict security feature that is currently blocking the Admin Panel:

**The Firestore Permissions Blocker**
By default, the `firestore.rules` lock down the entire database. To unlock it, the logged-in user must be recognized as an Admin. Because this isn't set up yet, the Admin Panel shows infinite loading spinners on singletons (Settings, Theme) and fails to save Categories/Products.

**The Fix (To be completed by user):**

1. Go to Firebase Console -> Authentication -> Copy the **User UID**.
2. Go to Firestore Database.
3. Create a collection named exactly `admin_users`.
4. Create a document where the **Document ID is the User UID**.
5. Log out and log back into the Admin Panel.

## 📝 Next Steps for Future Session

When resuming work, the AI Agent should follow this checklist:

1. **Verify Database Access:** Confirm with the user that the `admin_users` Firestore document was created and that the Admin Panel can now successfully load the Theme/Settings pages.
2. **First Data Entry:** Guide the user to create 1 Category and 1 Product, utilizing the new Image Upload component.
3. **KV Publish Test:** Have the user click "Publish to KV" in the Admin Panel and verify that the Storefront (`omkara-store.pages.dev`) updates instantly.
4. **Theme Customization:** Help the user configure their brand colors in the UI Theme tab.
