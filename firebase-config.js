import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Ta configuration Firebase extraite de tes fichiers
const firebaseConfig = {
  apiKey: "AIzaSyD3cL4MokpURYKydVTugXArXC3-krQCAIc",
  authDomain: "floy-2a96d.firebaseapp.com",
  projectId: "floy-2a96d", // Tout en minuscules !
  storageBucket: "floy-2a96d.firebasestorage.app",
  messagingSenderId: "360277317372",
  appId: "1:360277317372:web:1b068a460ecc343022a979",
  measurementId: "G-QV8DVCRY1Q"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Export de la base de données pour l'utiliser ailleurs
export const db = getFirestore(app);
// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"; // 🔥 OBLIGATOIRE

const firebaseConfig = {
    // COPIE TES INFOS FIREBASE ICI
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // 🔥 Exporte la base de données
