import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

// Note on Firebase Security:
// Firebase configuration keys (apiKey, projectId, etc.) are public by design
// and safe to include in client-side code. The actual security of the database
// is enforced by Firestore Security Rules (firestore.rules), which we have
// configured to strictly validate user roles, ownership, and data schemas.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || '(default)'
};

// Initialize defensively to prevent critical failure if environment config is missing
const app = firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null as any;

// Use initializeFirestore with experimentalForceLongPolling to bypass strict proxy WebSocket blocks
export const db = app ? initializeFirestore(app, { 
  experimentalForceLongPolling: true 
}, firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)' ? firebaseConfig.firestoreDatabaseId : undefined) : null as any;

export const googleProvider = new GoogleAuthProvider();

// Force account selection to prevent silent hanging or delays when multiple accounts are present
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
