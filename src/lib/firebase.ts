
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "tradevision-journal-d4jwz",
  appId: "1:566095285056:web:adf1dbb0da03bd6b80c8a5",
  storageBucket: "tradevision-journal-d4jwz.firebasestorage.app",
  apiKey: "AIzaSyCl__4klPNRhQBhJYx2eq06uih39NL9KL4",
  authDomain: "tradevision-journal-d4jwz.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "566095285056"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
