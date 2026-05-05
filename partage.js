// ========================
// MODULE PARTAGE - VERSION AMÉLIORÉE
// ========================

class PartageModule {
    // ✅ NOUVEAU: Plus d'options de partage
    showShareModal(postId, imageUrl, caption = "") {
        const modalHtml = `
            <div id="shareModal" class="modal-share">
                <div class="modal-share-content">
                    <div class="modal-share-header">
                        <h3>Partager</h3>
                        <button onclick="this.closest('#shareModal').remove()">×</button>
                    </div>
                    <div class="modal-share-body">
                        <div class="share-options-grid">
                            <div class="share-option" onclick="partageModule.copyLink()">
                                <div class="share-icon copy">🔗</div>
                                <span>Copier le lien</span>
                            </div>
                            <div class="share-option" onclick="partageModule.shareWhatsApp()">
                                <div class="share-icon whatsapp">💬</div>
                                <span>WhatsApp</span>
                            </div>
                            <div class="share-option" onclick="partageModule.shareTwitter()">
                                <div class="share-icon twitter">🐦</div>
                                <span>X (Twitter)</span>
                            </div>
                            <div class="share-option" onclick="partageModule.shareFacebook()">
                                <div class="share-icon facebook">📘</div>
                                <span>Facebook</span>
                            </div>
                            <div class="share-option" onclick="partageModule.shareInstagram()">
                                <div class="share-icon instagram">📸</div>
                                <span>Instagram</span>
                            </div>
                            <div class="share-option" onclick="partageModule.shareTelegram()">
                                <div class="share-icon telegram">✈️</div>
                                <span>Telegram</span>
                            </div>
                            <div class="share-option" onclick="partageModule.shareEmail()">
                                <div class="share-icon email">📧</div>
                                <span>Email</span>
                            </div>
                            <div class="share-option" onclick="partageModule.shareQRCode()">
                                <div class="share-icon qr">📱</div>
                                <span>QR Code</span>
                            </div>
                        </div>
                        ${imageUrl ? `<img src="${imageUrl}" class="share-preview-img">` : ''}
                        ${caption ? `<p class="share-preview-text">${caption}</p>` : ''}
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    // ✅ NOUVEAU: Copier avec notification
    copyLink() {
        navigator.clipboard.writeText(window.location.href);
        this.showToast("🔗 Lien copié !");
        document.getElementById('shareModal')?.remove();
    }

    shareWhatsApp() {
        window.open(`https://wa.me/?text=${encodeURIComponent("Regarde ce post sur Floy ! " + window.location.href)}`, '_blank');
        document.getElementById('shareModal')?.remove();
    }

    shareTwitter() {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent("Regarde ce post sur Floy ! 🔥")}&url=${encodeURIComponent(window.location.href)}`, '_blank');
        document.getElementById('shareModal')?.remove();
    }

    shareFacebook() {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
        document.getElementById('shareModal')?.remove();
    }

    shareInstagram() {
        this.showToast("📸 Partage sur Instagram : copiez l'image et collez-la dans Instagram");
        document.getElementById('shareModal')?.remove();
    }

    shareTelegram() {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent("Regarde ce post sur Floy !")}`, '_blank');
        document.getElementById('shareModal')?.remove();
    }

    shareEmail() {
        window.location.href = `mailto:?subject=Regarde ce post sur Floy&body=${encodeURIComponent(window.location.href)}`;
        document.getElementById('shareModal')?.remove();
    }

    shareQRCode() {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}`;
        const modalHtml = `
            <div id="qrModal" class="modal-share">
                <div class="modal-share-content" style="max-width:350px;">
                    <div class="modal-share-header">
                        <h3>QR Code</h3>
                        <button onclick="this.closest('#qrModal').remove()">×</button>
                    </div>
                    <div class="modal-share-body" style="text-align:center;">
                        <img src="${qrUrl}" style="width:200px;height:200px;margin:20px auto;border-radius:12px;">
                        <p style="font-size:12px;color:#8e8e8e;">Scannez pour voir ce post</p>
                        <button onclick="navigator.clipboard.writeText('${window.location.href}')" style="background:#FF6B35;border:none;padding:8px 20px;border-radius:8px;color:#fff;cursor:pointer;">Copier le lien</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.getElementById('shareModal')?.remove();
    }

    // ✅ NOUVEAU: Toast notification
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'share-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }
}

const partageModule = new PartageModule();
window.partageModule = partageModule;

// Styles
const shareStyles = `
    .modal-share { position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:3000;display:flex;align-items:center;justify-content:center; }
    .modal-share-content { background:#000;border-radius:16px;width:450px;max-width:90%;border:1px solid #262626; }
    .modal-share-header { padding:16px;border-bottom:1px solid #262626;display:flex;justify-content:space-between; }
    .modal-share-header button { background:none;border:none;color:#fff;font-size:24px;cursor:pointer; }
    .modal-share-body { padding:20px; }
    .share-options-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:20px; }
    .share-option { text-align:center;cursor:pointer; }
    .share-icon { width:50px;height:50px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 8px; }
    .share-icon.copy { background:#4a4a4a; }
    .share-icon.whatsapp { background:#25D366; }
    .share-icon.twitter { background:#1DA1F2; }
    .share-icon.facebook { background:#1877F2; }
    .share-icon.instagram { background:linear-gradient(45deg,#f09433,#d62976); }
    .share-icon.telegram { background:#0088cc; }
    .share-icon.email { background:#666; }
    .share-icon.qr { background:#6B5B95; }
    .share-option span { font-size:12px;color:#fff; }
    .share-option:hover .share-icon { transform:scale(1.05); }
    .share-preview-img { width:100%;border-radius:12px;margin-bottom:12px; }
    .share-preview-text { font-size:13px;color:#8e8e8e; }
    .share-toast { position:fixed;bottom:100px;left:50%;transform:translateX(-50%) translateY(100px);background:#1a1a1a;color:#FF6B35;padding:12px 24px;border-radius:30px;font-size:14px;z-index:4000;transition:0.3s;border:1px solid #FF6B35;white-space:nowrap; }
    .share-toast.show { transform:translateX(-50%) translateY(0); }
`;

if (!document.getElementById('share-styles')) {
    const style = document.createElement('style');
    style.id = 'share-styles';
    style.textContent = shareStyles;
    document.head.appendChild(style);
}
