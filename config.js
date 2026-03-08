// --- CONFIGURATION CENTRALISÉE THRENDLY ---
const CONFIG = {
    // Firebase (Tes vrais IDs de la console Firebase)
    firebase: {
        databaseURL: "https://trendly-fca7c-default-rtdb.firebaseio.com",
        projectId: "trendly-fca7c"
    },
    // EmailJS (Tes IDs de ton interface EmailJS)
    emailjs: {
        publicKey: "VOTRE_CLE_PUBLIQUE",
        serviceId: "service_id",
        templateId: "template_id"
    }
};

// Initialisation immédiate
firebase.initializeApp(CONFIG.firebase);
emailjs.init(CONFIG.emailjs.publicKey);
