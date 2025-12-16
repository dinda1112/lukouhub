/* ============================================
   FIREBASE CONFIGURATION
   ============================================ */

// Import Firebase modules (using Firebase SDK v12.6.0)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8rf38Wl7K2z84hpuzeBY9FmKtDn_ZdOc",
  authDomain: "lukouhub-86146.firebaseapp.com",
  projectId: "lukouhub-86146",
  storageBucket: "lukouhub-86146.firebasestorage.app",
  messagingSenderId: "26581551030",
  appId: "1:26581551030:web:cbc76fe604fd518d30a317",
  measurementId: "G-W96NV0K74J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('Firebase initialized successfully!');

// Export database instance and Firestore functions
export { db, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot };
