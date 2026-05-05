// ========================
// MODULE PARTAGE - FLOY
// ========================
// Gestion du partage (copier lien, partager sur réseaux, exporter)

class PartageModule {
    constructor() {
        this.shareStats = new Map(); // statistiques de partage par post
        this.loadFromStorage();
    }

    // ========== STOCKAGE ==========
    loadFromStorage() {
        const saved = localStorage.getItem('floy_partage_stats');
        if (saved) {
            const parsed = JSON.parse(saved);
            for (let [key, value] of Object.entries(parsed)) {
                this.shareStats.set(parseInt(key), value);
            }
        }
    }

    saveToStorage() {
        const obj = {};
        for (let [key, value] of this.shareStats.entries()) {
            obj[key] = value;
        }
        localStorage.setItem('floy_partage_stats', JSON.stringify(obj));
    }

    // ========== ENREGISTRER UN PARTAGE ==========
    recordShare(postId, method) {
        let stats = this.shareStats.get(postId) || { count: 0, methods: {} };
        stats.count++;
        stats.methods[method] = (stats.methods[method] || 0) + 1;
        this.shareStats.set(postId, stats);
        this.saveToStorage();
        return stats;
    }

    getShareCount(postId) {
        const stats = this.shareStats.get(postId);
        return stats ? stats.count : 0;
    }

    // ========== PARTAGER (MODAL PRINCIPAL) ==========
    showShareModal(postId, postData = {}) {
        const { title = "Regarde ce post sur Floy !", imageUrl = "", username = "" } = postData;
        
        const modalHtml = `
            <div id="shareModal" class="floy-share-modal">
                <div class="floy-share-modal-content">
                    <div class="floy-share-modal-header">
                        <h3>Partager</h3>
                        <button class="floy-share-modal-close" onclick="this.closest('.floy-share-modal').remove()">&times;</button>
                    </div>
                    <div class="floy-share-modal-body">
                        <div class="floy-share-preview">
                            ${imageUrl ? `<img src="${imageUrl}" class="floy-share-preview-img">` : ''}
                            <div class="floy-share-preview-text">
                                <strong>${username || "Floy"}</strong>
                                <p>${title}</p>
                            </div>
                        </div>
                        
                        <div class="floy-share-options">
                            <div class="floy-share-option" onclick="partageModule.copyToClipboard(${postId}, '${this.escapeHtml(title)}')">
                                <div class="floy-share-icon copy-icon">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M16 3h-3a4 4 0 0 0-4 4v3a4 4 0 0 0 4 4h3a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4zM8 8H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3"/>
                                    </svg>
                                </div>
                                <div class="floy-share-info">
                                    <span class="floy-share-name">Copier le lien</span>
                                    <span class="floy-share-desc">Copier dans le presse-papier</span>
                                </div>
                            </div>
                            
                            <div class="floy-share-option" onclick="partageModule.shareToWhatsApp(${postId}, '${this.escapeHtml(title)}')">
                                <div class="floy-share-icon whatsapp-icon">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                                    </svg>
                                </div>
                                <div class="floy-share-info">
                                    <span class="floy-share-name">WhatsApp</span>
                                    <span class="floy-share-desc">Partager sur WhatsApp</span>
                                </div>
                            </div>
                            
                            <div class="floy-share-option" onclick="partageModule.shareToTwitter(${postId}, '${this.escapeHtml(title)}')">
                                <div class="floy-share-icon twitter-icon">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                                    </svg>
                                </div>
                                <div class="floy-share-info">
                                    <span class="floy-share-name">X (Twitter)</span>
                                    <span class="floy-share-desc">Partager sur X</span>
                                </div>
                            </div>
                            
                            <div class="floy-share-option" onclick="partageModule.shareToFacebook(${postId}, '${this.escapeHtml(title)}')">
                                <div class="floy-share-icon facebook-icon">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                                    </svg>
                                </div>
                                <div class="floy-share-info">
                                    <span class="floy-share-name">Facebook</span>
                                    <span class="floy-share-desc">Partager sur Facebook</span>
                                </div>
                            </div>
                            
                            <div class="floy-share-option" onclick="partageModule.downloadImage(${postId}, '${imageUrl}')">
                                <div class="floy-share-icon download-icon">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M3 15v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3M12 3v12m-4-4l4 4 4-4"/>
                                    </svg>
                                </div>
                                <div class="floy-share-info">
                                    <span class="floy-share-name">Télécharger</span>
                                    <span class="floy-share-desc">Enregistrer l'image</span>
                                </div>
                            </div>
                            
                            <div class="floy-share-option" onclick="partageModule.shareQRCode(${postId}, '${this.escapeHtml(title)}')">
                                <div class="floy-share-icon qrcode-icon">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM17 13h3v3h-3zM20 16h3v3h-3zM14 16h3v6h-3zM17 19h3v3h-3z"/>
                                    </svg>
                                </div>
                                <div class="floy-share-info">
                                    <span class="floy-share-name">QR Code</span>
                                    <span class="floy-share-desc">Scanner pour voir</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Fermer en cliquant en dehors
        const modal = document.getElementById('shareModal');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // ========== MÉTHODES DE PARTAGE ==========
    
    copyToClipboard(postId, title) {
        const link = window.location.href + `?post=${postId}`;
        navigator.clipboard.writeText(link).then(() => {
            this.recordShare(postId, 'copy');
            this.showToast('🔗 Lien copié dans le presse-papier !');
            document.getElementById('shareModal')?.remove();
        }).catch(() => {
            this.showToast('❌ Impossible de copier');
        });
    }

    shareToWhatsApp(postId, title) {
        const text = encodeURIComponent(`${title}\nRegarde ce post sur Floy !`);
        const url = `https://wa.me/?text=${text}`;
        window.open(url, '_blank');
        this.recordShare(postId, 'whatsapp');
        this.showToast('📱 Ouverture de WhatsApp...');
        document.getElementById('shareModal')?.remove();
    }

