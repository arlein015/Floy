// ========================
// MODULE STORIES - FLOY
// Stories éphémères (24h) + affichage plein écran
// ========================

class StoriesModule {
    constructor() {
        this.stories = [];
        this.currentStoryIndex = 0;
        this.currentUserStories = [];
        this.interval = null;
        this.loadFromStorage();
        this.cleanExpiredStories();
        setInterval(() => this.cleanExpiredStories(), 60 * 60 * 1000); // Nettoyage toutes les heures
    }

    // ========== STOCKAGE ==========
    loadFromStorage() {
        const saved = localStorage.getItem('floy_stories');
        if (saved) {
            this.stories = JSON.parse(saved);
        }
    }

    saveToStorage() {
        localStorage.setItem('floy_stories', JSON.stringify(this.stories));
    }

    // ========== NETTOYAGE STORIES EXPIRÉES (24h) ==========
    cleanExpiredStories() {
        const now = Date.now();
        const before = this.stories.length;
        this.stories = this.stories.filter(s => now - s.timestamp < 24 * 60 * 60 * 1000);
        if (before !== this.stories.length) this.saveToStorage();
    }

    // ========== AJOUTER UNE STORY ==========
    addStory(file, type) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const currentUser = this.getCurrentUser();
                const newStory = {
                    id: Date.now(),
                    userId: currentUser.id,
                    username: currentUser.username,
                    avatar: currentUser.avatar,
                    avatarUrl: currentUser.avatarUrl,
                    type: type,
                    mediaUrl: e.target.result,
                    timestamp: Date.now(),
                    viewers: [],
                    reactions: []
                };
                this.stories.push(newStory);
                this.saveToStorage();
                resolve(newStory);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // ========== OUVERTURE MODAL CRÉATION STORY ==========
    openCreateStoryModal() {
        const modalHtml = `
            <div id="storyCreateModal" class="stories-modal">
                <div class="stories-modal-content" style="max-width: 400px;">
                    <div class="stories-modal-header">
                        <h3>Créer une story</h3>
                        <button onclick="this.closest('#storyCreateModal').remove()">×</button>
                    </div>
                    <div class="stories-modal-body">
                        <div class="story-upload-area" onclick="document.getElementById('storyFileInput').click()">
                            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M12 2.5a.75.75 0 0 1 .75.75v8h8a.75.75 0 0 1 0 1.5h-8v8a.75.75 0 0 1-1.5 0v-8h-8a.75.75 0 0 1 0-1.5h8v-8A.75.75 0 0 1 12 2.5Z"/>
                            </svg>
                            <p>Choisissez une photo ou vidéo</p>
                            <button>Parcourir</button>
                        </div>
                        <div id="storyPreview" style="display:none; margin-top: 20px;">
                            <img id="storyPreviewImg" style="max-width: 100%; border-radius: 12px;">
                            <video id="storyPreviewVideo" style="max-width: 100%; border-radius: 12px;" controls></video>
                            <button class="story-publish-btn" onclick="storiesModule.publishStory()">Publier la story</button>
                        </div>
                        <input type="file" id="storyFileInput" accept="image/*,video/*" style="display: none;">
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        document.getElementById('storyFileInput').onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    if (file.type.startsWith('image')) {
                        document.getElementById('storyPreviewImg').src = ev.target.result;
                        document.getElementById('storyPreviewImg').style.display = 'block';
                        document.getElementById('storyPreviewVideo').style.display = 'none';
                    } else {
                        document.getElementById('storyPreviewVideo').src = ev.target.result;
                        document.getElementById('storyPreviewVideo').style.display = 'block';
                        document.getElementById('storyPreviewImg').style.display = 'none';
                    }
                    document.querySelector('.story-upload-area').style.display = 'none';
                    document.getElementById('storyPreview').style.display = 'block';
                    this.selectedStoryFile = file;
                    this.selectedStoryType = file.type.startsWith('image') ? 'photo' : 'video';
                };
                reader.readAsDataURL(file);
            }
        };
    }

    async publishStory() {
        if (!this.selectedStoryFile) {
            alert("Sélectionnez un média");
            return;
        }
        await this.addStory(this.selectedStoryFile, this.selectedStoryType);
        document.getElementById('storyCreateModal')?.remove();
        this.renderStories();
        this.showToast("📸 Story publiée ! (disponible 24h)");
    }

    // ========== AFFICHAGE DES STORIES DANS LE FEED ==========
    renderStories(containerId = 'stories') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const currentUser = this.getCurrentUser();
        const userStories = this.stories.filter(s => s.userId === currentUser.id);
        const otherUsers = this.getUniqueUsersWithStories();

        let html = `
            <div class="story-item" onclick="storiesModule.openCreateStoryModal()">
                <div class="story-avatar create-story">
                    <div class="story-avatar-inner">
                        ${currentUser.avatarUrl ? `<img src="${currentUser.avatarUrl}">` : (currentUser.avatar || '📸')}
                    </div>
                    <div class="story-plus">+</div>
                </div>
                <div class="story-username">Votre story</div>
                ${userStories.length > 0 ? `<div class="story-badge">${userStories.length}</div>` : ''}
            </div>
        `;

        otherUsers.forEach(user => {
            const userStory = this.stories.find(s => s.userId === user.id);
            html += `
                <div class="story-item" onclick="storiesModule.viewUserStories(${user.id})">
                    <div class="story-avatar has-story">
                        <div class="story-avatar-inner">
                            ${user.avatarUrl ? `<img src="${user.avatarUrl}">` : (user.avatar || user.username.charAt(0))}
                        </div>
                    </div>
                    <div class="story-username">${user.username}</div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    getUniqueUsersWithStories() {
        const users = new Map();
        this.stories.forEach(story => {
            if (!users.has(story.userId)) {
                users.set(story.userId, {
                    id: story.userId,
                    username: story.username,
                    avatar: story.avatar,
                    avatarUrl: story.avatarUrl
                });
            }
        });
        return Array.from(users.values());
    }

    // ========== VISUALISATION DES STORIES (PLEIN ÉCRAN) ==========
    viewUserStories(userId) {
        this.currentUserStories = this.stories.filter(s => s.userId === userId).sort((a,b) => a.timestamp - b.timestamp);
        if (this.currentUserStories.length === 0) return;
        
        this.currentStoryIndex = 0;
        this.openStoryViewer();
    }

    openStoryViewer() {
        const modalHtml = `
            <div id="storyViewer" class="story-viewer-modal">
                <div class="story-viewer-content">
                    <div class="story-progress-container" id="storyProgressContainer"></div>
                    <button class="story-viewer-close" onclick="storiesModule.closeStoryViewer()">×</button>
                    <button class="story-nav prev" onclick="storiesModule.prevStory()">‹</button>
                    <button class="story-nav next" onclick="storiesModule.nextStory()">›</button>
                    <div id="storyViewerMedia" class="story-viewer-media"></div>
                    <div class="story-viewer-footer">
                        <div class="story-username-display"></div>
                        <div class="story-reaction-buttons">
                            <button onclick="storiesModule.sendReaction('❤️')">❤️</button>
                            <button onclick="storiesModule.sendReaction('😂')">😂</button>
                            <button onclick="storiesModule.sendReaction('😮')">😮</button>
                            <button onclick="storiesModule.sendReaction('😢')">😢</button>
                            <button onclick="storiesModule.sendReaction('🔥')">🔥</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.displayCurrentStory();
        this.startProgressTimer();
    }

    displayCurrentStory() {
        const story = this.currentUserStories[this.currentStoryIndex];
        if (!story) return;

        const mediaContainer = document.getElementById('storyViewerMedia');
        const usernameDisplay = document.querySelector('.story-username-display');
        
        usernameDisplay.textContent = story.username;
        
        if (story.type === 'photo') {
            mediaContainer.innerHTML = `<img src="${story.mediaUrl}" class="story-media">`;
        } else {
            mediaContainer.innerHTML = `<video src="${story.mediaUrl}" class="story-media" autoplay></video>`;
        }

        this.updateProgressBars();
    }

    updateProgressBars() {
        const container = document.getElementById('storyProgressContainer');
        if (!container) return;
        
        container.innerHTML = this.currentUserStories.map((_, index) => `
            <div class="story-progress-bar ${index < this.currentStoryIndex ? 'completed' : ''} ${index === this.currentStoryIndex ? 'active' : ''}" 
                 data-index="${index}">
                <div class="story-progress-fill" id="progressFill-${index}" style="width: ${index === this.currentStoryIndex ? '0%' : (index < this.currentStoryIndex ? '100%' : '0%')}"></div>
            </div>
        `).join('');
    }

    startProgressTimer() {
        if (this.interval) clearInterval(this.interval);
        
        let progress = 0;
        const fill = document.getElementById(`progressFill-${this.currentStoryIndex}`);
        if (!fill) return;
        
        this.interval = setInterval(() => {
            progress += 2;
            fill.style.width = progress + '%';
            if (progress >= 100) {
                clearInterval(this.interval);
                this.nextStory();
            }
        }, 50);
    }

    nextStory() {
        if (this.currentStoryIndex + 1 < this.currentUserStories.length) {
            this.currentStoryIndex++;
            this.displayCurrentStory();
            this.startProgressTimer();
        } else {
            this.closeStoryViewer();
        }
    }

    prevStory() {
        if (this.currentStoryIndex > 0) {
            this.currentStoryIndex--;
            this.displayCurrentStory();
            this.startProgressTimer();
        }
    }

    sendReaction(emoji) {
        const story = this.currentUserStories[this.currentStoryIndex];
        if (story) {
            const currentUser = this.getCurrentUser();
            story.reactions = story.reactions || [];
            story.reactions.push({ userId: currentUser.id, emoji: emoji, timestamp: Date.now() });
            this.saveToStorage();
            this.showToast(`${emoji} Réaction envoyée !`);
        }
    }

    closeStoryViewer() {
        if (this.interval) clearInterval(this.interval);
        document.getElementById('storyViewer')?.remove();
    }

    // ========== UTILITAIRES ==========
    getCurrentUser() {
        const saved = localStorage.getItem('floy_user');
        if (saved) return JSON.parse(saved);
        return { id: 1, username: "floy_user", avatar: "F" };
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'stories-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
}

const storiesModule = new StoriesModule();
window.storiesModule = storiesModule;

// ========== STYLES CSS ==========
const storiesStyles = `
    .story-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        position: relative;
    }
    .story-avatar {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
    }
    .story-avatar.has-story {
        background: linear-gradient(45deg, #FF6B35, #FF9F5C, #FF6B35);
        padding: 2px;
    }
    .story-avatar-inner {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: #000;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        overflow: hidden;
    }
    .story-avatar-inner img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    .story-avatar.create-story {
        background: #1a1a1a;
        border: 2px solid #262626;
    }
    .story-plus {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 22px;
        height: 22px;
        background: #FF6B35;
        border-radius: 50%;
        color: white;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #000;
    }
    .story-username {
        font-size: 12px;
        color: #8e8e8e;
    }
    .story-badge {
        position: absolute;
        top: -5px;
        right: -5px;
        background: #FF6B35;
        color: white;
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 10px;
    }
    
    /* Story Viewer */
    .story-viewer-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #000;
        z-index: 5000;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .story-viewer-content {
        width: 100%;
        max-width: 450px;
        height: 100%;
        position: relative;
        display: flex;
        flex-direction: column;
    }
    .story-progress-container {
        display: flex;
        gap: 4px;
        padding: 12px;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        z-index: 10;
    }
    .story-progress-bar {
        flex: 1;
        height: 3px;
        background: rgba(255,255,255,0.3);
        border-radius: 3px;
        overflow: hidden;
    }
    .story-progress-fill {
        height: 100%;
        width: 0%;
        background: white;
        transition: width 0.05s linear;
    }
    .story-progress-bar.completed .story-progress-fill {
        width: 100%;
        background: white;
    }
    .story-viewer-close {
        position: absolute;
        top: 20px;
        right: 20px;
        background: none;
        border: none;
        color: white;
        font-size: 30px;
        cursor: pointer;
        z-index: 20;
    }
    .story-nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(0,0,0,0.5);
        border: none;
        color: white;
        font-size: 40px;
        cursor: pointer;
        padding: 20px 10px;
        z-index: 20;
    }
    .story-nav.prev { left: 0; }
    .story-nav.next { right: 0; }
    .story-viewer-media {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .story-media {
        max-width: 100%;
        max-height: 80vh;
        border-radius: 16px;
    }
    .story-viewer-footer {
        padding: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .story-username-display {
        font-weight: 600;
        color: white;
    }
    .story-reaction-buttons {
        display: flex;
        gap: 12px;
    }
    .story-reaction-buttons button {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        transition: transform 0.2s;
    }
    .story-reaction-buttons button:hover {
        transform: scale(1.2);
    }
    
    /* Modal création story */
    .stories-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 4000;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .stories-modal-content {
        background: #000;
        border-radius: 16px;
        width: 400px;
        max-width: 90%;
        border: 1px solid #262626;
    }
    .stories-modal-header {
        padding: 16px;
        border-bottom: 1px solid #262626;
        display: flex;
        justify-content: space-between;
    }
    .stories-modal-header button {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
    }
    .stories-modal-body {
        padding: 20px;
    }
    .story-upload-area {
        text-align: center;
        padding: 40px;
        border: 2px dashed #262626;
        border-radius: 12px;
        cursor: pointer;
    }
    .story-upload-area svg {
        color: #8e8e8e;
        margin-bottom: 16px;
    }
    .story-upload-area button {
        background: #FF6B35;
        border: none;
        padding: 8px 20px;
        border-radius: 8px;
        color: white;
        cursor: pointer;
        margin-top: 12px;
    }
    .story-publish-btn {
        width: 100%;
        background: #FF6B35;
        border: none;
        padding: 12px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        margin-top: 16px;
        cursor: pointer;
    }
    .stories-toast {
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: #1a1a1a;
        color: #FF6B35;
        padding: 12px 24px;
        border-radius: 30px;
        z-index: 6000;
        transition: 0.3s;
        border: 1px solid #FF6B35;
    }
    .stories-toast.show {
        transform: translateX(-50%) translateY(0);
    }
`;

if (!document.getElementById('stories-module-styles')) {
    const style = document.createElement('style');
    style.id = 'stories-module-styles';
    style.textContent = storiesStyles;
    document.head.appendChild(style);
}
