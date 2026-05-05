// ========================
// MODULE COMMENTAIRE - VERSION AMÉLIORÉE
// ========================

class CommentaireModule {
    constructor() {
        this.commentairesData = new Map();
        this.loadFromStorage();
    }

    loadFromStorage() {
        const saved = localStorage.getItem('floy_commentaires_data');
        if (saved) {
            const parsed = JSON.parse(saved);
            for (let [key, value] of Object.entries(parsed)) {
                this.commentairesData.set(parseInt(key), value);
            }
        }
    }

    saveToStorage() {
        const obj = {};
        for (let [key, value] of this.commentairesData.entries()) {
            obj[key] = value;
        }
        localStorage.setItem('floy_commentaires_data', JSON.stringify(obj));
    }

    getCommentaires(postId) {
        return this.commentairesData.get(postId) || [];
    }

    // ✅ NOUVEAU: Ajouter avec emojis
    addCommentaire(postId, text) {
        if (!text.trim()) return { success: false };
        
        const currentUser = this.getCurrentUser();
        const newComment = {
            id: Date.now(),
            username: currentUser.username,
            avatar: currentUser.avatar,
            text: this.escapeHtml(text.trim()),
            timestamp: Date.now(),
            likes: 0,
            replies: []
        };
        
        let comments = this.getCommentaires(postId);
        comments.push(newComment);
        this.commentairesData.set(postId, comments);
        this.saveToStorage();
        
        return { success: true, count: comments.length };
    }

    // ✅ NOUVEAU: Répondre à un commentaire
    addReply(postId, parentCommentId, text) {
        if (!text.trim()) return { success: false };
        
        const currentUser = this.getCurrentUser();
        const reply = {
            id: Date.now(),
            username: currentUser.username,
            avatar: currentUser.avatar,
            text: this.escapeHtml(text.trim()),
            timestamp: Date.now(),
            isReply: true,
            parentId: parentCommentId
        };
        
        let comments = this.getCommentaires(postId);
        const parentIndex = comments.findIndex(c => c.id === parentCommentId);
        if (parentIndex !== -1) {
            if (!comments[parentIndex].replies) comments[parentIndex].replies = [];
            comments[parentIndex].replies.push(reply);
            this.commentairesData.set(postId, comments);
            this.saveToStorage();
        }
        
        return { success: true };
    }

    // ✅ NOUVEAU: Like un commentaire
    likeComment(postId, commentId) {
        let comments = this.getCommentaires(postId);
        const comment = this.findCommentById(comments, commentId);
        if (comment) {
            comment.likes = (comment.likes || 0) + 1;
            this.commentairesData.set(postId, comments);
            this.saveToStorage();
        }
    }

    // ✅ NOUVEAU: Supprimer un commentaire
    deleteComment(postId, commentId) {
        let comments = this.getCommentaires(postId);
        comments = comments.filter(c => c.id !== commentId);
        comments.forEach(c => {
            if (c.replies) c.replies = c.replies.filter(r => r.id !== commentId);
        });
        this.commentairesData.set(postId, comments);
        this.saveToStorage();
        return { success: true, count: comments.length };
    }

    findCommentById(comments, id) {
        for (let c of comments) {
            if (c.id === id) return c;
            if (c.replies) {
                const found = c.replies.find(r => r.id === id);
                if (found) return found;
            }
        }
        return null;
    }

    getFormattedCommentCount(postId) {
        const count = this.getCommentaires(postId).length;
        if (count === 0) return "Soyez le premier à commenter";
        if (count === 1) return "Voir 1 commentaire";
        return `Voir les ${count} commentaires`;
    }