    shareToTwitter(postId, title) {
        const text = encodeURIComponent(`${title} 🔥 Découvrez ce post sur Floy !`);
        const url = `https://twitter.com/intent/tweet?text=${text}`;
        window.open(url, '_blank');
        this.recordShare(postId, 'twitter');
        this.showToast('🐦 Ouverture de X...');
        document.getElementById('shareModal')?.remove();
    }

    shareToFacebook(postId, title) {
        const url = encodeURIComponent(window.location.href);
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        window.open(fbUrl, '_blank');
        this.recordShare(postId, 'facebook');
        this.showToast('📘 Ouverture de Facebook...');
        document.getElementById('shareModal')?.remove();
    }

    downloadImage(postId, imageUrl) {
        if (!imageUrl) {
            this.showToast('❌ Image non disponible');
            return;
        }
        
        fetch(imageUrl)
            .then(response => response.blob())
            .then(blob => {
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.href = url;
                link.download = `floy-post-${postId}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                this.recordShare(postId, 'download');
                this.showToast('📸 Image téléchargée !');
            })
            .catch(() => {
                this.showToast('❌ Impossible de télécharger');
            });
        
        document.getElementById('shareModal')?.remove();
    }

    shareQRCode(postId, title) {
        const link = window.location.href + `?post=${postId}`;
        
        // Générer QR Code avec API externe
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`;
        
        const modalHtml = `
            <div id="qrModal" class="floy-share-modal">
                <div class="floy-share-modal-content" style="max-width: 350px;">
                    <div class="floy-share-modal-header">
                        <h3>QR Code</h3>
                        <button class="floy-share-modal-close" onclick="this.closest('#qrModal').remove()">&times;</button>
                    </div>
                    <div class="floy-share-modal-body" style="text-align: center;">
                        <img src="${qrUrl}" style="width: 200px; height: 200px; margin: 20px auto; border-radius: 12px;">
                        <p style="font-size: 12px; color: #8e8e8e;">Scannez pour voir ce post</p>
                        <button onclick="navigator.clipboard.writeText('${this.escapeHtml(link)}'); alert('Lien copié !')" 
                                style="background: #FF6B35; border: none; padding: 8px 20px; border-radius: 8px; color: white; cursor: pointer; margin-top: 10px;">
                            Copier le lien
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.recordShare(postId, 'qrcode');
    }

    // ========== RENDU DU BOUTON PARTAGE ==========
    renderShareButton(postId, postData = {}) {
        const shareCount = this.getShareCount(postId);
        
        return `
            <div class="share-module-container">
                <button class="action-btn share-btn" onclick="partageModule.showShareModal(${postId}, ${JSON.stringify(postData).replace(/"/g, '&quot;')})">
                    <svg viewBox="0 0 24 24">
                        <path d="M3 12h18M12 3l9 9-9 9"/>
                    </svg>
                </button>
                ${shareCount > 0 ? `<span class="share-count">${shareCount}</span>` : ''}
            </div>
        `;
    }

    // ========== TOAST NOTIFICATION ==========
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'floy-share-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    // ========== UTILITAIRES ==========
    escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
}

// ========== STYLES CSS ==========
const partageStyles = `
    /* Module Partage - Styles */
    .share-module-container {
        display: flex;
        align-items: center;
        gap: 6px;
    }
    
