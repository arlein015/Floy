// ========================
// MODULE UPLOAD - VERSION AMÉLIORÉE
// ========================

class UploadModule {
    constructor() {
        this.selectedFile = null;
        this.currentType = 'photo';
        this.compressionQuality = 0.8;
        this.maxImageSize = 20 * 1024 * 1024;
        this.maxVideoSize = 100 * 1024 * 1024;
    }

    openUploadModal() {
        const modalHtml = `
            <div id="uploadModal" class="modal-upload">
                <div class="modal-upload-content">
                    <div class="modal-upload-header">
                        <h3>Créer une nouvelle publication</h3>
                        <button onclick="this.closest('#uploadModal').remove()">×</button>
                    </div>
                    <div class="modal-upload-body">
                        <div class="upload-type-selector">
                            <button class="upload-type-btn active" onclick="uploadModule.selectType('photo')">📷 Photo</button>
                            <button class="upload-type-btn" onclick="uploadModule.selectType('video')">🎬 Vidéo</button>
                            <button class="upload-type-btn" onclick="uploadModule.selectType('carrousel')">🖼️ Carrousel</button>
                        </div>
                        
                        <div id="uploadArea" class="upload-area" onclick="document.getElementById('uploadFileInput').click()">
                            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M12 2.5a.75.75 0 0 1 .75.75v8h8a.75.75 0 0 1 0 1.5h-8v8a.75.75 0 0 1-1.5 0v-8h-8a.75.75 0 0 1 0-1.5h8v-8A.75.75 0 0 1 12 2.5Z"/>
                            </svg>
                            <p>Glissez une photo ou vidéo ici</p>
                            <button type="button">Parcourir</button>
                            <p class="upload-hint" id="uploadHint">JPG, PNG, MP4 jusqu'à 100MB</p>
                        </div>
                        
                        <div id="uploadPreview" style="display:none;">
                            <div class="preview-header">
                                <span>Aperçu</span>
                                <button class="preview-clear" onclick="uploadModule.clearPreview()">×</button>
                            </div>
                            <img id="previewImage" class="preview-media">
                            <video id="previewVideo" class="preview-media" controls></video>
                            <div class="caption-wrapper">
                                <textarea id="uploadCaption" placeholder="Écrivez une légende..." rows="3" maxlength="2200"></textarea>
                                <div class="caption-counter"><span id="charCount">0</span>/2200</div>
                            </div>
                            <div class="location-wrapper">
                                <input type="text" id="uploadLocation" placeholder="Ajouter un lieu">
                            </div>
                            <div class="advanced-options">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="disableComments"> Désactiver les commentaires
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" id="hideLikes"> Masquer le nombre de likes
                                </label>
                            </div>
                            <button id="publishBtn" class="publish-btn" onclick="uploadModule.publishPost()">Publier</button>
                        </div>
                        
                        <input type="file" id="uploadFileInput" accept="image/*,video/*" style="display:none;">
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.setupDragAndDrop();
        this.setupCharCounter();
    }

    selectType(type) {
        this.currentType = type;
        document.querySelectorAll('.upload-type-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.upload-type-btn[onclick="uploadModule.selectType('${type}')"]`).classList.add('active');
        
        const hint = document.getElementById('uploadHint');
        if (type === 'photo') hint.textContent = 'JPG, PNG, GIF, WEBP jusqu\'à 20MB';
        else if (type === 'video') hint.textContent = 'MP4, MOV, WEBM jusqu\'à 100MB';
        else hint.textContent = 'Sélectionnez plusieurs photos (max 10)';
        
