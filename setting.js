// Charger les préférences
function loadSettings() {
    const pushNotif = localStorage.getItem('push_notifications');
    const commentNotif = localStorage.getItem('comment_notifications');
    const likeNotif = localStorage.getItem('like_notifications');
    const privateAccount = localStorage.getItem('private_account');
    const hideActivity = localStorage.getItem('hide_activity');
    
    if (document.getElementById('pushNotifications')) {
        document.getElementById('pushNotifications').checked = pushNotif !== 'false';
        document.getElementById('commentNotifications').checked = commentNotif !== 'false';
        document.getElementById('likeNotifications').checked = likeNotif !== 'false';
        document.getElementById('privateAccount').checked = privateAccount === 'true';
        document.getElementById('hideActivity').checked = hideActivity === 'true';
    }
}

// Sauvegarder les préférences
function saveSetting(key, value) {
    localStorage.setItem(key, value);
}

// Event listeners
if (document.getElementById('pushNotifications')) {
    document.getElementById('pushNotifications').addEventListener('change', (e) => {
        saveSetting('push_notifications', e.target.checked);
    });
    
    document.getElementById('commentNotifications').addEventListener('change', (e) => {
        saveSetting('comment_notifications', e.target.checked);
    });
    
    document.getElementById('likeNotifications').addEventListener('change', (e) => {
        saveSetting('like_notifications', e.target.checked);
    });
    
    document.getElementById('privateAccount').addEventListener('change', (e) => {
        saveSetting('private_account', e.target.checked);
    });
    
    document.getElementById('hideActivity').addEventListener('change', (e) => {
        saveSetting('hide_activity', e.target.checked);
    });
}

// Navigation
function goBack() {
    window.location.href = 'profil.html';
}

function goToEditProfile() {
    window.location.href = 'edit-profil.html';
}

function changePassword() {
    alert('🔐 Changer le mot de passe - Bientôt disponible');
}

function showHelp() {
    alert('❓ Aide Floy - Bientôt disponible');
}

function reportProblem() {
    alert('📧 Signaler un problème - Bientôt disponible');
}

function showAbout() {
    alert('✨ Floy - Réseau social orange et noir\nVersion 1.0.0');
}

// Logout modal
function confirmLogout() {
    document.getElementById('logoutModal').classList.add('active');
}

function closeLogoutModal() {
    document.getElementById('logoutModal').classList.remove('active');
}

function logout() {
    localStorage.removeItem('floy_user');
    localStorage.removeItem('floy_user_posts');
    window.location.href = 'index.html';
}

// Fermer modal en cliquant dehors
document.getElementById('logoutModal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('logoutModal')) {
        closeLogoutModal();
    }
});

// Initialisation
loadSettings();
