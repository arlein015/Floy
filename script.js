// --- FONCTION : INSCRIPTION E-MAIL ---
function lancerInscription() {
    const email = document.getElementById('reg-mail').value;
    const user = document.getElementById('reg-user').value || "Ami";
    const btn = document.getElementById('btn-submit');
    const loader = document.getElementById('loader');

    if (!email.includes('@')) {
        if(navigator.vibrate) navigator.vibrate([100, 50, 100]);
        return alert("Veuillez entrer un e-mail valide.");
    }

    // Effet visuel "Pro"
    btn.style.display = "none";
    loader.style.display = "block";

    // Génération du code à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem('temp_code', code);
    localStorage.setItem('temp_user', user);

    // Envoi via EmailJS
    emailjs.send(CONFIG.emailjs.serviceId, CONFIG.emailjs.templateId, {
        email: email,
        user_name: user,
        verification_code: code
    }).then(() => {
        window.location.href = "verify.html";
    }).catch(err => {
        alert("Erreur. Vérifiez votre config.js");
        btn.style.display = "block";
        loader.style.display = "none";
    });
}

// --- FONCTION : LOGOUT ---
function logout() {
    localStorage.removeItem('threndly_user');
    window.location.href = "index.html";
}
