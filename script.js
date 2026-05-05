// ========== DONNÉES ==========
let currentUser = {
    id: 1,
    username: "floy_user",
    fullName: "Floy Creator",
    avatar: "F",
    bio: "Créateur de Floy 🔥 Passionné de design orange et noir",
    website: "floy.app",
    postsCount: 3,
    followers: 128,
    following: 94
};

let posts = [
    {
        id: 1,
        userId: 1,
        username: "floy_user",
        avatar: "F",
        imageUrl: "https://picsum.photos/600/500?random=1",
        caption: "Bienvenue sur Floy ! Le réseau social orange et noir 🔥",
        likes: 124,
        liked: false,
        comments: ["Superbe plateforme !", "J'adore le thème orange"],
        timestamp: "2 HEURES",
        timeValue: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
        id: 2,
        userId: 2,
        username: "artiste_orange",
        avatar: "A",
        imageUrl: "https://picsum.photos/600/500?random=2",
        caption: "L'orange et le noir, un duo parfait pour l'art",
        likes: 89,
        liked: true,
        comments: ["Magnifique !", "Très inspirant"],
        timestamp: "5 HEURES",
        timeValue: new Date(Date.now() - 5 * 60 * 60 * 1000)
    },
    {
        id: 3,
        userId: 3,
        username: "photographe",
        avatar: "P",
        imageUrl: "https://picsum.photos/600/500?random=3",
        caption: "Coucher de soleil sur Floy",
        likes: 234,
        liked: false,
        comments: ["Waouh incroyable", "Super composition"],
        timestamp: "1 JOUR",
        timeValue: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    {
        id: 4,
        userId: 1,
        username: "floy_user",
        avatar: "F",
        imageUrl: "https://picsum.photos/600/500?random=4",
        caption: "Nouveau design pour Floy !",
        likes: 56,
        liked: false,
        comments: ["J'adore !"],
        timestamp: "3 JOURS",
        timeValue: new Date(Date.now() - 72 * 60 * 60 * 1000)
    }
];

let stories = [
    { userId: 1, username: "floy_user", avatar: "F", hasStory: true },
    { userId: 2, username: "artiste_orange", avatar: "A", hasStory: true },
    { userId: 3, username: "photographe", avatar: "P", hasStory: false }
];

// ========== FORMATAGE TEMPS ==========
function formatTime(date) {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return "À l'instant";
    if (diff < 3600) return `${Math.floor(diff / 60)} MINUTES`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} HEURES`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} JOURS`;
    return date.toLocaleDateString();
}

// ========== RENDU DES STORIES ==========
function renderStories() {
    const container = document.getElementById('stories');
    if (!container) return;
    
    container.innerHTML = stories.map(story => `
        <div class="story" data-user="${story.username}">
            <div class="story-avatar" style="${story.hasStory ? 'background: linear-gradient(45deg, #FF6B35, #FF9F5C);' : 'background: #262626;'}">
                <div>${story.avatar}</div>
            </div>
            <div class="story-username">${story.username}</div>
        </div>
    `).join('');
}

// ========== RENDU D'UN POST ==========
function renderPost(post) {
    return `
        <article class="post" data-post-id="${post.id}">
            <div class="post-header">
                <div class="post-user">
                    <div class="post-avatar">${post.avatar}</div>
                    <div class="post-username">${post.username}</div>
                </div>
                <button class="post-more">
                    <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="2.5"/>
                        <circle cx="19" cy="12" r="2.5"/>
                        <circle cx="5" cy="12" r="2.5"/>
                    </svg>
                </button>
            </div>

            <div class="post-image-container">
                <img class="post-image" src="${post.imageUrl}" alt="Post">
            </div>

            <div class="post-actions">
                <button class="action-btn like-btn ${post.liked ? 'liked' : ''}" data-id="${post.id}">
                    <svg viewBox="0 0 24 24">
                        <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938Z"/>
                    </svg>
                </button>
                <button class="action-btn comment-btn" data-id="${post.id}">
                    <svg viewBox="0 0 24 24">
                        <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"/>
                    </svg>
                </button>
                <button class="action-btn share-btn">
                    <svg viewBox="0 0 24 24">
                        <path d="M19.5 5.5v13a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1Z"/>
                        <path d="m16.5 7.5-5 5"/>
                        <path d="M9.5 11.5h5v5"/>
                    </svg>
                </button>
                <button class="action-btn save-btn">
                    <svg viewBox="0 0 24 24">
                        <path d="M19 21l-7-5-7 5V5a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v16z"/>
                    </svg>
                </button>
            </div>

            <div class="post-likes" id="likes-${post.id}">
                ${post.likes} ${post.likes === 1 ? 'like' : 'likes'}
            </div>

            <div class="post-caption">
                <strong>${post.username}</strong>
                <span>${post.caption}</span>
            </div>

            <div class="post-comments" data-id="${post.id}">
                ${post.comments.length > 0 ? `Voir les ${post.comments.length} commentaires` : 'Soyez le premier à commenter'}
            </div>

            <div class="post-time">
                il y a ${post.timestamp}
            </div>

            <div class="comment-form">
                <input type="text" class="comment-input" placeholder="Ajouter un commentaire..." data-id="${post.id}">
                <button class="comment-post-btn" data-id="${post.id}">Publier</button>
            </div>
        </article>
    `;
}

