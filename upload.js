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
            textarea.oninput = () =>
