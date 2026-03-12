const CONFIG = {
    APP_NAME: "Threndly",
    APP_VERSION: "1.0.4",
    THEME_COLOR: "#8a2be2",
    VERIFIED_COLOR: "#007bff",
    API_URL: "https://api.threndly.com/v1",
    LOGGED_IN: true,
    USER_DATA: {
        username: "@createur_floy",
        isVerified: true,
        tokens: 1250
    }
};

// Fonction globale pour le badge bleu
function getBadge() {
    return CONFIG.USER_DATA.isVerified ? '<i class="fas fa-check-circle verified-badge"></i>' : '';
}
