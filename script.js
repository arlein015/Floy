// --- CONFIGURATION ---
const firebaseConfig = { 
    databaseURL: "https://trendly-fca7c-default-rtdb.firebaseio.com", 
    projectId: "trendly-fca7c" 
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
emailjs.init("VOTRE_CLE_PUBLIQUE"); //

let timerEnCours = false;

// --- FONCTION : ENVOYER LE CODE (Sur signup.html) ---
function envoyerCode() {
    if(timerEnCours) return;
    const email = document.getElementById('reg-mail').value;
    const user = document.getElementById('reg-user').value || "Utilisateur";

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem('temp_code', code); // On stocke pour vérifier sur verify.html

    emailjs.send("service_id", "template_id", {
        email: email, //
        user_name: user, //
        verification_code: code //
    }).then(() => {
        window.location.href = "verify.html"; //
    });
}

// --- FONCTION : VÉRIFIER (Sur verify.html) ---
function verifierCode() {
    const tape = document.getElementById('v-code').value;
    const attendu = localStorage.getItem('temp_code');

    if(tape === attendu) {
        localStorage.setItem('threndly_id', 'Logged');
        window.location.href = "chat.html"; //
    } else {
        if(navigator.vibrate) navigator.vibrate([100, 50, 100]); // Vibration d'erreur
        alert("Code incorrect !");
    }
}
