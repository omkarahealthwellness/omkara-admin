#!/usr/bin/env node

/**
 * make-admin.mjs — One-time script to set the 'role: admin' custom claim.
 *
 * SECURITY:
 * - Run locally ONLY, never in CI or deployed code
 * - Requires a service-account JSON that is .gitignored and never committed
 * - The service account JSON should NEVER enter the repo or CI artifacts
 *
 * Usage:
 *   node scripts/make-admin.mjs <email>
 *
 * Prerequisites:
 *   1. Download service-account JSON from Firebase Console → Project Settings → Service Accounts
 *   2. Save it to firebase/service-account.json (already in .gitignore)
 *   3. Set GOOGLE_APPLICATION_CREDENTIALS env var or pass path as second argument
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const email = process.argv[2];
const serviceAccountPath = process.argv[3] || resolve(__dirname, '../firebase/service-account.json');

if (!email) {
  console.error('Usage: node scripts/make-admin.mjs <email> [path-to-service-account.json]');
  console.error('');
  console.error('This sets the { role: "admin" } custom claim on the specified Firebase Auth user.');
  console.error('The service account JSON is required and must never be committed to git.');
  process.exit(1);
}

try {
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));

  initializeApp({
    credential: cert(serviceAccount),
  });

  const auth = getAuth();
  const user = await auth.getUserByEmail(email);

  await auth.setCustomUserClaims(user.uid, { role: 'admin' });

  console.log(`✅ Custom claim { role: "admin" } set for user: ${email} (UID: ${user.uid})`);
  console.log('');
  console.log('The user must sign out and sign back in for the new claim to take effect.');
  console.log('');
  console.log('To verify, decode their next ID token and check for:');
  console.log('  token.role === "admin"');
  console.log('');
  console.log('To REVOKE admin access later:');
  console.log(`  node scripts/make-admin.mjs --revoke ${email}`);

  // Handle --revoke flag
  if (process.argv[2] === '--revoke' && process.argv[3]) {
    const revokeEmail = process.argv[3];
    const revokeUser = await auth.getUserByEmail(revokeEmail);
    await auth.setCustomUserClaims(revokeUser.uid, {});
    console.log(`❌ Admin claim REVOKED for user: ${revokeEmail}`);
  }
} catch (error) {
  console.error('❌ Failed to set admin claim:');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
