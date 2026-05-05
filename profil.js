// ========== DONNÉES UTILISATEUR ==========
let currentUser = {
    id: 1,
    username: "floy_user",
    fullname: "Floy Creator",
    avatar: "F",
    bio: "Créateur de Floy 🔥 Passionné de design orange et noir",
    website: "floy.app",
    postsCount: 0,
    followers: 128,
    following: 94
};

// ========== POSTS DE L'UTILISATEUR ==========
let userPosts = [];

// ========== CHARGER LES DONNÉES DEPUIS LOCALSTORAGE ==========
function loadUserData() {
    const savedUser = localStorage.getItem('floy_user');
    if (savedUser) {
        const parsed = JSON.parse(savedUser);
        currentUser = { ...currentUser, ...parsed };
    }
    
    const savedPosts = localStorage.getItem('floy_user_posts');
    if (savedPosts) {
        userPosts = JSON.parse(savedPosts);
    } else {
        // Données de test
        userPosts = [
            {
                id: 1,
                imageUrl: "https://picsum.photos/400/400?random=1",
                likes: 124,
                comments: 8
            },
            {
                id: 2,
                imageUrl: "https://picsum.photos/400/400?random=2",
                likes: 89,
                comments: 5
            },
            {
                id: 3,
                imageUrl: "https://picsum.photos/400/400?random=3",
                likes: 234,
                comments: 12
            },
            {
                id: 4,
                imageUrl: "https://picsum.photos/400/400?random=4",
                likes: 56,
                comments: 3
            },
            {
                id: 5,
                imageUrl: "https://picsum.photos/400/400?random=5",
                likes: 78,
                comments: 7
            },
            {
                id: 6,
                imageUrl: "https://picsum.photos/400/400?random=6",
                likes: 145,
                comments: 15
            }
        ];
    }
    
    currentUser.postsCount = userPosts.length;
}

// ========== SAUVEGARDER LES DONNÉES ==========
function saveUserData() {
    localStorage.setItem('floy_user', JSON.stringify(currentUser));
    localStorage.setItem('floy_user_posts', JSON.stringify(userPosts));
}

// ========== AFFICHER LE PROFIL ==========
function loadProfile() {
    const container = document.getElementById('profileContent');
    document.getElementById('headerUsername').textContent = currentUser.username;
    
    container.innerHTML = `
        <div class="profile-info">
            <div class="profile-avatar-section">
                <div class="profile-avatar" onclick="openAvatarModal()">
                    <div class="profile-avatar-inner">${currentUser.avatar}</div>
                </div>
            </div>
            <div class="profile-details">
                <div class="profile-actions">
                    <div class="profile-name">${currentUser.username}</div>
                    <a href="edit-profil.html" class="edit-profile-btn">Modifier le profil</a>
                    <button class="settings-btn" onclick="goToSettings()">
                        <svg viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="2.5"/>
                            <path d="M18.37 7.29l1.06-1.06a1.5 1.5 0 0 0-2.12-2.12L15.7 6.12a7.5 7.5 0 0 0-7.4 0L6.69 4.11a1.5 1.5 0 1 0-2.12 2.12l1.06 1.06a7.5 7.5 0 0 0 0 7.4l-1.06 1.06a1.5 1.5 0 0 0 2.12 2.12l1.06-1.06a7.5 7.5 0 0 0 7.4 0l1.06 1.06a1.5 1.5 0 0 0 2.12-2.12l-1.06-1.06a7.5 7.5 0 0 0 0-7.4z"/>
                        </svg>
                    </button>
                </div>
                <div class="profile-stats">
                    <div class="stat">
                        <div class="stat-number">${currentUser.postsCount}</div>
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
                <div class="profile-bio">
                    <div class="bio-fullname">${escapeHtml(currentUser.fullname)}</div>
                    <div class="bio-text">${escapeHtml(currentUser.bio)}</div>
                    ${currentUser.website ? `<a href="https://${currentUser.website}" target="_blank" class="bio-link">🔗 ${currentUser.website}</a>` : ''}
                </div>
            </div>
        </div>

        <div class="profile-tabs">
            <div class="tab active" data-tab="posts">
                <svg viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7" rx="1"/>
                    <rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/>
                    <rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
                <span>PUBLICATIONS</span>
            </div>
            <div class="tab" data-tab="reels">
                <svg viewBox="0 0 24 24">
                    <path d="M2.5 5.5h19v13h-19z"/>
                    <path d="M9.5 8.5l6 3.5-6 3.5z"/>
                </svg>
                <span>REELS</span>
            </div>
            <div class="tab" data-tab="tagged">
                <svg viewBox="0 0 24 24">
                    <path d="M12 2.5a5.5 5.5 0 0 1 3.096 10.047 9.005 9.005 0 0 1 5.417 8.11.75.75 0 1 1-1.5.086 7.5 7.5 0 0 0-14.026 0 .75.75 0 1 1-1.5-.086 9.005 9.005 0 0 1 5.417-8.11A5.5 5.5 0 0 1 12 2.5ZM8 8a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z"/>
                </svg>
                <span>IDENTIFIES</span>
            </div>
        </div>

        <div class="posts-grid" id="postsGrid"></div>
        <div id="reelsGrid" style="display: none;" class="posts-grid"></div>
        <div id="taggedGrid" style="display: none;" class="posts-grid"></div>
    `;

    renderPostsGrid();
    setupTabs();
}

