/**
 * Firebase Emulator Test Suite for Firestore Security Rules
 *
 * Rules:
 * - Default: deny all
 * - All reads: require role='admin'
 * - All writes: require role='admin' AND size < 50
 * - Audit: append-only (no updates, no deletes)
 * - Version/Meta: transaction-locked
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import { setLogLevel } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  // Silence noisy firestore logs during tests
  setLogLevel('error');

  const rules = readFileSync(resolve(__dirname, '../firestore.rules'), 'utf8');

  testEnv = await initializeTestEnvironment({
    projectId: 'omkara-test-rules',
    firestore: { rules },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getAdminDb() {
  return testEnv.authenticatedContext('admin_user', { role: 'admin' }).firestore();
}

function getMaliciousClientDb() {
  // Signed in, but no admin role
  return testEnv.authenticatedContext('hacker_user', {}).firestore();
}

function getUnauthDb() {
  return testEnv.unauthenticatedContext().firestore();
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Firestore Security Rules: Default Deny', () => {
  it('denies unauthenticated read to random collection', async () => {
    const db = getUnauthDb();
    await assertFails(db.collection('secrets').doc('key').get());
  });

  it('denies authenticated (non-admin) read to random collection', async () => {
    const db = getMaliciousClientDb();
    await assertFails(db.collection('secrets').doc('key').get());
  });
});

describe('Firestore Security Rules: Products Collection', () => {
  const validProduct = { name: 'Test Product' }; // small enough payload

  it('allows admin to read products', async () => {
    const db = getAdminDb();
    await assertSucceeds(db.collection('products').doc('p1').get());
  });

  it('allows admin to create product', async () => {
    const db = getAdminDb();
    await assertSucceeds(db.collection('products').doc('p1').set(validProduct));
  });

  it('allows admin to update product', async () => {
    const db = getAdminDb();
    await db.collection('products').doc('p1').set(validProduct);
    await assertSucceeds(db.collection('products').doc('p1').update({ name: 'Updated' }));
  });

  it('allows admin to delete product', async () => {
    const db = getAdminDb();
    await db.collection('products').doc('p1').set(validProduct);
    await assertSucceeds(db.collection('products').doc('p1').delete());
  });

  it('denies non-admin from reading products', async () => {
    const db = getMaliciousClientDb();
    await assertFails(db.collection('products').doc('p1').get());
  });

  it('denies non-admin from creating products', async () => {
    const db = getMaliciousClientDb();
    await assertFails(db.collection('products').doc('p1').set(validProduct));
  });

  // Size limit test
  it('denies admin from writing massive payload (defense in depth)', async () => {
    const db = getAdminDb();
    const massivePayload: Record<string, string> = {};
    for (let i = 0; i < 51; i++) {
      massivePayload[`field_${i}`] = 'data';
    }

    // Fails because keys().size() >= 50
    await assertFails(db.collection('products').doc('p2').set(massivePayload));
  });
});

describe('Firestore Security Rules: Audit Log (Append Only)', () => {
  it('allows admin to write an audit entry', async () => {
    const db = getAdminDb();
    await assertSucceeds(db.collection('audit').doc('log1').set({ action: 'PUBLISH' }));
  });

  it('DENIES admin from updating an audit entry', async () => {
    const db = getAdminDb();
    await db.collection('audit').doc('log1').set({ action: 'PUBLISH' });

    // Audit logs are immutable — even for admins
    await assertFails(db.collection('audit').doc('log1').update({ action: 'DELETED' }));
  });

  it('DENIES admin from deleting an audit entry', async () => {
    const db = getAdminDb();
    await db.collection('audit').doc('log1').set({ action: 'PUBLISH' });

    // Audit logs are immutable — even for admins
    await assertFails(db.collection('audit').doc('log1').delete());
  });
});
