// ========================
// MODULE LIKE - FLOY
// ========================
// Gestion des likes en temps réel
// Compatible avec tous les comptes

class LikeModule {
    constructor() {
        this.likesData = new Map(); // stockage des likes par postId
        this.observers = []; // pour mise à jour temps réel
        this.loadFromStorage();
    }

    // ========== CHARGEMENT DONNÉES ==========
    loadFromStorage() {
        const saved = localStorage.getItem('floy_likes_data');
        if (saved) {
            const parsed = JSON.parse(saved);
            for (let [key, value] of Object.entries(parsed)) {
                this.likesData.set(parseInt(key), value);
            }
        }
    }

    saveToStorage() {
        const obj = {};
        for (let [key, value] of this.likesData.entries()) {
            obj[key] = value;
        }
        localStorage.setItem('floy_likes_data', JSON.stringify(obj));
    }

    // ========== OBTENIR LES LIKES D'UN POST ==========
    getLikes(postId) {
        const data = this.likesData.get(postId);
        return data ? { count: data.count, liked: data.liked || false } : { count: 0, liked: false };
    }

    // ========== LIKE/UNLIKE ==========
    toggleLike(postId, userId = null) {
        const currentUserId = userId || this.getCurrentUserId();
        if (!currentUserId) {
            console.warn("Aucun utilisateur connecté");
            return { success: false, message: "Connectez-vous pour liker" };
        }

        let data = this.likesData.get(postId);
        if (!data) {
            data = { count: 0, liked: false, users: [] };
        }

        if (data.liked) {
            // UNLIKE
            data.count--;
            data.liked = false;
            data.users = data.users.filter(id => id !== currentUserId);
        } else {
            // LIKE
            data.count++;
            data.liked = true;
            if (!data.users.includes(currentUserId)) {
                data.users.push(currentUserId);
            }
        }

        this.likesData.set(postId, data);
        this.saveToStorage();
        
        // Notifier les observateurs
        this.notifyObservers(postId, { count: data.count, liked: data.liked });
        
        return { 
            success: true, 
            count: data.count, 
            liked: data.liked,
            postId: postId
        };
    }

    // ========== VÉRIFIER SI L'UTILISATEUR A LIKE ==========
    isLikedByUser(postId, userId = null) {
        const currentUserId = userId || this.getCurrentUserId();
        if (!currentUserId) return false;
        const data = this.likesData.get(postId);
        return data ? data.liked : false;
    }

    // ========== OBTENIR LA LISTE DES UTILISATEURS QUI ONT LIKE ==========
    getLikersList(postId) {
        const data = this.likesData.get(postId);
        return data ? data.users || [] : [];
    }

    // ========== OBTENIR LE COMPTEUR FORMATÉ ==========
    getFormattedLikes(postId) {
        const { count } = this.getLikes(postId);
        if (count === 0) return "0 like";
        if (count === 1) return "1 like";
        if (count < 1000) return `${count} likes`;
        if (count < 1000000) return `${(count / 1000).toFixed(1)}k likes`;
        return `${(count / 1000000).toFixed(1)}M likes`;
    }

    // ========== TEMPS RÉEL - OBSERVATEURS ==========
    subscribe(callback) {
        this.observers.push(callback);
    }

    unsubscribe(callback) {
        this.observers = this.observers.filter(cb => cb !== callback);
    }

    notifyObservers(postId, data) {
        this.observers.forEach(callback => {
            callback(postId, data);
        });
    }

    // ========== INITIALISATION D'UN POST ==========
    initPost(postId, initialCount = 0, initialLiked = false) {
        if (!this.likesData.has(postId)) {
            this.likesData.set(postId, {
                count: initialCount,
                liked: initialLiked,
                users: initialLiked ? [this.getCurrentUserId()] : []
            });
            this.saveToStorage();
        }
    }

    // ========== SYNC TEMPS RÉEL (simulation WebSocket) ==========
    startRealtimeSync() {
        // Simulation de connexion temps réel
        setInterval(() => {
            // Ici on pourrait faire un appel API pour synchro multi-utilisateurs
            console.log("🔄 LikeModule: synchro temps réel...");
        }, 30000);
    }

    // ========== UTILITAIRES ==========
    getCurrentUserId() {
        const savedUser = localStorage.getItem('floy_user');
        if (savedUser) {
            const user = JSON.parse(savedUser);
            return user.id || 1;
        }
        return 1; // valeur par défaut
    }

    // ========== RENDU HTML D'UN BOUTON LIKE ==========
    renderLikeButton(postId, customClass = '') {
        const { count, liked } = this.getLikes(postId);
        const formattedCount = this.getFormattedLikes(postId);
        
        return `
            <div class="like-module-container" data-post-id="${postId}">
                <button class="like-btn ${customClass} ${liked ? 'liked' : ''}" data-post-id="${postId}">
                    <svg viewBox="0 0 24 24">
                        <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938Z"/>
                    </svg>
                </button>
                <span class="like-count" data-post-id="${postId}">${formattedCount}</span>
            </div>
        `;
    }