    .share-count {
        font-size: 12px;
        color: #8e8e8e;
    }
    
    /* Modal Share */
    .floy-share-modal {
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
    
    .floy-share-modal-content {
        background: #000000;
        border-radius: 16px;
        width: 450px;
        max-width: 90%;
        border: 1px solid #262626;
    }
    
    .floy-share-modal-header {
        padding: 16px;
        border-bottom: 1px solid #262626;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .floy-share-modal-header h3 {
        font-size: 18px;
        color: #ffffff;
    }
    
    .floy-share-modal-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
    }
    
    .floy-share-modal-body {
        padding: 16px;
    }
    
    /* Preview */
    .floy-share-preview {
        display: flex;
        gap: 12px;
        padding: 12px;
        background: #1a1a1a;
        border-radius: 12px;
        margin-bottom: 20px;
    }
    
    .floy-share-preview-img {
        width: 50px;
        height: 50px;
        border-radius: 8px;
        object-fit: cover;
    }
    
    .floy-share-preview-text strong {
        font-size: 14px;
    }
    
    .floy-share-preview-text p {
        font-size: 12px;
        color: #8e8e8e;
        margin-top: 4px;
    }
    
    /* Options */
    .floy-share-options {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .floy-share-option {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px;
        cursor: pointer;
        border-radius: 12px;
        transition: background 0.2s;
    }
    
    .floy-share-option:hover {
        background: #1a1a1a;
    }
    
    .floy-share-icon {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .floy-share-icon svg {
        width: 24px;
        height: 24px;
        fill: none;
        stroke: white;
        stroke-width: 1.5;
    }
    
    .copy-icon { background: #4a4a4a; }
    .whatsapp-icon { background: #25D366; }
    .twitter-icon { background: #1DA1F2; }
    .facebook-icon { background: #1877F2; }
    .download-icon { background: #34B7F1; }
    .qrcode-icon { background: #6B5B95; }
    
    .whatsapp-icon svg,
    .twitter-icon svg,
    .facebook-icon svg,
    .download-icon svg,
    .qrcode-icon svg,
    .copy-icon svg {
        stroke: white;
        fill: none;
    }
    
    .floy-share-info {
        flex: 1;
    }
    
    .floy-share-name {
        font-size: 15px;
        font-weight: 500;
        display: block;
    }
    
    .floy-share-desc {
        font-size: 12px;
        color: #8e8e8e;
    }
    
    /* Toast */
    .floy-share-toast {
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: #1a1a1a;
        color: white;
        padding: 12px 24px;
        border-radius: 30px;
        font-size: 14px;
        z-index: 3000;
        transition: transform 0.3s;
        border: 1px solid #FF6B35;
    }
    
    .floy-share-toast.show {
        transform: translateX(-50%) translateY(0);
    }
`;

// Ajouter les styles
if (!document.getElementById('partage-module-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'partage-module-styles';
    styleSheet.textContent = partageStyles;
    document.head.appendChild(styleSheet);
}

// ========== EXPORT ==========
const partageModule = new PartageModule();
window.partageModule = partageModule;

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    console.log("📤 Module Partage chargé");
});
