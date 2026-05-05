// ========== DONNÉES ==========
let currentUser = {
    id: 1,
    username: "floy_user",
    fullname: "Floy Creator",
    avatar: "F",
    avatarUrl: null,
    bio: "Créateur de Floy 🔥",
    followers: 128,
    following: 94
};

let posts = [];
let stories = [];

// ========== INITIALISATION ==========
function init() {
    loadData();
    setupNavigation();
    updateSidebar();
    renderStories();
    renderFeed();
    setupSuggestions();
    setupModals();
}

// ========== CHARGEMENT DONNÉES ==========
function loadData() {
    const savedUser = localStorage.getItem('floy_user');
    if (savedUser) {
        currentUser = { ...currentUser, ...JSON.parse(savedUser) };
    }

    const savedPosts = localStorage.getItem('floy_posts');
    if (savedPosts) {
        posts = JSON.parse(savedPosts);
    } else {
        posts = [
            {
                id: 1,
                userId: 1,
                username: "floy_user",
                avatar: "F",
                avatarUrl: null,
                type: "photo",
                mediaUrl: "https://picsum.photos/600/500?random=1",
                caption: "Bienvenue sur Floy ! Le réseau social orange et noir 🔥",
                likes: 124,
                liked: false,
                comments: [{ username: "visiteur1", text: "Superbe plateforme !", avatar: "V" }],
                timestamp: Date.now() - 2 * 60 * 60 * 1000
            },
            {
                id: 2,
                userId: 2,
                username: "artiste_orange",
                avatar: "A",
                avatarUrl: null,
                type: "photo",
                mediaUrl: "https://picsum.photos/600/500?random=2",
                caption: "L'orange et le noir, un duo parfait !",
                likes: 89,
                liked: false,
                comments: [{ username: "fan_art", text: "Magnifique !", avatar: "F" }],
                timestamp: Date.now() - 5 * 60 * 60 * 1000
            }
        ];
        savePosts();
    }

    const savedStories = localStorage.getItem('floy_stories');
    if (savedStories) {
        stories = JSON.parse(savedStories);
        stories = stories.filter(s => Date.now() - s.timestamp < 24 * 60 * 60 * 1000);
        saveStories();
    }
}

function savePosts() {
    localStorage.setItem('floy_posts', JSON.stringify(posts));
}

function saveStories() {
    localStorage.setItem('floy_stories', JSON.stringify(stories));
}

function updateSidebar() {
    const avatarEl = document.getElementById('sidebarAvatar');
    if (currentUser.avatarUrl) {
        avatarEl.innerHTML = `<img src="${currentUser.avatarUrl}">`;
    } else {
        avatarEl.textContent = currentUser.avatar;
    }
    document.getElementById('sidebarUsername').textContent = currentUser.username;
    document.getElementById('sidebarName').textContent = currentUser.fullname;
}

// ========== RENDU STORIES ==========
function renderStories() {
    const container = document.getElementById('stories');
    const validStories = stories.filter(s => Date.now() - s.timestamp < 24 * 60 * 60 * 1000);
    
    container.innerHTML = `
        <div class="story" onclick="openCreateStoryModal()">
            <div class="story-avatar has-story">
                <div class="story-avatar-inner">
                    ${currentUser.avatarUrl ? `<img src="${currentUser.avatarUrl}">` : '📸'}
                </div>
            </div>
            <div class="story-username">Votre story</div>
            <button class="create-story-btn">+ Créer</button>
        </div>
    `;
    
    const otherStories = validStories.filter(s => s.userId !== currentUser.id);
    const uniqueUsers = [...new Map(otherStories.map(s => [s.userId, s])).values()];
    
    uniqueUsers.forEach(story => {
        container.innerHTML += `
            <div class="story" onclick="viewStory(${story.userId})">
                <div class="story-avatar has-story">
                    <div class="story-avatar-inner">
                        ${story.avatarUrl ? `<img src="${story.avatarUrl}">` : story.avatar}
                    </div>
                </div>
                <div class="story-username">${story.username}</div>
            </div>
        `;
    });
}

