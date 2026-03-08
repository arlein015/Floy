// --- FONCTION : LOGOUT ---
function logout() {
    localStorage.removeItem('threndly_id');
    window.location.href = "index.html";
}

// --- FONCTION : ENVOYER LE CODE (signup.html) ---
function envoyerCode() {
    const email = document.getElementById('reg-mail').value;
    const user = document.getElementById('reg-user').value || "Utilisateur";

    if(!email.includes('@')) {
        if(navigator.vibrate) navigator.vibrate(200);
        return alert("Email invalide");
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem('temp_code', code);

    emailjs.send(CONFIG.emailjs.serviceId, CONFIG.emailjs.templateId, {
        email: email,
        user_name: user,
        verification_code: code
    }).then(() => {
        window.location.href = "verify.html";
    });
}

// --- FONCTION : VÉRIFIER LE CODE (verify.html) ---
function verifierCode() {
    const tape = localStorage.getItem('code_tape'); // Récupéré via la grille de verify.html
    const attendu = localStorage.getItem('temp_code');

    if(tape === attendu && attendu !== null) {
        localStorage.setItem('threndly_id', 'Session_Active');
        window.location.href = "chat.html";
    } else {
        if(navigator.vibrate) navigator.vibrate([100, 50, 100]); 
        alert("Code incorrect !");
    }
}

// --- GESTION DU CHAT ---
function handleEnter(e) { if(e.key === "Enter") sendMessage(); }

function sendMessage() {
    const inp = document.getElementById('msg-in');
    if(inp.value.trim() !== "") {
        console.log("Message Threndly envoyé");
        inp.value = "";
    }
}