// ========== RENDU DU FEED ==========
function renderFeed() {
    const container = document.getElementById('feed-container');
    if (!container) return;
    
    container.innerHTML = posts.map(post => renderPost(post)).join('');
    attachFeedEvents();
}

// ========== ATTACHER LES ÉVÉNEMENTS ==========
function attachFeedEvents() {
    // Likes
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.removeEventListener('click', handleLikeClick);
        btn.addEventListener('click', handleLikeClick);
    });
    
    // Commentaires (bouton Publier)
    document.querySelectorAll('.comment-post-btn').forEach(btn => {
        btn.removeEventListener('click', handleCommentPost);
        btn.addEventListener('click', handleCommentPost);
    });
    
    // Input commentaire (touche Entrée)
    document.querySelectorAll('.comment-input').forEach(input => {
        input.removeEventListener('keypress', handleCommentKeypress);
        input.addEventListener('keypress', handleCommentKeypress);
    });
    
    // Voir les commentaires
    document.querySelectorAll('.post-comments').forEach(commentsDiv => {
        commentsDiv.removeEventListener('click', handleViewComments);
        commentsDiv.addEventListener('click', handleViewComments);
    });
}

function handleLikeClick(e) {
    const btn = e.currentTarget;
    const postId = parseInt(btn.dataset.id);
    const post = posts.find(p => p.id === postId);
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
        setTimeout(() => { btn.style.transform = ''; }, 200);
    }
    
    const likesSpan = document.getElementById(`likes-${postId}`);
    if (likesSpan) {
        likesSpan.textContent = `${post.likes} ${post.likes === 1 ? 'like' : 'likes'}`;
    }
}

function handleCommentPost(e) {
    const btn = e.currentTarget;
    const postId = parseInt(btn.dataset.id);
    const input = document.querySelector(`.comment-input[data-id="${postId}"]`);
    const text = input.value.trim();
    if (!text) return;
    
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.comments.push(text);
        const commentsDiv = document.querySelector(`.post-comments[data-id="${postId}"]`);
        if (commentsDiv) {
            commentsDiv.textContent = `Voir les ${post.comments.length} commentaires`;
        }
        input.value = '';
    }
}

function handleCommentKeypress(e) {
    if (e.key === 'Enter') {
        const input = e.currentTarget;
        const postId = parseInt(input.dataset.id);
        const btn = document.querySelector(`.comment-post-btn[data-id="${postId}"]`);
        if (btn) btn.click();
    }
}

function handleViewComments(e) {
    const commentsDiv = e.currentTarget;
    const postId = parseInt(commentsDiv.dataset.id);
    const post = posts.find(p => p.id === postId);
    if (post && post.comments.length > 0) {
        alert(`Commentaires :\n${post.comments.map(c => `• ${c}`).join('\n')}`);
    }
}