// ========== RENDU FEED ==========
function renderFeed() {
    const container = document.getElementById('feed-container');
    
    if (posts.length === 0) {
        container.innerHTML = '<div class="loader">📸 Aucune publication<br><small>Soyez le premier à partager !</small></div>';
        return;
    }
    
    const sortedPosts = [...posts].sort((a, b) => b.timestamp - a.timestamp);
    container.innerHTML = sortedPosts.map(post => renderPost(post)).join('');
}

function renderPost(post) {
    const timeAgo = getTimeAgo(post.timestamp);
    const isLiked = post.liked || false;
    
    return `
        <article class="post" data-post-id="${post.id}">
            <div class="post-header">
                <div class="post-user" onclick="goToUserProfile(${post.userId})">
                    <div class="post-avatar">
                        ${post.avatarUrl ? `<img src="${post.avatarUrl}">` : post.avatar}
                    </div>
                    <div class="post-username">${post.username}</div>
                </div>
                <button class="post-more" onclick="showPostOptions(${post.id})">
                    <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="2.5"/>
                        <circle cx="19" cy="12" r="2.5"/>
                        <circle cx="5" cy="12" r="2.5"/>
                    </svg>
                </button>
            </div>

            <div class="post-image-container" onclick="viewMedia('${post.mediaUrl}')">
                ${post.type === 'video' ? 
                    `<video class="post-video" src="${post.mediaUrl}" controls></video>` : 
                    `<img class="post-image" src="${post.mediaUrl}" alt="Post">`
                }
            </div>

            <div class="post-actions">
                <button class="action-btn like-btn ${isLiked ? 'liked' : ''}" onclick="handleLike(event, ${post.id})">
                    <svg viewBox="0 0 24 24">
                        <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938Z"/>
                    </svg>
                </button>
                <button class="action-btn comment-btn" onclick="focusCommentInput(${post.id})">
                    <svg viewBox="0 0 24 24">
                        <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"/>
                    </svg>
                </button>
                <button class="action-btn share-btn" onclick="sharePost(${post.id})">
                    <svg viewBox="0 0 24 24">
                        <path d="M3 12h18M12 3l9 9-9 9"/>
                    </svg>
                </button>
                <button class="action-btn save-btn" onclick="savePost(${post.id})">
                    <svg viewBox="0 0 24 24">
                        <path d="M19 21l-7-5-7 5V5a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v16z"/>
                    </svg>
                </button>
            </div>

            <div class="post-likes" onclick="showLikers(${post.id})">
                ${post.likes} ${post.likes === 1 ? 'like' : 'likes'}
            </div>

            <div class="post-caption">
                <strong onclick="goToUserProfile(${post.userId})">${post.username}</strong>
                <span>${escapeHtml(post.caption)}</span>
            </div>

            <div class="post-comments" onclick="viewAllComments(${post.id})">
                ${post.comments.length > 0 ? `Voir les ${post.comments.length} commentaires` : 'Soyez le premier à commenter'}
            </div>

            <div class="post-time">
                il y a ${timeAgo}
            </div>

            <div class="comment-form">
                <input type="text" class="comment-input" id="comment-input-${post.id}" placeholder="Ajouter un commentaire..." onkeypress="handleCommentKeypress(event, ${post.id})">
                <button class="comment-post-btn" onclick="addComment(${post.id})">Publier</button>
            </div>
        </article>
    `;
}

// ========== GESTION LIKES ==========
function handleLike(event, postId) {
    event.stopPropagation();
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const btn = event.currentTarget;
    
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
    
    const likesDiv = btn.closest('.post').querySelector('.post-likes');
    if (likesDiv) {
        likesDiv.textContent = `${post.likes} ${post.likes === 1 ? 'like' : 'likes'}`;
    }
    
    savePosts();
}

