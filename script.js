// --- CONFIGURATION ---
// Remplace par tes vrais IDs EmailJS
const SERVICE_ID = "YOUR_SERVICE_ID";
const TEMPLATE_ID_CODE = "YOUR_CODE_TEMPLATE_ID"; 
const PUBLIC_KEY = "YOUR_PUBLIC_KEY";

emailjs.init(PUBLIC_KEY);

// --- FONCTION : LOGOUT (DÉCONNEXION) ---
function logout() {
    // Supprime l'identifiant de la mémoire
    localStorage.removeItem('threndly_id');
    // Redirige vers l'accueil
    window.location.href = "index.html";
}

// --- FONCTION : ENVOYER LE CODE (Sur signup.html) ---
function envoyerCode() {
    const email = document.getElementById('reg-mail').value;
    const user = document.getElementById('reg-user').value || "Utilisateur";

    if(!email.includes('@')) return alert("Email invalide");

    // Génération du code à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem('temp_code', code);

    // Envoi via EmailJS
    emailjs.send(SERVICE_ID, TEMPLATE_ID_CODE, {
        email: email,
        user_name: user,
        verification_code: code
    }).then(() => {
        window.location.href = "verify.html";
    }).catch(err => alert("Erreur d'envoi. Vérifiez vos IDs."));
}

// --- FONCTION : VÉRIFIER LE CODE (Sur verify.html) ---
function verifierCode() {
    // Récupère les 6 chiffres (soit d'un input unique, soit du localStorage de verify.html)
    const tape = localStorage.getItem('code_tape'); 
    const attendu = localStorage.getItem('temp_code');

    if(tape === attendu && attendu !== null) {
        localStorage.setItem('threndly_id', 'Session_Active');
        window.location.href = "chat.html";
    } else {
        if(navigator.vibrate) navigator.vibrate([100, 50, 100]); // Vibration erreur
        alert("Code incorrect !");
    }
}

// --- GESTION DU CHAT (Simple) ---
function handleEnter(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}

function sendMessage() {
    const input = document.getElementById('msg-in');
    if(input.value.trim() !== "") {
        console.log("Message envoyé : " + input.value);
        input.value = ""; // Vide le champ
        // Ici tu ajouteras ta logique Firebase Database plus tard
    }
}
