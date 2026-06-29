// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getAuth
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCpD2Nzf_PCxqM3TvW0LZA_imEFDvAG5V8",
  authDomain: "sprintboard-c5da8.firebaseapp.com",
  projectId: "sprintboard-c5da8",
  storageBucket: "sprintboard-c5da8.firebasestorage.app",
  messagingSenderId: "510885740359",
  appId: "1:510885740359:web:489870540544d0a855d662"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Services
export const auth = getAuth(app);
export const db = getFirestore(app);