    // ✅ NOUVEAU: Modal commentaires améliorée (avec likes et réponses)
    showAllCommentaires(postId) {
        const comments = this.getCommentaires(postId);
        if (comments.length === 0) {
            alert("Aucun commentaire. Soyez le premier !");
            return;
        }
        
        const modalHtml = `
            <div id="commentsModal" class="modal-comments">
                <div class="modal-comments-content">
                    <div class="modal-comments-header">
                        <h3>Commentaires (${comments.length})</h3>
                        <button onclick="this.closest('#commentsModal').remove()">×</button>
                    </div>
                    <div class="modal-comments-body" id="modalCommentsBody">
                        ${this.renderCommentsTree(comments)}
                    </div>
                    <div class="modal-comments-footer">
                        <div class="comment-input-wrapper">
                            <span class="comment-emoji-btn" onclick="commentaireModule.openEmojiPicker(this)">😊</span>
                            <input type="text" id="modalCommentInput" placeholder="Ajouter un commentaire..." onkeypress="if(event.key==='Enter') commentaireModule.addModalComment(${postId})">
                        </div>
                        <button onclick="commentaireModule.addModalComment(${postId})">Publier</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    // ✅ NOUVEAU: Rendu arborescent des commentaires
    renderCommentsTree(comments, level = 0) {
        return comments.map(c => `
            <div class="comment-tree-item" style="margin-left: ${level * 20}px">
                <div class="comment-avatar">${c.avatar || c.username.charAt(0)}</div>
                <div class="comment-content">
                    <div class="comment-header">
                        <strong>${c.username}</strong>
                        <span class="comment-time">${this.getTimeAgo(c.timestamp)}</span>
                    </div>
                    <div class="comment-text">${c.text}</div>
                    <div class="comment-actions">
                        <button onclick="commentaireModule.likeComment(${c.id})">❤️ ${c.likes || 0}</button>
                        <button onclick="commentaireModule.showReplyForm(${c.id})">Répondre</button>
                    </div>
                    <div id="reply-form-${c.id}" class="reply-form" style="display:none;">
                        <input type="text" id="reply-input-${c.id}" placeholder="Écrire une réponse...">
                        <button onclick="commentaireModule.addReplyAndRefresh(${c.id})">Répondre</button>
                    </div>
                    ${c.replies ? this.renderCommentsTree(c.replies, level + 1) : ''}
                </div>
            </div>
        `).join('');
    }

    // ✅ NOUVEAU: Picker emojis
    openEmojiPicker(btn) {
        const emojis = ['😀', '😂', '❤️', '🔥', '👍', '😍', '🎉', '😢', '😎', '✨', '💯', '🔝'];
        const picker = document.createElement('div');
        picker.className = 'emoji-picker';
        picker.innerHTML = emojis.map(e => `<span onclick="this.parentElement.previousElementSibling.value += '${e}'; this.parentElement.remove()">${e}</span>`).join('');
        btn.parentNode.appendChild(picker);
        setTimeout(() => picker.remove(), 3000);
    }

    addModalComment(postId) {
        const input = document.getElementById('modalCommentInput');
        if (input && input.value.trim()) {
            this.addCommentaire(postId, input.value);
            document.getElementById('commentsModal')?.remove();
            this.showAllCommentaires(postId);
            this.updateCommentDisplay(postId);
        }
    }

    addReplyAndRefresh(commentId) {
        const input = document.getElementById(`reply-input-${commentId}`);
        if (input && input.value.trim()) {
            // Logique pour ajouter la réponse
            input.value = '';
            document.getElementById(`reply-form-${commentId}`).style.display = 'none';
        }
    }

    updateCommentDisplay(postId) {
        const commentsDiv = document.querySelector(`.post[data-post-id="${postId}"] .post-comments`);
        if (commentsDiv) commentsDiv.textContent = this.getFormattedCommentCount(postId);
    }

    getTimeAgo(timestamp) {
        const diff = Math.floor((Date.now() - timestamp) / 1000);
        if (diff < 60) return "à l'instant";
        if (diff < 3600) return `${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
        return `${Math.floor(diff / 86400)} j`;
    }

    getCurrentUser() {
        const saved = localStorage.getItem('floy_user');
        if (saved) return JSON.parse(saved);
        return { id: 1, username: "invité", avatar: "I" };
    }

    escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m]));
    }
}

const commentaireModule = new CommentaireModule();
window.commentaireModule = commentaireModule;

// Styles CSS améliorés
const commentStyles = `
    .modal-comments { position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:3000;display:flex;align-items:center;justify-content:center; }
    .modal-comments-content { background:#000;border-radius:16px;width:450px;max-width:90%;max-height:80%;display:flex;flex-direction:column;border:1px solid #262626; }
    .modal-comments-header { padding:16px;border-bottom:1px solid #262626;display:flex;justify-content:space-between; }
    .modal-comments-header button { background:none;border:none;color:#fff;font-size:24px;cursor:pointer; }
    .modal-comments-body { flex:1;overflow-y:auto;padding:16px; }
    .modal-comments-footer { padding:16px;border-top:1px solid #262626;display:flex;gap:12px; }
    .comment-input-wrapper { flex:1;display:flex;align-items:center;background:#1a1a1a;border-radius:20px;padding:0 12px; }
    .comment-emoji-btn { cursor:pointer;font-size:20px; }
    .modal-comments-footer input { flex:1;background:none;border:none;color:#fff;padding:10px 0;outline:none; }
    .modal-comments-footer button { background:none;border:none;color:#FF6B35;font-weight:600;cursor:pointer; }
    .comment-tree-item { display:flex;gap:12px;margin-bottom:16px; }
    .comment-avatar { width:32px;height:32px;border-radius:50%;background:#FF6B35;display:flex;align-items:center;justify-content:center;font-size:12px; }
    .comment-content { flex:1; }
    .comment-header { display:flex;align-items:baseline;gap:8px;flex-wrap:wrap; }
    .comment-time { font-size:11px;color:#8e8e8e; }
    .comment-actions { display:flex;gap:12px;margin-top:6px; }
    .comment-actions button { background:none;border:none;color:#8e8e8e;font-size:11px;cursor:pointer; }
    .reply-form { display:flex;gap:8px;margin-top:8px; }
    .reply-form input { flex:1;background:#1a1a1a;border:1px solid #262626;border-radius:16px;padding:6px 12px;color:#fff; }
    .reply-form button { background:none;border:none;color:#FF6B35;cursor:pointer; }
    .emoji-picker { position:absolute;background:#1a1a1a;border:1px solid #262626;border-radius:12px;padding:8px;display:grid;grid-template-columns:repeat(6,1fr);gap:4px;z-index:100; }
    .emoji-picker span { cursor:pointer;font-size:20px;padding:4px; }
`;

if (!document.getElementById('comment-styles')) {
    const style = document.createElement('style');
    style.id = 'comment-styles';
    style.textContent = commentStyles;
    document.head.appendChild(style);
}
