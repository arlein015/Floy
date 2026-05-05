// ========================
// MODULE UPLOAD - FLOY (CORRIGÉ)
// Upload photo et vidéo
// ========================

class UploadModule {
    constructor() {
        this.selectedFile = null;
        this.selectedType = 'photo';
    }

    openUploadModal() {
        const modalHtml = `
            <div id="uploadModal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:5000;display:flex;align-items:center;justify-content:center;">
                <div style="background:#000;border-radius:16px;width:500px;max-width:90%;border:1px solid #262626;">
                    <div style="padding:16px;border-bottom:1px solid #262626;display:flex;justify-content:space-between;">
                        <h3 style="color:#fff;">Créer une publication</h3>
                        <button onclick="this.closest('#uploadModal').remove()" style="background:none;border:none;color:#fff;font-size:24px;cursor:pointer;">×</button>
                    </div>
                    <div style="padding:20px;">
                        <div style="display:flex;gap:12px;margin-bottom:20px;">
                            <button onclick="uploadModule.selectType('photo')" id="photoTypeBtn" style="flex:1;background:#FF6B35;border:none;padding:10px;border-radius:8px;color:#fff;cursor:pointer;">📷 Photo</button>
                            <button onclick="uploadModule.selectType('video')" id="videoTypeBtn" style="flex:1;background:#1a1a1a;border:1px solid #262626;padding:10px;border-radius:8px;color:#fff;cursor:pointer;">🎬 Vidéo</button>
                        </div>
                        <div id="uploadArea" style="text-align:center;padding:40px;border:2px dashed #262626;border-radius:12px;cursor:pointer;" onclick="document.getElementById('fileInput').click()">
                            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="color:#8e8e8e;margin-bottom:16px;">
                                <path d="M12 2.5a.75.75 0 0 1 .75.75v8h8a.75.75 0 0 1 0 1.5h-8v8a.75.75 0 0 1-1.5 0v-8h-8a.75.75 0 0 1 0-1.5h8v-8A.75.75 0 0 1 12 2.5Z"/>
                            </svg>
                            <p style="color:#8e8e8e;margin-bottom:16px;">Sélectionnez une ${this.selectedType === 'photo' ? 'photo' : 'vidéo'}</p>
                            <button style="background:#FF6B35;border:none;padding:8px 20px;border-radius:8px;color:#fff;cursor:pointer;">Parcourir</button>
                        </div>
                        <div id="previewArea" style="display:none;margin-top:20px;">
                            <img id="previewImage" style="max-width:100%;max-height:250px;border-radius:12px;display:none;">
                            <video id="previewVideo" style="max-width:100%;max-height:250px;border-radius:12px;display:none;" controls></video>
                            <textarea id="captionInput" placeholder="Écrivez une légende..." style="width:100%;background:#1a1a1a;border:1px solid #262626;border-radius:8px;padding:12px;color:#fff;margin-top:12px;resize:none;" rows="3"></textarea>
                            <button onclick="uploadModule.publishPost()" style="width:100%;background:#FF6B35;border:none;padding:12px;border-radius:8px;color:#fff;font-weight:600;margin-top:12px;cursor:pointer;">Publier</button>
                            <button onclick="uploadModule.clearPreview()" style="width:100%;background:#1a1a1a;border:1px solid #262626;padding:12px;border-radius:8px;color:#fff;margin-top:8px;cursor:pointer;">Annuler</button>
                        </div>
                        <input type="file" id="fileInput" accept="${this.selectedType === 'photo' ? 'image/*' : 'video/*'}" style="display:none;">
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        document.getElementById('fileInput').onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    if (this.selectedType === 'photo') {
                        document.getElementById('previewImage').src = ev.target.result;
                        document.getElementById('previewImage').style.display = 'block';
                        document.getElementById('previewVideo').style.display = 'none';
                    } else {
                        document.getElementById('previewVideo').src = ev.target.result;
                        document.getElementById('previewVideo').style.display = 'block';
                        document.getElementById('previewImage').style.display = 'none';
                    }
                    this.selectedFile = { file, dataUrl: ev.target.result, type: this.selectedType };
                    document.getElementById('uploadArea').style.display = 'none';
                    document.getElementById('previewArea').style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        };
    }

    selectType(type) {
        this.selectedType = type;
        const photoBtn = document.getElementById('photoTypeBtn');
        const videoBtn = document.getElementById('videoTypeBtn');
        const fileInput = document.getElementById('fileInput');
        
        if (type === 'photo') {
            photoBtn.style.background = '#FF6B35';
            photoBtn.style.border = 'none';
            videoBtn.style.background = '#1a1a1a';
            videoBtn.style.border = '1px solid #262626';
            if (fileInput) fileInput.accept = 'image/*';
        } else {
            videoBtn.style.background = '#FF6B35';
            videoBtn.style.border = 'none';
            photoBtn.style.background = '#1a1a1a';
            photoBtn.style.border = '1px solid #262626';
            if (fileInput) fileInput.accept = 'video/*';
        }
        
        const uploadText = document.querySelector('#uploadArea p');
        if (uploadText) uploadText.textContent = `Sélectionnez une ${type === 'photo' ? 'photo' : 'vidéo'}`;
    }

    clearPreview() {
        this.selectedFile = null;
        document.getElementById('uploadArea').style.display = 'block';
        document.getElementById('previewArea').style.display = 'none';
        document.getElementById('previewImage').style.display = 'none';
        document.getElementById('previewVideo').style.display = 'none';
        document.getElementById('captionInput').value = '';
        document.getElementById('fileInput').value = '';
    }

    publishPost() {
        if (!this.selectedFile) {
            alert("Sélectionnez un média d'abord !");
            return;
        }
        
        const caption = document.getElementById('captionInput').value;
        const savedUser = localStorage.getItem('floy_user');
        const currentUser = savedUser ? JSON.parse(savedUser) : { id: 1, username: "floy_user", avatar: "F" };
        
        const newPost = {
            id: Date.now(),
            userId: currentUser.id,
            username: currentUser.username,
            avatar: currentUser.avatar,
            type: this.selectedType,
            mediaUrl: this.selectedFile.dataUrl,
            caption: caption || '',
            likes: 0,
            liked: false,
            comments: [],
            timestamp: Date.now()
        };
        
        const existingPosts = JSON.parse(localStorage.getItem('floy_posts') || '[]');
        existingPosts.unshift(newPost);
        localStorage.setItem('floy_posts', JSON.stringify(existingPosts));
        
        document.getElementById('uploadModal')?.remove();
        alert("✅ Publication envoyée !");
        
        if (typeof window.renderFeed === 'function') window.renderFeed();
    }
}

const uploadModule = new UploadModule();
window.uploadModule = uploadModule;
