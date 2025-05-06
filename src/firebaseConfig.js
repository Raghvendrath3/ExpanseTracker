import { getApps, initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  // Replace with your Firebase configuration
  apiKey: "AIzaSyAUk0i1vEjbipUerhkDsh6Kl9OOA2570xI",
  authDomain: "expense-tracker-4d25c.firebaseapp.com",
  projectId: "expense-tracker-4d25c",
  storageBucket: "expense-tracker-4d25c.firebasestorage.app",
  messagingSenderId: "43382443602",
  appId: "1:43382443602:web:cb55ea8a69fc8ab4ead98b",
  measurementId: "G-E12D7DE0Z1",
};

// Initialize Firebase only once
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, collection, getDocs, auth, firebaseConfig };
