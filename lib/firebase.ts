// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCTChUvbB8Ft8kk9o_GFLe3k6u_AQ9Lelo",
  authDomain: "alcazo.firebaseapp.com",
  projectId: "alcazo",
  storageBucket: "alcazo.firebasestorage.app",
  messagingSenderId: "301583788062",
  appId: "1:301583788062:web:5f3759d94b76198a4ae60f"
};

// Initialize Firebase (check if already initialized)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Authentication and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);