// ========== GESTION COMMENTAIRES ==========
function addComment(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    const text = input.value.trim();
    if (!text) return;
    
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.comments.push({
            username: currentUser.username,
            text: text,
            avatar: currentUser.avatar,
            avatarUrl: currentUser.avatarUrl
        });
        input.value = '';
        
        const commentsDiv = document.querySelector(`.post[data-post-id="${postId}"] .post-comments`);
        if (commentsDiv) {
            commentsDiv.textContent = `Voir les ${post.comments.length} commentaires`;
        }
        
        savePosts();
    }
}

function viewAllComments(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post || post.comments.length === 0) return;
    
    const modal = document.getElementById('commentsModal');
    const list = document.getElementById('commentsList');
    
    list.innerHTML = post.comments.map(comment => `
        <div class="comment-item">
            <div class="comment-avatar">
                ${comment.avatarUrl ? `<img src="${comment.avatarUrl}">` : (comment.avatar || comment.username.charAt(0).toUpperCase())}
            </div>
            <div class="comment-content">
                <div class="comment-username">${comment.username}</div>
                <div class="comment-text">${escapeHtml(comment.text)}</div>
            </div>
        </div>
    `).join('');
    
    modal.classList.add('active');
}

function closeCommentsModal() {
    document.getElementById('commentsModal').classList.remove('active');
}

function focusCommentInput(postId) {
    document.getElementById(`comment-input-${postId}`).focus();
}

function handleCommentKeypress(event, postId) {
    if (event.key === 'Enter') {
        addComment(postId);
    }
}

// ========== GESTION STORIES ==========
function openCreateStoryModal() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const newStory = {
                    id: Date.now(),
                    userId: currentUser.id,
                    username: currentUser.username,
                    avatar: currentUser.avatar,
                    avatarUrl: currentUser.avatarUrl,
                    type: file.type.startsWith('video') ? 'video' : 'photo',
                    mediaUrl: event.target.result,
                    timestamp: Date.now()
                };
                stories.push(newStory);
                saveStories();
                renderStories();
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

function viewStory(userId) {
    const userStories = stories.filter(s => s.userId === userId);
    if (userStories.length === 0) return;
    
    let currentIndex = 0;
    const modal = document.getElementById('storyModal');
    const content = document.getElementById('storyContent');
    const progressBar = document.getElementById('storyProgress');
    
    function showStory(index) {
        const story = userStories[index];
        content.innerHTML = story.type === 'video' ?
            `<video src="${story.mediaUrl}" autoplay style="width:100%;border-radius:16px;"></video>` :
            `<img src="${story.mediaUrl}" style="width:100%;border-radius:16px;">`;
        
        progressBar.style.width = '0%';
        let width = 0;
        const interval = setInterval(() => {
            width += 2;
            progressBar.style.width = width + '%';
            if (width >= 100) {
                clearInterval(interval);
                if (index + 1 < userStories.length) {
                    showStory(index + 1);
                } else {
                    closeStoryModal();
                }
            }
        }, 50);
        
        content.onclick = () => {
            clearInterval(interval);
            if (index + 1 < userStories.length) {
                showStory(index + 1);
            } else {
                closeStoryModal();
            }
        };
    }
    
    modal.classList.add('active');
    showStory(0);
}

function closeStoryModal() {
    const modal = document.getElementById('storyModal');
    if (modal) modal.classList.remove('active');
    const content = document.getElementById('storyContent');
    if (content) content.innerHTML = '';
}

// ========== CRÉATION POST ==========
function openCreateModal() {
    document.getElementById('createModal').classList.add('active');
}

function closeCreateModal() {
    document.getElementById('createModal').classList.remove('active');
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('previewContainer').style.display = 'none';
    document.getElementById('fileInput').value = '';
    document.getElementById('previewImage').src = '';
    document.getElementById('postCaption').value = '';
}

