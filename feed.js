// ========================
// MODULE FEED - FLOY
// Fil d'actualité + Scroll illimité (Infinite Scroll)
// ========================

class FeedModule {
    constructor() {
        this.posts = [];           // Tous les posts
        this.displayedPosts = [];  // Posts affichés
        this.currentPage = 0;
        this.postsPerPage = 5;     // Nombre de posts par chargement
        this.isLoading = false;
        this.hasMore = true;
        this.observer = null;
        this.sentinel = null;
    }

    // ========== INITIALISATION ==========
    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error("Container feed non trouvé");
            return;
        }
        this.loadPosts();
        this.setupInfiniteScroll();
    }

    // ========== CHARGEMENT DES POSTS ==========
    loadPosts() {
        const savedPosts = localStorage.getItem('floy_posts');
        if (savedPosts) {
            this.posts = JSON.parse(savedPosts);
        } else {
            // Posts de test
            this.posts = this.generateMockPosts(30);
            localStorage.setItem('floy_posts', JSON.stringify(this.posts));
        }
        // Trier par date (plus récent d'abord)
        this.posts.sort((a, b) => b.timestamp - a.timestamp);
        this.hasMore = this.posts.length > 0;
        this.currentPage = 0;
        this.displayedPosts = [];
        this.loadMorePosts();
    }

    // ========== GÉNÉRATION POSTS TEST ==========
    generateMockPosts(count) {
        const mockPosts = [];
        const users = [
            { username: "floy_official", avatar: "F", id: 1 },
            { username: "artiste_orange", avatar: "A", id: 2 },
            { username: "photographe", avatar: "P", id: 3 },
            { username: "design_noir", avatar: "D", id: 4 },
            { username: "voyageur", avatar: "V", id: 5 }
        ];
        const captions = [
            "Magnifique journée ! 🔥",
            "L'orange et le noir, une combinaison parfaite",
            "Nouveau post sur Floy ✨",
            "Partagez vos moments préférés",
            "La créativité n'a pas de limite",
            "Inspiration du jour",
            "Souvenir mémorable 📸"
        ];
        
        for (let i = 0; i < count; i++) {
            const user = users[Math.floor(Math.random() * users.length)];
            const randomDate = Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000;
            mockPosts.push({
                id: Date.now() + i,
                userId: user.id,
                username: user.username,
                avatar: user.avatar,
                avatarUrl: null,
                type: "photo",
                mediaUrl: `https://picsum.photos/600/500?random=${i}`,
                caption: captions[Math.floor(Math.random() * captions.length)],
                likes: Math.floor(Math.random() * 1000),
                liked: false,
                comments: [],
                timestamp: randomDate
            });
        }
        return mockPosts;
    }

    // ========== CHARGER PLUS DE POSTS ==========
    loadMorePosts() {
        if (this.isLoading || !this.hasMore) return;
        
        this.isLoading = true;
        this.showLoader();
        
        // Simuler un délai de chargement (comme une API)
        setTimeout(() => {
            const start = this.currentPage * this.postsPerPage;
            const end = start + this.postsPerPage;
            const newPosts = this.posts.slice(start, end);
            
            if (newPosts.length === 0) {
                this.hasMore = false;
                this.hideLoader();
                this.showEndMessage();
                this.isLoading = false;
                return;
            }
            
            this.displayedPosts = [...this.displayedPosts, ...newPosts];
            this.currentPage++;
            this.renderPosts(newPosts);
            this.hideLoader();
            this.isLoading = false;
            
            // Vérifier si on a atteint la fin
            if (end >= this.posts.length) {
                this.hasMore = false;
                this.showEndMessage();
            }
        }, 800); // Délai simulateur, à remplacer par vrai appel API
    }

    // ========== AFFICHAGE DES POSTS ==========
    renderPosts(postsToRender) {
        const postsHtml = postsToRender.map(post => this.renderPostHtml(post)).join('');
        this.container.insertAdjacentHTML('beforeend', postsHtml);
        this.attachPostEvents();
    }

    renderPostHtml(post) {
        const timeAgo = this.getTimeAgo(post.timestamp);
        return `
            <article class="post" data-post-id="${post.id}">
                <div class="post-header">
                    <div class="post-user" onclick="feedModule.goToUserProfile(${post.userId})">
                        <div class="post-avatar">${post.avatarUrl ? `<img src="${post.avatarUrl}">` : post.avatar}</div>
                        <div class="post-username">${post.username}</div>
                    </div>
                    <button class="post-more" onclick="feedModule.showPostOptions(${post.id})">
                        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2.5"/><circle cx="19" cy="12" r="2.5"/><circle cx="5" cy="12" r="2.5"/></svg>
                    </button>
                </div>

                <div class="post-image-container" onclick="feedModule.viewMedia('${post.mediaUrl}')">
                    ${post.type === 'video' ? 
                        `<video class="post-video" src="${post.mediaUrl}" controls></video>` : 
                        `<img class="post-image" src="${post.mediaUrl}" alt="Post">`
                    }
                </div>

                <div class="post-actions">
                    <button class="action-btn like-btn ${post.liked ? 'liked' : ''}" onclick="feedModule.handleLike(event, ${post.id})">
                        <svg viewBox="0 0 24 24">
                            <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938Z"/>
                        </svg>
                    </button>
                    <button class="action-btn" onclick="feedModule.showComments(${post.id})">
                        <svg viewBox="0 0 24 24"><path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"/></svg>
                    </button>
                    <button class="action-btn" onclick="feedModule.sharePost(${post.id}, '${post.mediaUrl}')">
                        <svg viewBox="0 0 24 24"><path d="M3 12h18M12 3l9 9-9 9"/></svg>
                    </button>
                    <button class="action-btn save-btn" onclick="feedModule.savePost(${post.id})">
                        <svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v16z"/></svg>
                    </button>
                </div>

                <div class="post-likes" id="likes-${post.id}">${this.formatLikes(post.likes)}</div>

                <div class="post-caption">
                    <strong>${post.username}</strong> ${this.escapeHtml(post.caption)}
                </div>

                <div class="post-comments" id="comments-${post.id}" onclick="feedModule.showComments(${post.id})">
                    ${post.comments.length === 0 ? "Soyez le premier à commenter" : `Voir les ${post.comments.length} commentaires`}
                </div>

                <div class="post-time">il y a ${timeAgo}</div>

                <div class="comment-form">
                    <input type="text" class="comment-input" id="comment-input-${post.id}" placeholder="Ajouter un commentaire..." onkeypress="if(event.key==='Enter') feedModule.addComment(${post.id})">
                    <button class="comment-post-btn" onclick="feedModule.addComment(${post.id})">Publier</button>
                </div>
            </article>
        `;
    }

    // ========== SCROLL INFINI ==========
    setupInfiniteScroll() {
        // Créer le sentinel (élément qui déclenche le chargement)
        this.sentinel = document.createElement('div');
        this.sentinel.id = 'infinite-scroll-sentinel';
        this.sentinel.style.height = '20px';
        this.sentinel.style.margin = '20px 0';
        this.container.parentNode.insertBefore(this.sentinel, this.container.nextSibling);
        
        // Observer pour détecter quand le sentinel entre dans le viewport
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isLoading && this.hasMore) {
                    this.loadMorePosts();
                }
            });
        }, { threshold: 0.1 });
        
        this.observer.observe(this.sentinel);
    }

    // ========== LOADER ==========
    showLoader() {
        const loader = document.getElementById('feed-loader');
        if (loader) {
            loader.style.display = 'flex';
        } else {
            const loaderHtml = `
                <div id="feed-loader" class="feed-loader">
                    <div class="feed-spinner"></div>
                    <span>Chargement...</span>
                </div>
            `;
            this.sentinel.insertAdjacentHTML('beforebegin', loaderHtml);
        }
    }

    hideLoader() {
        const loader = document.getElementById('feed-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    showEndMessage() {
        if (!document.getElementById('feed-end-message')) {
            const endHtml = `
                <div id="feed-end-message" class="feed-end-message">
                    ✨ Vous avez tout vu ! ✨
                </div>
            `;
            this.sentinel.insertAdjacentHTML('beforebegin', endHtml);
        }
        if (this.sentinel) this.sentinel.style.display = 'none';
        if (this.observer) this.observer.disconnect();
    }

    // ========== ATTACHER ÉVÉNEMENTS ==========
    attachPostEvents() {
        // Les événements sont déjà dans les onclick, pas besoin de plus
    }

    // ========== ACTIONS POSTS ==========
    handleLike(event, postId) {
        event.stopPropagation();
        const btn = event.currentTarget;
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;
        
        if (post.liked) {
            post.likes--;
            post.liked = false;
            btn.classList.remove('liked');
        } else {
            post.likes++;
            post.liked = true;
            btn.classList.add('liked');
            btn.style.transform = 'scale(1.2)';
            setTimeout(() => btn.style.transform = '', 200);
        }
        
        const likesSpan = document.getElementById(`likes-${postId}`);
        if (likesSpan) likesSpan.textContent = this.formatLikes(post.likes);
        
        localStorage.setItem('floy_posts', JSON.stringify(this.posts));
    }

    addComment(postId) {
        const input = document.getElementById(`comment-input-${postId}`);
        const text = input.value.trim();
        if (!text) return;
        
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            const currentUser = this.getCurrentUser();
            post.comments.push({
                username: currentUser.username,
                text: text,
                avatar: currentUser.avatar
            });
            input.value = '';
            
            const commentsSpan = document.getElementById(`comments-${postId}`);
            if (commentsSpan) {
                commentsSpan.textContent = `Voir les ${post.comments.length} commentaires`;
            }
            localStorage.setItem('floy_posts', JSON.stringify(this.posts));
        }
    }

    showComments(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;
        
        let modalHtml = `
            <div id="commentsModal" class="feed-comments-modal">
                <div class="feed-comments-modal-content">
                    <div class="feed-comments-modal-header">
                        <h3>Commentaires (${post.comments.length})</h3>
                        <button onclick="document.getElementById('commentsModal').remove()">&times;</button>
                    </div>
                    <div class="feed-comments-modal-body">
                        ${post.comments.length === 0 ? '<div style="text-align:center;padding:40px;color:#8e8e8e;">Aucun commentaire</div>' : 
                            post.comments.map(c => `
                                <div class="feed-comment-item">
                                    <div class="feed-comment-avatar">${c.avatar || c.username.charAt(0)}</div>
                                    <div class="feed-comment-content">
                                        <strong>${c.username}</strong>
                                        <div>${this.escapeHtml(c.text)}</div>
                                    </div>
                                </div>
                            `).join('')
                        }
                    </div>
                    <div class="feed-comments-modal-footer">
                        <input type="text" id="modalCommentInput" placeholder="Ajouter un commentaire...">
                        <button onclick="feedModule.addModalComment(${postId})">Publier</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    addModalComment(postId) {
        const input = document.getElementById('modalCommentInput');
        const text = input?.value.trim();
        if (!text) return;
        
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            const currentUser = this.getCurrentUser();
            post.comments.push({
                username: currentUser.username,
                text: text,
                avatar: currentUser.avatar
            });
            localStorage.setItem('floy_posts', JSON.stringify(this.posts));
            document.getElementById('commentsModal')?.remove();
            this.showComments(postId);
            
            const commentsSpan = document.getElementById(`comments-${postId}`);
            if (commentsSpan) {
                commentsSpan.textContent = `Voir les ${post.comments.length} commentaires`;
            }
        }
    }

    sharePost(postId, mediaUrl) {
        if (typeof partageModule !== 'undefined' && partageModule.showShareModal) {
            partageModule.showShareModal(postId, mediaUrl);
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Lien copié !");
        }
    }

    savePost(postId) {
        alert(`🔖 Post ${postId} sauvegardé !`);
    }

    viewMedia(mediaUrl) {
        window.open(mediaUrl, '_blank');
    }

    showPostOptions(postId) {
        if (confirm("Supprimer cette publication ?")) {
            this.posts = this.posts.filter(p => p.id !== postId);
            localStorage.setItem('floy_posts', JSON.stringify(this.posts));
            this.refresh();
        }
    }

    goToUserProfile(userId) {
        const currentUser = this.getCurrentUser();
        if (userId === currentUser.id) {
            window.location.href = 'profil.html';
        } else {
            alert(`👤 Profil utilisateur #${userId}`);
        }
    }

    // ========== RAFRAÎCHIR LE FEED ==========
    refresh() {
        this.container.innerHTML = '';
        this.currentPage = 0;
        this.displayedPosts = [];
        this.hasMore = true;
        if (this.sentinel) this.sentinel.style.display = 'block';
        this.loadMorePosts();
    }

    // ========== UTILITAIRES ==========
    getTimeAgo(timestamp) {
        const diff = Math.floor((Date.now() - timestamp) / 1000);
        if (diff < 60) return "À l'instant";
        if (diff < 3600) return `${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} j`;
        return new Date(timestamp).toLocaleDateString();
    }

    formatLikes(count) {
        if (count === 0) return "0 like";
        if (count === 1) return "1 like";
        if (count < 1000) return `${count} likes`;
        if (count < 1000000) return `${(count / 1000).toFixed(1)}k likes`;
        return `${(count / 1000000).toFixed(1)}M likes`;
    }

    getCurrentUser() {
        const saved = localStorage.getItem('floy_user');
        if (saved) return JSON.parse(saved);
        return { id: 1, username: "floy_user", avatar: "F" };
    }

    escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m]));
    }
}

