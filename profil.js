import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // profileId est soit celui dans l'URL, soit l'utilisateur connecté
        const params = new URLSearchParams(window.location.search);
        const profileId = params.get('id') || user.uid;

        try {
            // Récupération des données dans la collection "users"
            const userDoc = await getDoc(doc(db, "users", profileId));
            
            if (userDoc.exists()) {
                const data = userDoc.data();
                
                // Injection dynamique du NOM et de l'EMAIL
                document.getElementById('p-username').innerText = data.username || "Utilisateur Floy";
                document.getElementById('p-email').innerText = data.email || user.email;
                document.getElementById('p-bio').innerText = data.bio || "Pas encore de bio.";
                
                if (data.avatarUrl) {
                    document.getElementById('p-img').src = data.avatarUrl;
                }
            }
        } catch (error) {
            console.error("Erreur Firestore :", error);
        }
        
        // On cache le loader une fois les données prêtes
        const loader = document.getElementById('main-loader');
        if(loader) loader.style.display = 'none';
    } else {
        // Redirection si non connecté
        window.location.href = 'connexion.html';
    }
});