    // ========== ATTACHER LES ÉVÉNEMENTS ==========
    attachEvents() {
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.removeEventListener('click', this._handleClick);
            btn.addEventListener('click', this._handleClick);
        });
    }

    _handleClick = async (e) => {
        e.stopPropagation();
        const btn = e.currentTarget;
        const postId = parseInt(btn.dataset.postId);
        
        // Animation
        btn.style.transform = 'scale(1.2)';
        setTimeout(() => { btn.style.transform = ''; }, 200);
        
        // Toggle like
        const result = likeModule.toggleLike(postId);
        
        if (result.success) {
            // Mettre à jour le bouton
            if (result.liked) {
                btn.classList.add('liked');
            } else {
                btn.classList.remove('liked');
            }
            
            // Mettre à jour le compteur
            const countSpan = document.querySelector(`.like-count[data-post-id="${postId}"]`);
            if (countSpan) {
                const newFormatted = likeModule.getFormattedLikes(postId);
                countSpan.textContent = newFormatted;
            }
            
            // Animation supplémentaire
            this.showHeartAnimation(btn);
        }
    }

    showHeartAnimation(btn) {
        const heart = document.createElement('div');
        heart.className = 'heart-animation';
        heart.innerHTML = '❤️';
        heart.style.position = 'absolute';
        heart.style.pointerEvents = 'none';
        heart.style.fontSize = '32px';
        heart.style.animation = 'heartFloat 0.8s ease-out forwards';
        
        const rect = btn.getBoundingClientRect();
        heart.style.left = rect.left + rect.width / 2 - 16 + 'px';
        heart.style.top = rect.top + rect.height / 2 - 16 + 'px';
        
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 800);
    }

    // ========== LISTE DES LIKERS (modal) ==========
    showLikersModal(postId) {
        const likers = this.getLikersList(postId);
        const { count } = this.getLikes(postId);
        
        if (count === 0) {
            alert("😢 Personne n'a liké ce post pour le moment");
            return;
        }
        
        let modalHtml = `
            <div id="likersModal" class="likers-modal">
                <div class="likers-modal-content">
                    <div class="likers-modal-header">
                        <h3>Likes (${count})</h3>
                        <button class="likers-modal-close" onclick="document.getElementById('likersModal').remove()">&times;</button>
                    </div>
                    <div class="likers-modal-body">
                        <div class="likers-list">
        `;
        
        // Simulation de noms d'utilisateurs (en vrai, venir d'une API)
        likers.forEach((userId, index) => {
            modalHtml += `
                <div class="liker-item">
                    <div class="liker-avatar">👤</div>
                    <div class="liker-name">Utilisateur_${userId}</div>
                    <button class="follow-liker-btn">Suivre</button>
                </div>
            `;
        });
        
        modalHtml += `
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Fermer en cliquant en dehors
        const modal = document.getElementById('likersModal');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
}

// ========== STYLES CSS À AJOUTER ==========
const likeStyles = `
    /* Module Like - Styles */
    .like-module-container {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .like-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
    }
    
    .like-btn svg {
        width: 24px;
        height: 24px;
        fill: none;
        stroke: #f5f5f5;
        stroke-width: 1.5;
        transition: all 0.2s;
    }
    
    .like-btn.liked svg {
        fill: #FF6B35;
        stroke: #FF6B35;
    }
    
    .like-count {
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
    }
    
    .like-count:hover {
        text-decoration: underline;
    }
    
    /* Animation cœur */
    @keyframes heartFloat {
        0% {
            opacity: 1;
            transform: scale(0.5);
        }
        50% {
            opacity: 1;
            transform: scale(1.2);
        }
        100% {
            opacity: 0;
            transform: translateY(-50px) scale(0.8);
        }
    }
    
    /* Modal likers */
    .likers-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .likers-modal-content {
        background: #000000;
        border-radius: 16px;
        width: 400px;
        max-width: 90%;
        max-height: 80%;
        display: flex;
        flex-direction: column;
        border: 1px solid #262626;
    }
    
    .likers-modal-header {
        padding: 16px;
        border-bottom: 1px solid #262626;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .likers-modal-header h3 {
        font-size: 16px;
        color: #ffffff;
    }
    
    .likers-modal-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
    }
    
    .likers-modal-body {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
    }
    
    .liker-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 0;
        border-bottom: 1px solid #262626;
    }
    
    .liker-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #FF6B35;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
    }
    
    .liker-name {
        flex: 1;
        font-weight: 500;
    }
    
    .follow-liker-btn {
        background: none;
        border: none;
        color: #FF6B35;
        font-weight: 600;
        cursor: pointer;
    }
`;

// Ajouter les styles au document
if (!document.getElementById('like-module-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'like-module-styles';
    styleSheet.textContent = likeStyles;
    document.head.appendChild(styleSheet);
}

// ========== EXPORT ET INITIALISATION ==========
const likeModule = new LikeModule();

// Initialisation automatique quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    likeModule.startRealtimeSync();
    likeModule.attachEvents();
});

// Rendre accessible globalement
window.likeModule = likeModule;
