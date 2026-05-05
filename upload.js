// ========================
// MODULE UPLOAD - FLOY
// ========================
// Upload de photos et vidéos avec prévisualisation

class UploadModule {
    constructor() {
        this.uploadQueue = [];
        this.isUploading = false;
        this.supportedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic'];
        this.supportedVideoTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/ogg'];
        this.maxImageSize = 20 * 1024 * 1024; // 20MB
        this.maxVideoSize = 100 * 1024 * 1024; // 100MB
        this.loadFromStorage();
    }

    // ========== STOCKAGE ==========
    loadFromStorage() {
        const saved = localStorage.getItem('floy_upload_posts');
        if (saved) {
            this.userPosts = JSON.parse(saved);
        } else {
            this.userPosts = [];
        }
    }

    saveToStorage() {
        localStorage.setItem('floy_upload_posts', JSON.stringify(this.userPosts));
    }

    // ========== OUVERTURE MODAL UPLOAD ==========
    openUploadModal() {
        const modalHtml = `
            <div id="uploadModal" class="floy-upload-modal">
                <div class="floy-upload-modal-content">
                    <div class="floy-upload-modal-header">
                        <h3>Créer une nouvelle publication</h3>
                        <button class="floy-upload-modal-close" onclick="this.closest('#uploadModal').remove()">&times;</button>
                    </div>
                    <div class="floy-upload-modal-body">
                        <div class="floy-upload-type-selector">
                            <button class="floy-upload-type-btn active" data-type="photo" onclick="uploadModule.selectType('photo')">
                                📷 Photo
                            </button>
                            <button class="floy-upload-type-btn" data-type="video" onclick="uploadModule.selectType('video')">
                                🎬 Vidéo
                            </button>
                        </div>
                        
                        <div id="floyUploadArea" class="floy-upload-area" onclick="document.getElementById('floyFileInput').click()">
                            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M12 2.5a.75.75 0 0 1 .75.75v8h8a.75.75 0 0 1 0 1.5h-8v8a.75.75 0 0 1-1.5 0v-8h-8a.75.75 0 0 1 0-1.5h8v-8A.75.75 0 0 1 12 2.5Z"/>
                            </svg>
                            <p id="floyUploadText">Glissez une photo ou vidéo ici</p>
                            <button type="button">Sélectionner depuis l'ordinateur</button>
                            <p id="floyUploadHint" class="floy-upload-hint">JPG, PNG, GIF, MP4 jusqu'à ${this.maxVideoSize / 1024 / 1024}MB</p>
                        </div>
                        
                        <div id="floyPreviewContainer" class="floy-preview-container" style="display: none;">
                            <div class="floy-preview-header">
                                <span>Aperçu</span>
                                <button class="floy-preview-clear" onclick="uploadModule.clearPreview()">×</button>
                            </div>
                            <img id="floyPreviewImage" class="floy-preview-media" style="display: none;">
                            <video id="floyPreviewVideo" class="floy-preview-media" controls style="display: none;"></video>
                            <div class="floy-caption-container">
                                <textarea id="floyPostCaption" class="floy-caption-input" placeholder="Écrivez une légende..." rows="3"></textarea>
                                <div class="floy-caption-counter">
                                    <span id="floyCharCount">0</span>/2200
                                </div>
                            </div>
                            <div class="floy-location-container">
                                <input type="text" id="floyPostLocation" class="floy-location-input" placeholder="Ajouter un lieu">
                            </div>
                            <button id="floyPublishBtn" class="floy-publish-btn" onclick="uploadModule.publishPost()">
                                Publier
                            </button>
                        </div>
                        
                        <input type="file" id="floyFileInput" accept="image/*,video/*" style="display: none;">
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.currentType = 'photo';
        this.setupEventListeners();
    }

    // ========== SÉLECTION DU TYPE ==========
    selectType(type) {
        this.currentType = type;
        document.querySelectorAll('.floy-upload-type-btn').forEach(btn => {
            if (btn.dataset.type === type) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        const hintText = type === 'photo' 
            ? 'JPG, PNG, GIF, WEBP jusqu\'à 20MB' 
            : 'MP4, MOV, WEBM jusqu\'à 100MB';
        document.getElementById('floyUploadHint').textContent = hintText;
        
        // Réinitialiser l'affichage
        this.clearPreview();
    }

    // ========== CONFIGURATION ÉVÉNEMENTS ==========
    setupEventListeners() {
        const fileInput = document.getElementById('floyFileInput');
        if (fileInput) {
            fileInput.onchange = (e) => this.handleFileSelect(e);
        }

        const captionInput = document.getElementById('floyPostCaption');
        if (captionInput) {
            captionInput.oninput = () => this.updateCharCount();
        }

        // Drag & Drop
        const uploadArea = document.getElementById('floyUploadArea');
        if (uploadArea) {
            uploadArea.ondragover = (e) => {
                e.preventDefault();
                uploadArea.classList.add('drag-over');
            };
            uploadArea.ondragleave = () => {
                uploadArea.classList.remove('drag-over');
            };
            uploadArea.ondrop = (e) => {
                e.preventDefault();
                uploadArea.classList.remove('drag-over');
                const file = e.dataTransfer.files[0];
                if (file) this.processFile(file);
            };
        }

        // Fermer modal
        const modal = document.getElementById('uploadModal');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // ========== GESTION FICHIER ==========
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    processFile(file) {
        // Vérification du type
        const isValidImage = this.supportedImageTypes.includes(file.type);
        const isValidVideo = this.supportedVideoTypes.includes(file.type);
        
        if (this.currentType === 'photo' && !isValidImage) {
            alert('Format d\'image non supporté. Utilisez JPG, PNG, GIF ou WEBP.');
            return;
        }
        
        if (this.currentType === 'video' && !isValidVideo) {
            alert('Format vidéo non supporté. Utilisez MP4, MOV ou WEBM.');
            return;
        }
        
        // Vérification taille
        const maxSize = this.currentType === 'photo' ? this.maxImageSize : this.maxVideoSize;
        if (file.size > maxSize) {
            const sizeMB = maxSize / 1024 / 1024;
            alert(`Fichier trop volumineux. Maximum ${sizeMB}MB.`);
            return;
        }
        
        // Création preview
        const reader = new FileReader();
        reader.onload = (e) => {
            if (this.currentType === 'photo') {
                const img = document.getElementById('floyPreviewImage');
                img.src = e.target.result;
                img.style.display = 'block';
                document.getElementById('floyPreviewVideo').style.display = 'none';
            } else {
                const video = document.getElementById('floyPreviewVideo');
                video.src = e.target.result;
                video.style.display = 'block';
                document.getElementById('floyPreviewImage').style.display = 'none';
            }
            
            this.selectedFile = {
                file: file,
                dataUrl: e.target.result,
                type: this.currentType,
                name: file.name,
                size: file.size
            };
            
            document.getElementById('floyUploadArea').style.display = 'none';
            document.getElementById('floyPreviewContainer').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    clearPreview() {
        this.selectedFile = null;
        document.getElementById('floyUploadArea').style.display = 'block';
        document.getElementById('floyPreviewContainer').style.display = 'none';
        document.getElementById('floyPreviewImage').style.display = 'none';
        document.getElementById('floyPreviewVideo').style.display = 'none';
        document.getElementById('floyPreviewImage').src = '';
        document.getElementById('floyPreviewVideo').src = '';
        document.getElementById('floyPostCaption').value = '';
        document.getElementById('floyPostLocation').value = '';
        this.updateCharCount();
    }

    // ========== COMPTEUR CARACTÈRES ==========
    updateCharCount() {
        const caption = document.getElementById('floyPostCaption');
        const count = caption.value.length;
        const counter = document.getElementById('floyCharCount');
        if (counter) {
            counter.textContent = count;
            if (count > 2200) {
                counter.style.color = '#ff4444';
            } else {
                counter.style.color = '#8e8e8e';
            }
        }
    }

    // ========== PUBLICATION ==========
    publishPost() {
        if (!this.selectedFile) {
            alert('Sélectionnez un média d\'abord !');
            return;
        }
        
        const caption = document.getElementById('floyPostCaption').value;
        const location = document.getElementById('floyPostLocation').value;
        
        if (caption.length > 2200) {
            alert('La légende ne peut pas dépasser 2200 caractères.');
            return;
        }
        
        const currentUser = this.getCurrentUser();
        
        const newPost = {
            id: Date.now(),
            userId: currentUser.id,
            username: currentUser.username,
            avatar: currentUser.avatar || currentUser.username.charAt(0).toUpperCase(),
            avatarUrl: currentUser.avatarUrl || null,
            type: this.selectedFile.type,
            mediaUrl: this.selectedFile.dataUrl,
            caption: caption || '',
            location: location || '',
            likes: 0,
            liked: false,
            comments: [],
            timestamp: Date.now(),
            shareCount: 0
        };
        
        // Sauvegarder dans localStorage
        const existingPosts = JSON.parse(localStorage.getItem('floy_posts') || '[]');
        existingPosts.unshift(newPost);
        localStorage.setItem('floy_posts', JSON.stringify(existingPosts));
        
        // Ajouter aux posts de l'utilisateur
        this.userPosts.unshift(newPost);
        this.saveToStorage();
        
        // Notification
        this.showUploadSuccess();
        
        // Fermer modal
        document.getElementById('uploadModal').remove();
        
        // Rafraîchir le feed si la fonction existe
        if (typeof renderFeed === 'function') {
            renderFeed();
        }
        
        // Déclencher événement
        window.dispatchEvent(new CustomEvent('floy-post-published', { detail: newPost }));
    }

    // ========== UPLOAD VERS SERVEUR (optionnel) ==========
    async uploadToServer(file, progressCallback) {
        // Simulation d'upload (à remplacer par vrai appel API)
        return new Promise((resolve) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                if (progressCallback) progressCallback(progress);
                if (progress >= 100) {
                    clearInterval(interval);
                    resolve({ success: true, url: URL.createObjectURL(file) });
                }
            }, 200);
        });
    }

    // ========== OPTIMISATION IMAGE ==========
    compressImage(file, maxWidth = 1080, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    canvas.toBlob((blob) => {
                        resolve(blob);
                    }, file.type, quality);
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    }

    // ========== UPLOAD MULTIPLE ==========
    addToQueue(file, type) {
        this.uploadQueue.push({ file, type, status: 'pending' });
        this.processQueue();
    }

    async processQueue() {
        if (this.isUploading || this.uploadQueue.length === 0) return;
        
        this.isUploading = true;
        const item = this.uploadQueue[0];
        
        try {
            item.status = 'uploading';
            this.showQueueProgress();
            
            let fileToUpload = item.file;
            if (item.type === 'photo') {
                fileToUpload = await this.compressImage(item.file);
            }
            
            const result = await this.uploadToServer(fileToUpload, (progress) => {
                item.progress = progress;
                this.showQueueProgress();
            });
            
            item.status = 'completed';
            this.uploadQueue.shift();
            
            // Créer le post
            const currentUser = this.getCurrentUser();
            const newPost = {
                id: Date.now(),
                userId: currentUser.id,
                username: currentUser.username,
                avatar: currentUser.avatar,
                type: item.type,
                mediaUrl: result.url,
                caption: '',
                likes: 0,
                comments: [],
                timestamp: Date.now()
            };
            
            const existingPosts = JSON.parse(localStorage.getItem('floy_posts') || '[]');
            existingPosts.unshift(newPost);
            localStorage.setItem('floy_posts', JSON.stringify(existingPosts));
            
        } catch (error) {
            item.status = 'failed';
            console.error('Upload failed:', error);
        }
        
        this.isUploading = false;
        this.processQueue();
    }

    showQueueProgress() {
        const queueModal = document.getElementById('floyQueueModal');
        if (!queueModal) {
            this.createQueueModal();
        }
        // Mettre à jour l'affichage
    }

    createQueueModal() {
        const modalHtml = `
            <div id="floyQueueModal" class="floy-upload-modal">
                <div class="floy-upload-modal-content" style="max-width: 400px;">
                    <div class="floy-upload-modal-header">
                        <h3>Téléchargement en cours</h3>
                    </div>
                    <div class="floy-upload-modal-body">
                        <div id="floyQueueList"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    // ========== NOTIFICATION SUCCÈS ==========
    showUploadSuccess() {
        const toast = document.createElement('div');
        toast.className = 'floy-upload-toast';
        toast.innerHTML = '✅ Publication envoyée !';
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ========== UTILITAIRES ==========
    getCurrentUser() {
        const savedUser = localStorage.getItem('floy_user');
        if (savedUser) {
            return JSON.parse(savedUser);
        }
        return { id: 1, username: "floy_user", avatar: "F" };
    }

    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
}

// ========== STYLES CSS ==========
const uploadStyles = `
    /* Module Upload - Styles */
    .floy-upload-modal {
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
    
    .floy-upload-modal-content {
        background: #000000;
        border-radius: 16px;
        width: 550px;
        max-width: 90%;
        max-height: 90%;
        display: flex;
        flex-direction: column;
        border: 1px solid #262626;
    }
    
    .floy-upload-modal-header {
        padding: 16px 20px;
        border-bottom: 1px solid #262626;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .floy-upload-modal-header h3 {
        font-size: 18px;
        color: #ffffff;
    }
    
    .floy-upload-modal-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
    }
    
    .floy-upload-modal-body {
        padding: 20px;
        overflow-y: auto;
    }
    
    /* Type selector */
    .floy-upload-type-selector {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
    }
    
    .floy-upload-type-btn {
        flex: 1;
        background: #1a1a1a;
        border: 1px solid #262626;
        padding: 10px;
        border-radius: 8px;
        color: white;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .floy-upload-type-btn.active {
        background: #FF6B35;
        border-color: #FF6B35;
    }
    
    /* Upload area */
    .floy-upload-area {
        text-align: center;
        padding: 50px 20px;
        border: 2px dashed #262626;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .floy-upload-area.drag-over {
        border-color: #FF6B35;
        background: rgba(255,107,53,0.1);
    }
    
    .floy-upload-area svg {
        color: #8e8e8e;
        margin-bottom: 16px;
    }
    
    .floy-upload-area p {
        color: #8e8e8e;
        margin-bottom: 16px;
    }
    
    .floy-upload-area button {
        background: #FF6B35;
        border: none;
        padding: 8px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        cursor: pointer;
    }
    
    .floy-upload-hint {
        font-size: 12px;
        margin-top: 12px;
    }
    
    /* Preview */
    .floy-preview-container {
        text-align: center;
    }
    
    .floy-preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 1px solid #262626;
    }
    
    .floy-preview-clear {
        background: none;
        border: none;
        color: #ff4444;
        font-size: 20px;
        cursor: pointer;
    }
    
    .floy-preview-media {
        max-width: 100%;
        max-height: 350px;
        border-radius: 12px;
        margin-bottom: 16px;
    }
    
    .floy-caption-container {
        margin-bottom: 16px;
    }
    
    .floy-caption-input {
        width: 100%;
        background: #1a1a1a;
        border: 1px solid #262626;
        border-radius: 8px;
        padding: 12px;
        color: white;
        font-size: 14px;
        resize: none;
        font-family: inherit;
    }
    
    .floy-caption-input:focus {
        border-color: #FF6B35;
        outline: none;
    }
    
    .floy-caption-counter {
        text-align: right;
        font-size: 11px;
        color: #8e8e8e;
        margin-top: 6px;
    }
    
    .floy-location-container {
        margin-bottom: 20px;
    }
    
    .floy-location-input {
        width: 100%;
        background: #1a1a1a;
        border: 1px solid #262626;
        border-radius: 8px;
        padding: 12px;
        color: white;
        font-size: 14px;
    }
    
    .floy-location-input:focus {
        border-color: #FF6B35;
        outline: none;
    }
    
    .floy-publish-btn {
        width: 100%;
        background: #FF6B35;
        border: none;
        padding: 12px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        font-size: 16px;
        cursor: pointer;
        transition: opacity 0.2s;
    }
    
    .floy-publish-btn:hover {
        opacity: 0.9;
    }
    
    /* Toast succès */
    .floy-upload-toast {
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: #1a1a1a;
        color: #FF6B35;
        padding: 12px 24px;
        border-radius: 30px;
        font-size: 14px;
        font-weight: 600;
        z-index: 3000;
        transition: transform 0.3s;
        border: 1px solid #FF6B35;
    }
    
    .floy-upload-toast.show {
        transform: translateX(-50%) translateY(0);
    }
`;

// Ajouter les styles
if (!document.getElementById('upload-module-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'upload-module-styles';
    styleSheet.textContent = uploadStyles;
    document.head.appendChild(styleSheet);
}

// ========== EXPORT ==========
const uploadModule = new UploadModule();
window.uploadModule = uploadModule;

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    console.log("📸 Module Upload chargé (photo et vidéo)");
});