// ========== STYLES CSS ==========
const feedStyles = `
    /* Feed Module - Styles */
    .feed-loader {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 20px;
        color: #8e8e8e;
    }
    
    .feed-spinner {
        width: 24px;
        height: 24px;
        border: 2px solid #262626;
        border-top-color: #FF6B35;
        border-radius: 50%;
        animation: feedSpin 0.6s linear infinite;
    }
    
    @keyframes feedSpin {
        to { transform: rotate(360deg); }
    }
    
    .feed-end-message {
        text-align: center;
        padding: 30px;
        color: #8e8e8e;
        font-size: 14px;
    }
    
    .feed-comments-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 3000;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .feed-comments-modal-content {
        background: #000;
        border-radius: 16px;
        width: 400px;
        max-width: 90%;
        max-height: 80%;
        display: flex;
        flex-direction: column;
        border: 1px solid #262626;
    }
    
    .feed-comments-modal-header {
        padding: 16px;
        border-bottom: 1px solid #262626;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .feed-comments-modal-header button {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
    }
    
    .feed-comments-modal-body {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
    }
    
    .feed-comment-item {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;
    }
    
    .feed-comment-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #FF6B35;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
    }
    
    .feed-comment-content {
        flex: 1;
    }
    
    .feed-comments-modal-footer {
        padding: 16px;
        border-top: 1px solid #262626;
        display: flex;
        gap: 12px;
    }
    
    .feed-comments-modal-footer input {
        flex: 1;
        background: #1a1a1a;
        border: 1px solid #262626;
        border-radius: 20px;
        padding: 10px 16px;
        color: white;
        outline: none;
    }
    
    .feed-comments-modal-footer button {
        background: none;
        border: none;
        color: #FF6B35;
        font-weight: 600;
        cursor: pointer;
    }
`;

// Ajouter les styles
if (!document.getElementById('feed-module-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'feed-module-styles';
    styleSheet.textContent = feedStyles;
    document.head.appendChild(styleSheet);
}

// ========== EXPORT ==========
const feedModule = new FeedModule();
window.feedModule = feedModule;

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('feed-container')) {
        feedModule.init('feed-container');
    }
    console.log("📰 Module Feed chargé (scroll illimité)");
});
