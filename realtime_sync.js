// Configuration du rafraîchissement (en millisecondes)
const REFRESH_INTERVAL = 10000; // 10 secondes

/**
 * Fonction pour mettre à jour les statistiques du profil en direct
 * (Abonnés, Abonnements, etc.)
 */
async function updateProfileStats(username) {
    try {
        const response = await fetch(`/api/profile/${username}/stats`);
        if (response.ok) {
            const data = await response.json();
            
            // Mise à jour des éléments HTML si les données ont changé
            document.getElementById('follower-count').innerText = data.followers_count;
            document.getElementById('following-count').innerText = data.following_count;
            document.getElementById('post-count').innerText = data.posts_count;
            
            console.log("Stats synchronisées en temps réel.");
        }
    } catch (error) {
        console.error("Erreur de synchronisation :", error);
    }
}

/**
 * Vérifie les nouvelles notifications ou messages
 */
async function checkNotifications() {
    try {
        const response = await fetch('/api/notifications/unread-count');
        const data = await response.json();
        
        const badge = document.getElementById('nav-notification-badge');
        if (data.count > 0) {
            badge.innerText = data.count;
            badge.classList.remove('hidden');
            // Petite animation pour attirer l'œil
            badge.classList.add('animate-bounce');
        } else {
            badge.classList.add('hidden');
        }
    } catch (error) {
        // On échoue silencieusement pour ne pas perturber l'utilisateur
    }
}

// Lancement automatique au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    // Récupérer le nom d'utilisateur depuis l'URL ou un attribut data
    const currentProfile = window.location.pathname.split('/').pop();

    if (currentProfile) {
        // 1. Première mise à jour immédiate
        updateProfileStats(currentProfile);
        checkNotifications();

        // 2. Mise en place de la boucle de synchronisation (Polling)
        setInterval(() => {
            updateProfileStats(currentProfile);
            checkNotifications();
        }, REFRESH_INTERVAL);
    }
});
