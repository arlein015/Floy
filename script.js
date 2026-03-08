// Attendre que la page soit chargée
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Empêche le rechargement de la page
            
            // Simulation de connexion
            console.log("Connexion en cours vers Threndly...");
            
            // Redirection vers la page de chat
            window.location.href = 'chat.html';
        });
    }
});

// Fonction pour générer un code à 6 chiffres
function generateCode() {
    return Math.floor(100000 + Math.random() * 900000);
}

// Quand l'utilisateur s'inscrit
document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // On enregistre les infos et on simule l'envoi du mail
    const userEmail = document.getElementById('reg_email').value;
    const verificationCode = generateCode();
    
    localStorage.setItem('temp_email', userEmail);
    localStorage.setItem('sent_code', verificationCode);
    
    alert("Un code a été envoyé à : " + userEmail + " (Code test : " + verificationCode + ")");
    
    // Direction la page de vérification
    window.location.href = 'verify.html';
});

// Pour rester connecté
function checkLogin() {
    if (localStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = 'chat.html';
    }
}
document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');

    if (signupForm) {
        signupForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Empêche le rechargement

            // On récupère les données
            const email = document.querySelector('input[placeholder="E-mail ou numéro"]').value;
            
            // Génération d'un code fictif pour le test
            const codeTest = Math.floor(100000 + Math.random() * 900000);
            
            // On sauvegarde l'état pour que l'utilisateur reste connecté plus tard
            localStorage.setItem('userEmail', email);
            
            // Alerte pour simuler l'envoi (en attendant un service de mail réel)
            alert("Un code de vérification a été envoyé à " + email + "\nVotre code de test est : " + codeTest);

            // Redirection vers la page de vérification
            window.location.href = 'verify.html';
        });
    }
});
