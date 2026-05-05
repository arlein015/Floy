// ========================
// MODULE LIKE - VERSION AMÉLIORÉE
// ========================

class LikeModule {
    constructor() {
        this.likesData = new Map();
        this.animationsEnabled = true;
        this.loadFromStorage();
    }

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

    getLikes(postId) {
        const data = this.likesData.get(postId);
        return data ? { count: data.count, liked: data.liked || false } : { count: 0, liked: false };
    }

    toggleLike(postId, userId = null) {
        const currentUserId = userId || this.getCurrentUserId();
        let data = this.likesData.get(postId) || { count: 0, liked: false, users: [] };
        
        if (data.liked) {
            data.count--;
            data.liked = false;
            data.users = data.users.filter(id => id !== currentUserId);
        } else {
            data.count++;
            data.liked = true;
            if (!data.users.includes(currentUserId)) data.users.push(currentUserId);
        }
        
        this.likesData.set(postId, data);
        this.saveToStorage();
        
        return { success: true, count: data.count, liked: data.liked };
    }

    // ✅ NOUVEAU: Animation cœur qui explose (comme Instagram)
    showHeartExplosion(x, y) {
        const heart = document.createElement('div');
        heart.innerHTML = '❤️';
        heart.style.position = 'fixed';
        heart.style.left = x + 'px';
        heart.style.top = y + 'px';
        heart.style.fontSize = '40px';
        heart.style.pointerEvents = 'none';
        heart.style.zIndex = '9999';
        heart.style.animation = 'heartExplode 0.6s ease-out forwards';
        document.body.appendChild(heart);
        
        setTimeout(() => heart.remove(), 600);
        
        // Ajouter l'animation CSS si pas présente
        if (!document.getElementById('like-animation-styles')) {
            const style = document.createElement('style');
            style.id = 'like-animation-styles';
            style.textContent = `
                @keyframes heartExplode {
                    0% { transform: scale(0.5); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 1; }
                    100% { transform: scale(2); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ✅ NOUVEAU: Afficher la modal "Voir les likes"
    showLikersModal(postId) {
        const data = this.likesData.get(postId);
        const count = data ? data.count : 0;
        const users = data ? data.users : [];
        
        if (count === 0) {
            alert("😢 Personne n'a liké ce post");
            return;
        }
        
        const modalHtml = `
            <div id="likersModal" class="modal-likers">
                <div class="modal-likers-content">
                    <div class="modal-likers-header">
                        <h3>Likes (${count})</h3>
                        <button onclick="this.closest('#likersModal').remove()">×</button>
                    </div>
                    <div class="modal-likers-body">
                        ${users.map(userId => `
                            <div class="liker-row">
                                <div class="liker-avatar">👤</div>
                                <div class="liker-name">Utilisateur_${userId}</div>
                                <button class="liker-follow-btn">Suivre</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    // ✅ NOUVEAU: Formatage avancé des likes (1.2k, 1M)
    getFormattedLikes(postId) {
        const { count } = this.getLikes(postId);
        if (count === 0) return "0 like";
        if (count === 1) return "1 like";
        if (count < 1000) return `${count} likes`;
        if (count < 1000000) return `${(count / 1000).toFixed(1)}k likes`;
        return `${(count / 1000000).toFixed(1)}M likes`;
    }

    // ✅ NOUVEAU: Like double-click (double clic sur image = like)
    setupDoubleClickLike(postElement, postId) {
        let clickTimer = null;
        postElement.addEventListener('click', (e) => {
            if (clickTimer) {
                clearTimeout(clickTimer);
                clickTimer = null;
                // Double clic détecté
                this.toggleLike(postId);
                const rect = e.target.getBoundingClientRect();
                this.showHeartExplosion(rect.left + rect.width/2, rect.top + rect.height/2);
            } else {
                clickTimer = setTimeout(() => {
                    clickTimer = null;
                }, 300);
            }
        });
    }

    getCurrentUserId() {
        const saved = localStorage.getItem('floy_user');
        if (saved) return JSON.parse(saved).id || 1;
        return 1;
    }

    renderLikeButton(postId, isLiked) {
        return `
            <button class="action-btn like-btn ${isLiked ? 'liked' : ''}" data-post-id="${postId}" onclick="likeModule.handleLikeClick(event, ${postId})">
                <svg viewBox="0 0 24 24">
                    <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938Z"/>
                </svg>
            </button>
        `;
    }

    handleLikeClick(event, postId) {
        event.stopPropagation();
        const btn = event.currentTarget;
        const result = this.toggleLike(postId);
        
        if (result.liked) {
            btn.classList.add('liked');
            btn.style.transform = 'scale(1.2)';
            setTimeout(() => { btn.style.transform = ''; }, 200);
            // Afficher l'animation cœur
            const rect = btn.getBoundingClientRect();
            this.showHeartExplosion(rect.left + rect.width/2, rect.top + rect.height/2);
        } else {
            btn.classList.remove('liked');
        }
        
        // Mettre à jour l'affichage
        const likesSpan = document.getElementById(`likes-${postId}`);
        if (likesSpan) likesSpan.textContent = this.getFormattedLikes(postId);
        
        // Déclencher événement pour notifier
        window.dispatchEvent(new CustomEvent('floy-like-toggled', { detail: { postId, liked: result.liked, count: result.count } }));
    }
}

const likeModule = new LikeModule();
window.likeModule = likeModule;
