import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD3cL4MokpURYKydVTugXArXC3-krQCAIc",
  authDomain: "floy-2a96d.firebaseapp.com",
  projectId: "Floy-2A96D",
  storageBucket: "floy-2a96d.firebasestorage.app",
  messagingSenderId: "360277317372",
  appId: "1:360277317372:web:1b068a460ecc343022a979",
  measurementId: "G-QV8DVCRY1Q"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
