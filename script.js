// --- CONFIGURATION ---
// Remplace par tes vrais IDs EmailJS
const SERVICE_ID = "service_id"; 
const TEMPLATE_ID = "template_id"; 
const PUBLIC_KEY = "VOTRE_CLE_PUBLIQUE";

emailjs.init(PUBLIC_KEY);

// --- FONCTION : DÉCONNEXION ---
function logout() {
    localStorage.removeItem('threndly_id');
    window.location.href = "index.html";
}

// --- FONCTION : ENVOYER LE CODE (signup.html) ---
function envoyerCode() {
    const email = document.getElementById('reg-mail').value;
    const user = document.getElementById('reg-user').value || "Utilisateur";

    if(!email.includes('@')) return alert("Email invalide");

    // Génération du code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem('temp_code', code);

    // Envoi via EmailJS
    emailjs.send(SERVICE_ID, TEMPLATE_ID, {
        email: email, // Correspond à {{email}}
        user_name: user, // Correspond à {{user_name}}
        verification_code: code // Correspond à {{verification_code}}
    }).then(() => {
        window.location.href = "verify.html"; // Redirection vers ton module
    });
}

// --- FONCTION : VÉRIFIER (verify.html) ---
function verifierCode() {
    const tape = localStorage.getItem('code_tape'); // Récupéré par la grille de verify.html
    const attendu = localStorage.getItem('temp_code');

    if(tape === attendu && attendu !== null) {
        localStorage.setItem('threndly_id', 'Session_Active');
        window.location.href = "chat.html";
    } else {
        if(navigator.vibrate) navigator.vibrate([100, 50, 100]); // Vibration erreur
        alert("Code incorrect !");
    }
}

// N'oublie pas d'ajouter <script src="script.js"></script> à la fin de tes HTML !