        this.clearPreview();
    }

    setupDragAndDrop() {
        const area = document.getElementById('uploadArea');
        if (!area) return;
        
        area.ondragover = (e) => {
            e.preventDefault();
            area.classList.add('drag-over');
        };
        area.ondragleave = () => area.classList.remove('drag-over');
        area.ondrop = (e) => {
            e.preventDefault();
            area.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file) this.processFile(file);
        };
    }

    setupCharCounter() {
        const textarea = document.getElementById('uploadCaption');
        if (textarea) {
            textarea.oninput = () => {
                const count = textarea.value.length;
                document.getElementById('charCount').textContent = count;
                if (count > 2200) document.getElementById('charCount').style.color = '#ff4444';
                else document.getElementById('charCount').style.color = '#8e8e8e';
            };
        }
    }

    processFile(file) {
        const isValidImage = file.type.startsWith('image/');
        const isValidVideo = file.type.startsWith('video/');
        
        if (this.currentType === 'photo' && !isValidImage) {
            alert('Format d\'image non supporté');
            return;
        }
        if (this.currentType === 'video' && !isValidVideo) {
            alert('Format vidéo non supporté');
            return;
        }
        
        const maxSize = this.currentType === 'photo' ? this.maxImageSize : this.maxVideoSize;
        if (file.size > maxSize) {
            alert(`Fichier trop volumineux. Maximum ${maxSize / 1024 / 1024}MB`);
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            if (this.currentType === 'photo') {
                const img = document.getElementById('previewImage');
                img.src = e.target.result;
                img.style.display = 'block';
                document.getElementById('previewVideo').style.display = 'none';
            } else {
                const video = document.getElementById('previewVideo');
                video.src = e.target.result;
                video.style.display = 'block';
                document.getElementById('previewImage').style.display = 'none';
            }
            
            this.selectedFile = { file, dataUrl: e.target.result, type: this.currentType };
            document.getElementById('uploadArea').style.display = 'none';
            document.getElementById('uploadPreview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    clearPreview() {
        this.selectedFile = null;
        document.getElementById('uploadArea').style.display = 'block';
        document.getElementById('uploadPreview').style.display = 'none';
        document.getElementById('previewImage').style.display = 'none';
        document.getElementById('previewVideo').style.display = 'none';
        document.getElementById('uploadCaption').value = '';
        document.getElementById('uploadLocation').value = '';
        document.getElementById('charCount').textContent = '0';
    }

    async compressImage(file, maxWidth = 1080) {
        return new Promise((resolve) => {
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
                    canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => resolve(blob), file.type, this.compressionQuality);
                };
            };
        });
    }

    async publishPost() {
        if (!this.selectedFile) {
            alert('Sélectionnez un média d\'abord !');
            return;
        }
        
        const caption = document.getElementById('uploadCaption').value;
        const location = document.getElementById('uploadLocation').value;
        const disableComments = document.getElementById('disableComments')?.checked || false;
        const hideLikes = document.getElementById('hideLikes')?.checked || false;
        
        if (caption.length > 2200) {
            alert('La légende ne peut pas dépasser 2200 caractères');
            return;
        }
        
        let fileToUpload = this.selectedFile.file;
        if (this.currentType === 'photo') {
            fileToUpload = await this.compressImage(this.selectedFile.file);
        }
        
        const currentUser = this.getCurrentUser();
        const newPost = {
            id: Date.now(),
            userId: currentUser.id,
            username: currentUser.username,
            avatar: currentUser.avatar,
            type: this.currentType,
            mediaUrl: this.selectedFile.dataUrl,
            caption: caption || '',
            location: location || '',
            likes: 0,
            liked: false,
            comments: disableComments ? [] : [],
            commentsDisabled: disableComments,
            likesHidden: hideLikes,
            timestamp: Date.now()
        };
        
        const existingPosts = JSON.parse(localStorage.getItem('floy_posts') || '[]');
        existingPosts.unshift(newPost);
        localStorage.setItem('floy_posts', JSON.stringify(existingPosts));
        
        this.showSuccessToast();
        document.getElementById('uploadModal')?.remove();
        
        if (typeof renderFeed === 'function') renderFeed();
        
        window.dispatchEvent(new CustomEvent('floy-post-published', { detail: newPost }));
    }

    showSuccessToast() {
        const toast = document.createElement('div');
        toast.className = 'upload-toast';
        toast.innerHTML = '✅ Publication envoyée !';
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    getCurrentUser() {
        const saved = localStorage.getItem('floy_user');
        if (saved) return JSON.parse(saved);
        return { id: 1, username: "floy_user", avatar: "F" };
    }
}

const uploadModule = new UploadModule();
window.uploadModule = uploadModule;

// Styles
const uploadStyles = `
    .modal-upload { position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:3000;display:flex;align-items:center;justify-content:center; }
    .modal-upload-content { background:#000;border-radius:16px;width:550px;max-width:90%;max-height:90%;display:flex;flex-direction:column;border:1px solid #262626; }
    .modal-upload-header { padding:16px 20px;border-bottom:1px solid #262626;display:flex;justify-content:space-between; }
    .modal-upload-header button { background:none;border:none;color:#fff;font-size:24px;cursor:pointer; }
    .modal-upload-body { padding:20px;overflow-y:auto; }
    .upload-type-selector { display:flex;gap:12px;margin-bottom:20px; }
    .upload-type-btn { flex:1;background:#1a1a1a;border:1px solid #262626;padding:10px;border-radius:8px;color:#fff;cursor:pointer; }
    .upload-type-btn.active { background:#FF6B35;border-color:#FF6B35; }
    .upload-area { text-align:center;padding:40px;border:2px dashed #262626;border-radius:12px;cursor:pointer;transition:0.2s; }
    .upload-area.drag-over { border-color:#FF6B35;background:rgba(255,107,53,0.1); }
    .upload-area svg { color:#8e8e8e;margin-bottom:16px; }
    .upload-area p { color:#8e8e8e;margin-bottom:16px; }
    .upload-area button { background:#FF6B35;border:none;padding:8px 20px;border-radius:8px;color:#fff;cursor:pointer; }
    .upload-hint { font-size:12px;margin-top:12px; }
    .preview-header { display:flex;justify-content:space-between;margin-bottom:16px; }
    .preview-clear { background:none;border:none;color:#ff4444;font-size:20px;cursor:pointer; }
    .preview-media { max-width:100%;max-height:300px;border-radius:12px;margin-bottom:16px; }
    .caption-wrapper { margin-bottom:16px; }
    .caption-wrapper textarea { width:100%;background:#1a1a1a;border:1px solid #262626;border-radius:8px;padding:12px;color:#fff;resize:none;font-family:inherit; }
    .caption-counter { text-align:right;font-size:11px;color:#8e8e8e;margin-top:6px; }
    .location-wrapper { margin-bottom:16px; }
    .location-wrapper input { width:100%;background:#1a1a1a;border:1px solid #262626;border-radius:8px;padding:12px;color:#fff; }
    .advanced-options { margin-bottom:20px;display:flex;gap:20px; }
    .checkbox-label { display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer; }
    .publish-btn { width:100%;background:#FF6B35;border:none;padding:12px;border-radius:8px;color:#fff;font-weight:600;font-size:16px;cursor:pointer; }
    .upload-toast { position:fixed;bottom:100px;left:50%;transform:translateX(-50%) translateY(100px);background:#1a1a1a;color:#FF6B35;padding:12px 24px;border-radius:30px;z-index:4000;transition:0.3s;border:1px solid #FF6B35; }
    .upload-toast.show { transform:translateX(-50%) translateY(0); }
`;

if (!document.getElementById('upload-styles')) {
    const style = document.createElement('style');
    style.id = 'upload-styles';
    style.textContent = uploadStyles;
    document.head.appendChild(style);
}