// ========== RENDU GRILLE POSTS ==========
function renderPostsGrid() {
    const grid = document.getElementById('postsGrid');
    if (!grid) return;
    
    if (userPosts.length === 0) {
        grid.innerHTML = `
            <div class="loader" style="grid-column: span 3;">
                <p>📸 Aucune publication</p>
                <p style="font-size: 12px; margin-top: 8px;">Partagez votre première photo !</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = userPosts.map(post => `
        <div class="post-item" onclick="viewPost(${post.id})">
            <img src="${post.imageUrl}" alt="Post">
            <div class="post-overlay">
                <div class="overlay-item">
                    <svg viewBox="0 0 24 24" fill="white">
                        <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938Z"/>
                    </svg>
                    ${post.likes}
                </div>
                <div class="overlay-item">
                    <svg viewBox="0 0 24 24" fill="white">
                        <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"/>
                    </svg>
                    ${post.comments}
                </div>
            </div>
        </div>
    `).join('');
}

// ========== TABS ==========
function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    const postsGrid = document.getElementById('postsGrid');
    const reelsGrid = document.getElementById('reelsGrid');
    const taggedGrid = document.getElementById('taggedGrid');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const tabName = tab.dataset.tab;
            
            postsGrid.style.display = 'none';
            reelsGrid.style.display = 'none';
            taggedGrid.style.display = 'none';

            if (tabName === 'posts') {
                postsGrid.style.display = 'grid';
                renderPostsGrid();
            } else if (tabName === 'reels') {
                reelsGrid.style.display = 'grid';
                reelsGrid.innerHTML = '<div class="loader" style="grid-column: span 3;">🎬 Reels - Bientôt disponible</div>';
            } else if (tabName === 'tagged') {
                taggedGrid.style.display = 'grid';
                taggedGrid.innerHTML = '<div class="loader" style="grid-column: span 3;">🏷️ Photos où vous êtes identifié - Bientôt</div>';
            }
        });
    });
}

// ========== AVATAR ==========
function openAvatarModal() {
    document.getElementById('avatarModal').classList.add('active');
}

function closeAvatarModal() {
    document.getElementById('avatarModal').classList.remove('active');
}

function changeAvatarByEmoji() {
    const emoji = prompt("Entrez un emoji pour votre avatar :", "😊");
    if (emoji && emoji.length >= 1) {
        currentUser.avatar = emoji;
        saveUserData();
        loadProfile();
    }
    closeAvatarModal();
}

function changeAvatarByLetter() {
    const letter = prompt("Entrez une lettre pour votre avatar :", currentUser.avatar);
    if (letter && letter.length === 1) {
        currentUser.avatar = letter.toUpperCase();
        saveUserData();
        loadProfile();
    }
    closeAvatarModal();
}

function removeAvatar() {
    currentUser.avatar = "👤";
    saveUserData();
    loadProfile();
    closeAvatarModal();
}

// ========== DROPDOWN MENU ==========
function toggleDropdown() {
    const menu = document.getElementById('dropdownMenu');
    menu.classList.toggle('show');
}

function goToSettings() {
    window.location.href = 'settings.html';
}

function logout() {
    localStorage.removeItem('floy_user');
    localStorage.removeItem('floy_user_posts');
    window.location.href = 'index.html';
}

// ========== NAVIGATION ==========
function goBack() {
    window.location.href = 'index.html';
}

function viewPost(postId) {
    alert(`📸 Voir le post #${postId} (fonctionnalité bientôt disponible)`);
}

// ========== UTILITAIRES ==========
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ========== INITIALISATION ==========
function init() {
    loadUserData();
    loadProfile();
    
    // Dropdown menu
    const menuBtn = document.getElementById('menuBtn');
    menuBtn.addEventListener('click', toggleDropdown);
    
    // Fermer dropdown en cliquant ailleurs
    document.addEventListener('click', (e) => {
        const menu = document.getElementById('dropdownMenu');
        if (!menuBtn.contains(e.target) && !menu.contains(e.target)) {
            menu.classList.remove('show');
        }
    });
}

init();
