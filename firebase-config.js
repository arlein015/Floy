import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD3cL4MokpURYKydVTugXArXC3-krQCAI",
  authDomain: "floy-2a96d.firebaseapp.com",
  projectId: "floy-2a96d",
  storageBucket: "floy-2a96dstorage.app",
  messagingSenderId: "360277317372",
  appId: "1:360277317372:web:1b068a460ecc343022a9",
  measurementId: "G-QV8DVCRY1Q"
};

// Initialisation
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
