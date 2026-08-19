# Hardening & Type Safety Plan

This plan addresses the remaining TypeScript errors in the Admin app and institutes "Mossad-level" security practices across the architecture.

## Open Questions
- Do you want to implement Firebase App Check, or is strict rules + origin headers sufficient for this phase?

## Proposed Changes

### 1. Fix TypeScript Schema Discrepancies
The primary errors are caused by React Hook Form structures not aligning perfectly with the Zod schemas defined in `@omkara/core-schemas`.

#### [MODIFY] `apps/admin/src/app/(dashboard)/products/product-editor.tsx`
- Refactor the form to exactly match `ProductSchema`:
  - Replace `price`/`mrp` with the `variants` array (with one default variant).
  - Replace `description` with `shortDescription` and `longDescription`.
  - Replace `isActive` with `status` enum (`AVAILABLE`, `SOLD_OUT`, etc).
  - Replace `images` array with `primaryImage` (with `{ x: 50, y: 50 }` focal default) and `gallery`.
  - Replace `inventory` with the required `note` configuration object.

#### [MODIFY] `apps/admin/src/app/(dashboard)/settings/page.tsx`
- Ensure all required properties in `StoreSettingsSchema` are present in the form defaults (`phone`, `logoUrl`, `businessName`, etc).

#### [MODIFY] `apps/admin/src/app/(dashboard)/theme/page.tsx`
- Strictly cast `borderRadius` in defaults to satisfy the literal enum `BorderRadius` (`"none" | "sm" | "md" | "lg" | "full"`).

#### [MODIFY] `apps/storefront/src/app/api/publish/route.ts` & `rollback/route.ts`
- Fix missing Cloudflare bindings by defining:
  ```typescript
  export interface CloudflareEnv {
    MANIFEST_KV: KVNamespace;
  }
  ```

#### [MODIFY] `apps/admin/src/components/layout/publish-button.tsx`
- Type the `data` coming back from the JSON response as `{ message: string; version: string }`.

### 2. Mossad-Level Security Hardening
Beyond basic CSP, we will lock down the architecture to prevent common attack vectors (XSS, CSRF, NoSQL Injection, and unauthenticated writes).

#### [MODIFY] `firebase/firestore.rules`
- Tighten from `allow write: if request.auth != null;` to verifying the user exists in a specific `admin_users` collection, preventing ANY random Firebase user from mutating the database.
- Explicitly block any writes that attempt to modify `id` or `slug` fields after creation.

#### [MODIFY] `apps/storefront/next.config.ts`
- Upgrade CSP header to strict hash/nonce enforcement if possible, or at minimum, deny `unsafe-eval`.
- Add HSTS (`Strict-Transport-Security`).

#### [MODIFY] `apps/storefront/src/app/api/publish/route.ts`
- Implement an API Key check. The edge publishing route is currently unprotected. We will require an `x-api-key` header to trigger the compile phase.
- Sanitize output strings deeply during the JSON compilation phase.

## Verification Plan
### Automated Tests
- Run `$env:NODE_OPTIONS='--openssl-legacy-provider'; npx tsc --noEmit` on both apps to ensure zero TypeScript errors.
- Run `npx eslint` to ensure no linting warnings.

### Manual Verification
- Verify the publish button passes the new API key correctly.
- Ensure the Admin UI form components correctly bind to the updated structure.
