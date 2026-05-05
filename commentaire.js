// ========================
// MODULE COMMENTAIRE - FLOY
// ========================
// Gestion des commentaires avec affichage complet

class CommentaireModule {
    constructor() {
        this.commentairesData = new Map(); // stockage par postId
        this.observers = [];
        this.loadFromStorage();
    }

    // ========== CHARGEMENT/SAUVEGARDE ==========
    loadFromStorage() {
        const saved = localStorage.getItem('floy_commentaires_data');
        if (saved) {
            const parsed = JSON.parse(saved);
            for (let [key, value] of Object.entries(parsed)) {
                this.commentairesData.set(parseInt(key), value);
            }
        }
    }

    saveToStorage() {
        const obj = {};
        for (let [key, value] of this.commentairesData.entries()) {
            obj[key] = value;
        }
        localStorage.setItem('floy_commentaires_data', JSON.stringify(obj));
    }

    // ========== OBTENIR COMMENTAIRES D'UN POST ==========
    getCommentaires(postId) {
        return this.commentaire
