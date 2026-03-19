import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Fonction d'injection des modules HTML
async function injectModule(id, file) {
    try {
        const response = await fetch(file);
        if (!response.ok) return;
        const html = await response.text();
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = html;
            // Relancer les scripts internes au module
            element.querySelectorAll("script").forEach(s => {
                const newS = document.createElement("script");
                newS.type = s.type || "text/javascript";
                newS.textContent = s.textContent;
                document.body.appendChild(newS);
            });
        }
    } catch (e) { console.error("Erreur module:", file); }
}

onAuthStateChanged(auth, async (user) => {
    if (!user) { window.location.href = 'connexion.html'; return; }

    const params = new URLSearchParams(window.location.search);
    const profileId = params.get('id') || user.uid;

    // Chargement de la structure
    await Promise.all([
        injectModule('header-module', 'profile_header.html'),
        injectModule('stats-module', 'profile_stats.html'),
        injectModule('tabs-module', 'profile_tabs.html'),
        injectModule('grid-module', 'profile_grid.html'),
        injectModule('modal-module', 'profile_edit_modal.html')
    ]);

    // Initialisation des données (avec petit délai pour être sûr que le HTML est là)
    setTimeout(() => {
        if(window.loadHeader) window.loadHeader(profileId, user.uid);
        if(window.loadStats) window.loadStats(profileId);
        if(window.loadGrid) window.loadGrid('posts', profileId);
        if(window.loadBadge) window.loadBadge(profileId);
        
        // Cacher le loader
        document.getElementById('main-loader').style.display = 'none';
    }, 200);
});
