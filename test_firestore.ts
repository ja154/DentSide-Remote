import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCJAfiYU2GxTpXFocacCwvnnnY0wAFEZe8",
  authDomain: "kazira-io.firebaseapp.com",
  projectId: "kazira-io",
  storageBucket: "kazira-io.firebasestorage.app",
  messagingSenderId: "669567718651",
  appId: "1:669567718651:web:841eeca79909c45e5ecc5e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  try {
    console.log("Fetching docs...");
    const snapshot = await getDocs(collection(db, "users"));
    console.log("Success! size:", snapshot.size);
  } catch (err: any) {
    console.error("Firestore Error:", err.message, err.code);
  }
}

run();