function publishPost() {
    const previewImage = document.getElementById('previewImage');
    const caption = document.getElementById('postCaption').value;
    
    if (!previewImage.src) {
        alert('Sélectionnez une photo d\'abord !');
        return;
    }
    
    const newPost = {
        id: Date.now(),
        userId: currentUser.id,
        username: currentUser.username,
        avatar: currentUser.avatar,
        avatarUrl: currentUser.avatarUrl,
        type: "photo",
        mediaUrl: previewImage.src,
        caption: caption || 'Nouvelle publication ! 🔥',
        likes: 0,
        liked: false,
        comments: [],
        timestamp: Date.now()
    };
    
    posts.unshift(newPost);
    savePosts();
    renderFeed();
    closeCreateModal();
}

// Setup upload
document.getElementById('selectFileBtn')?.addEventListener('click', () => {
    document.getElementById('fileInput').click();
});

document.getElementById('fileInput')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            document.getElementById('previewImage').src = event.target.result;
            document.getElementById('uploadArea').style.display = 'none';
            document.getElementById('previewContainer').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('publishBtn')?.addEventListener('click', publishPost);
document.getElementById('closeModalBtn')?.addEventListener('click', closeCreateModal);
document.getElementById('closeCommentsBtn')?.addEventListener('click', closeCommentsModal);

// ========== AUTRES FONCTIONS ==========
function viewMedia(mediaUrl) {
    window.open(mediaUrl, '_blank');
}

function sharePost(postId) {
    const post = posts.find(p => p.id === postId);
    if (post) {
        navigator.clipboard.writeText(post.mediaUrl);
        alert('🔗 Lien copié dans le presse-papier !');
    }
}

function savePost(postId) {
    alert('🔖 Post sauvegardé !');
}

function showLikers(postId) {
    alert(`❤️ Voir les likes du post #${postId}`);
}

function showPostOptions(postId) {
    if (confirm('Supprimer cette publication ?')) {
        posts = posts.filter(p => p.id !== postId);
        savePosts();
        renderFeed();
    }
}

function setupSuggestions() {
    const suggestions = [
        { username: "artiste_orange", avatar: "A", followers: "12k" },
        { username: "photographe", avatar: "P", followers: "8.5k" }
    ];
    
    const container = document.getElementById('suggestionsList');
    if (container) {
        container.innerHTML = suggestions.map(s => `
            <div class="suggestion-item" onclick="goToUserProfileByName('${s.username}')">
                <div class="suggestion-avatar">${s.avatar}</div>
                <div class="suggestion-info">
                    <div class="username">${s.username}</div>
                    <div class="followers">${s.followers} abonnés</div>
                </div>
                <button class="follow-btn" onclick="event.stopPropagation(); followUser('${s.username}')">Suivre</button>
            </div>
        `).join('');
    }
}

function followUser(username) {
    alert(`Vous suivez maintenant ${username} !`);
}

function goToProfile() {
    window.location.href = 'profil.html';
}

function goToUserProfile(userId) {
    if (userId === currentUser.id) {
        goToProfile();
    } else {
        alert(`👤 Profil de l'utilisateur #${userId}`);
    }
}

function goToUserProfileByName(username) {
    alert(`👤 Profil de ${username}`);
}

// ========== NAVIGATION ==========
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            if (page === 'profile') {
                window.location.href = 'profil.html';
            } else if (page === 'settings') {
                window.location.href = 'settings.html';
            } else if (page === 'create') {
                openCreateModal();
                item.classList.remove('active');
                document.querySelector('.nav-item[data-page="feed"]').classList.add('active');
            } else if (page === 'feed') {
                renderFeed();
                renderStories();
            } else {
                alert(`📱 Page ${page} - Bientôt disponible`);
            }
        });
    });
}

function setupModals() {
    const createModal = document.getElementById('createModal');
    const commentsModal = document.getElementById('commentsModal');
    
    createModal?.addEventListener('click', (e) => {
        if (e.target === createModal) closeCreateModal();
    });
    
    commentsModal?.addEventListener('click', (e) => {
        if (e.target === commentsModal) closeCommentsModal();
    });
}

// ========== UTILITAIRES ==========
function getTimeAgo(timestamp) {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return "À l'instant";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} heures`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} jours`;
    return new Date(timestamp).toLocaleDateString();
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Démarrer
init();