// ========== PROFIL ==========
function renderProfile() {
    const userPosts = posts.filter(p => p.userId === currentUser.id);
    
    return `
        <div class="profile-header">
            <div class="profile-avatar">${currentUser.avatar}</div>
            <div class="profile-username">${currentUser.username}</div>
            <div class="profile-bio">${currentUser.bio}</div>
            <div class="profile-stats">
                <div class="stat">
                    <div class="stat-number">${userPosts.length}</div>
                    <div class="stat-label">publications</div>
                </div>
                <div class="stat">
                    <div class="stat-number">${currentUser.followers}</div>
                    <div class="stat-label">abonnés</div>
                </div>
                <div class="stat">
                    <div class="stat-number">${currentUser.following}</div>
                    <div class="stat-label">abonnements</div>
                </div>
            </div>
        </div>
        <div class="profile-posts">
            ${userPosts.map(post => `
                <div class="profile-post">
                    <img src="${post.imageUrl}" alt="${post.caption}">
                </div>
            `).join('')}
        </div>
    `;
}

// ========== EXPLORE ==========
function renderExplore() {
    const explorePosts = [...posts].sort(() => Math.random() - 0.5);
    return `
        <div class="explore-grid">
            ${explorePosts.map(post => `
                <div class="explore-item">
                    <img src="${post.imageUrl}" alt="${post.caption}">
                </div>
            `).join('')}
        </div>
    `;
}

// ========== NAVIGATION ==========
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const containers = {
        feed: 'feed-container',
        profile: 'profile-container',
        explore: 'explore-container',
        search: 'search-container',
        reels: 'reels-container',
        messages: 'messages-container',
        notifications: 'notifications-container',
        create: 'create-container',
        settings: 'settings-container'
    };
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            
            // Mise à jour active
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Cacher tous les containers
            Object.values(containers).forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'none';
            });
            
            // Afficher le bon container
            const activeContainer = document.getElementById(containers[page]);
            if (activeContainer) {
                activeContainer.style.display = 'block';
                
                // Remplir le contenu
                if (page === 'feed') {
                    renderFeed();
                } else if (page === 'profile') {
                    activeContainer.innerHTML = renderProfile();
                } else if (page === 'explore') {
                    activeContainer.innerHTML = renderExplore();
                } else if (page === 'create') {
                    openCreateModal();
                } else {
                    activeContainer.innerHTML = `<div class="placeholder">📱 Page ${page} - Bientôt disponible</div>`;
                }
            }
        });
    });
}

// ========== MODAL CRÉATION ==========
function openCreateModal() {
    const modal = document.getElementById('createModal');
    modal.classList.add('active');
    
    const uploadArea = document.getElementById('uploadArea');
    const previewContainer = document.getElementById('previewContainer');
    const fileInput = document.getElementById('fileInput');
    const selectFileBtn = document.getElementById('selectFileBtn');
    const publishBtn = document.getElementById('publishBtn');
    const postCaption = document.getElementById('postCaption');
    const previewImage = document.getElementById('previewImage');
    
    selectFileBtn.onclick = () => fileInput.click();
    
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                previewImage.src = event.target.result;
                uploadArea.style.display = 'none';
                previewContainer.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    };
    
    publishBtn.onclick = () => {
        const caption = postCaption.value;
        if (previewImage.src && caption) {
            const newPost = {
                id: Date.now(),
                userId: currentUser.id,
                username: currentUser.username,
                avatar: currentUser.avatar,
                imageUrl: previewImage.src,
                caption: caption,
                likes: 0,
                liked: false,
                comments: [],
                timestamp: "À l'instant",
                timeValue: new Date()
            };
            posts.unshift(newPost);
            renderFeed();
            modal.classList.remove('active');
            uploadArea.style.display = 'block';
            previewContainer.style.display = 'none';
            postCaption.value = '';
            fileInput.value = '';
        }
    };
}

function setupModal() {
    const modal = document.getElementById('createModal');
    const closeBtn = document.querySelector('.modal-close');
    
    closeBtn.onclick = () => {
        modal.classList.remove('active');
        document.getElementById('uploadArea').style.display = 'block';
        document.getElementById('previewContainer').style.display = 'none';
    };
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    };
}

// ========== INITIALISATION ==========
function init() {
    renderStories();
    renderFeed();
    setupNavigation();
    setupModal();
    
    // Afficher le feed par défaut
    document.getElementById('feed-container').style.display = 'block';
}

init();
