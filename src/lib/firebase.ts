import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Note on Firebase Security:
// Firebase configuration keys (apiKey, projectId, etc.) are public by design
// and safe to include in client-side code. The actual security of the database
// is enforced by Firestore Security Rules (firestore.rules), which we have
// configured to strictly validate user roles, ownership, and data schemas.
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();
