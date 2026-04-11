import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// TODO: Replace with your actual Firebase Project Configuration
const firebaseConfig = {
    apiKey: "AIzaSyA5GW3ny4Du1fLjWPDRaOfWjwpVXTRiHqg",
    authDomain: "edumood-app.firebaseapp.com",
    projectId: "edumood-app",
    storageBucket: "edumood-app.firebasestorage.app",
    messagingSenderId: "778419026725",
    appId: "1:778419026725:web:c483d7e5775b95df8938cc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
