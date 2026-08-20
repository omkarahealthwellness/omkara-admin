import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
  initializeFirestore,
} from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyC6bJcmRIgqxhXkXgabGwMyEzuoBV8isKs',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'omkara-health-wellness.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'omkara-health-wellness',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'omkara-health-wellness.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '294856087911',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:294856087911:web:8ef1bbf1685f63765e77c2',
};

// Initialize Firebase
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
const auth = getAuth(app);

// Initialize Firestore with Offline Resilience (Phase 2.6)
// This is critical: It enables the app to queue writes when offline and resolve them later.
// Use default memory cache to prevent IndexedDB deadlocks that cause hanging writes
const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true,
});

// Connect to emulators in development mode if explicitly enabled
if (
  process.env.NODE_ENV === 'development' &&
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'
) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  console.log('🔥 Connected to Firebase Emulators');
}

export { app, auth, db };
