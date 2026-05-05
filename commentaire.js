// ========================
// MODULE COMMENTAIRE - FLOY
// ========================
// Gestion complète des commentaires

class CommentaireModule {
    constructor() {
        this.commentairesData = new Map();
        this.observers = [];
        this.loadFromStorage();
    }

    // ========== STOCKAGE ==========
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

    // ========== OBTENIR COMMENTAIRES ==========
    getCommentaires(postId) {
        return this.commentairesData.get(postId) || [];
    }

    getCommentairesCount(postId) {
        const comments = this.getCommentaires(postId);
        return comments.length;
    }

    getFormattedCommentCount(postId) {
        const count = this.getCommentairesCount(postId);
        if (count === 0) return "Soyez le premier à commenter";
        if (count === 1) return "Voir 1 commentaire";
        return `Voir les ${count} commentaires`;
    }

    // ========== AJOUTER COMMENTAIRE ==========
    addCommentaire(postId, text, user) {
        if (!text || text.trim() === "") {
            return { success: false, message: "Le commentaire ne peut pas être vide" };
        }

        const currentUser = user || this.getCurrentUser();
        if (!currentUser) {
            return { success: false, message: "Connectez-vous pour commenter" };
        }

        const newComment = {
            id: Date.now(),
            username: currentUser.username,
            avatar: currentUser.avatar || currentUser.username.charAt(0).toUpperCase(),
            avatarUrl: currentUser.avatarUrl || null,
            text: text.trim(),
            timestamp: Date.now(),
            userId: currentUser.id
        };

        let comments = this.getCommentaires(postId);
        comments.push(newComment);
        this.commentairesData.set(postId, comments);
        this.saveToStorage();

        this.notifyObservers(postId, comments);

        return { success: true, comment: newComment, count: comments.length };
    }

    // ========== SUPPRIMER COMMENTAIRE ==========
    deleteCommentaire(postId, commentId, userId) {
        let comments = this.getCommentaires(postId);
        const commentIndex = comments.findIndex(c => c.id === commentId);
        
        if (commentIndex === -1) {
            return { success: false, message: "Commentaire introuvable" };
        }

        const comment = comments[commentIndex];
        if (comment.userId !== userId && !this.isAdmin(userId)) {
            return { success: false, message: "Vous ne pouvez pas supprimer ce commentaire" };
        }

        comments.splice(commentIndex, 1);
        this.commentairesData.set(postId, comments);
        this.saveToStorage();
        this.notifyObservers(postId, comments);

        return { success: true, count: comments.length };
    }

    // ========== MODIFIER COMMENTAIRE ==========
    editCommentaire(postId, commentId, newText, userId) {
        if (!newText || newText.trim() === "") {
            return { success: false, message: "Le commentaire ne peut pas être vide" };
        }

        let comments = this.getCommentaires(postId);
        const commentIndex = comments.findIndex(c => c.id === commentId);
        
        if (commentIndex === -1) {
            return { success: false, message: "Commentaire introuvable" };
        }

        const comment = comments[commentIndex];
        if (comment.userId !== userId && !this.isAdmin(userId)) {
            return { success: false, message: "Vous ne pouvez pas modifier ce commentaire" };
        }

        comments[commentIndex].text = newText.trim();
        comments[commentIndex].edited = true;
        this.commentairesData.set(postId, comments);
        this.saveToStorage();
        this.notifyObservers(postId, comments);

        return { success: true, comment: comments[commentIndex] };
    }

    // ========== RÉPONDRE À UN COMMENTAIRE ==========
    replyToCommentaire(postId, parentCommentId, text, user) {
        const currentUser = user || this.getCurrentUser();
        if (!currentUser) {
            return { success: false, message: "Connectez-vous pour répondre" };
        }

        const newReply = {
            id: Date.now(),
            username: currentUser.username,
            avatar: currentUser.avatar || currentUser.username.charAt(0).toUpperCase(),
            avatarUrl: currentUser.avatarUrl || null,
            text: text.trim(),
            timestamp: Date.now(),
            userId: currentUser.id,
            parentId: parentCommentId,
            isReply: true
        };

        let comments = this.getCommentaires(postId);
        comments.push(newReply);
        this.commentairesData.set(postId, comments);
        this.saveToStorage();
        this.notifyObservers(postId, comments);

        return { success: true, reply: newReply };
    }

    // ========== AFFICHER TOUS COMMENTAIRES (MODAL) ==========
    showAllCommentaires(postId) {
        const comments = this.getCommentaires(postId);
        const count = comments.length;

        if (count === 0) {
            alert("💬 Aucun commentaire pour le moment. Soyez le premier à commenter !");
            return;
        }

        // Trier par date (plus ancien d'abord)
        const sortedComments = [...comments].sort((a, b) => a.timestamp - b.timestamp);

        let modalHtml = `
            <div id="commentsModal" class="floy-comments-modal">
                <div class="floy-comments-modal-content">
                    <div class="floy-comments-modal-header">
                        <h3>Commentaires (${count})</h3>
                        <button class="floy-comments-modal-close" onclick="this.closest('.floy-comments-modal').remove()">&times;</button>
                    </div>
                    <div class="floy-comments-modal-body" id="floyCommentsList">
        `;

        sortedComments.forEach(comment => {
            const timeAgo = this.getTimeAgo(comment.timestamp);
            const replyClass = comment.isReply ? 'floy-comment-reply' : '';
            const avatarContent = comment.avatarUrl ? 
                `<img src="${comment.avatarUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">` : 
                comment.avatar;

            modalHtml += `
                <div class="floy-comment-item ${replyClass}" data-comment-id="${comment.id}">
                    <div class="floy-comment-avatar">
                        ${avatarContent}
                    </div>
                    <div class="floy-comment-content">
                        <div class="floy-comment-header">
                            <span class="floy-comment-username">${this.escapeHtml(comment.username)}</span>
                            <span class="floy-comment-time">${timeAgo}</span>
                        </div>
                        <div class="floy-comment-text">${this.escapeHtml(comment.text)}</div>
                        ${comment.edited ? '<div class="floy-comment-edited">(modifié)</div>' : ''}
                        <div class="floy-comment-actions">
                            <button class="floy-comment-reply-btn" onclick="commentaireModule.showReplyForm(${postId}, ${comment.id})">Répondre</button>
                            ${comment.userId === this.getCurrentUserId() ? 
                                `<button class="floy-comment-edit-btn" onclick="commentaireModule.showEditForm(${postId}, ${comment.id})">Modifier</button>
                                 <button class="floy-comment-delete-btn" onclick="commentaireModule.deleteCommentaireUI(${postId}, ${comment.id})">Supprimer</button>` : ''
                            }
                        </div>
                        <div id="reply-form-${comment.id}" class="floy-reply-form" style="display:none;">
                            <input type="text" id="reply-input-${comment.id}" placeholder="Écrire une réponse..." class="floy-reply-input">
                            <button onclick="commentaireModule.submitReply(${postId}, ${comment.id})" class="floy-reply-submit">Répondre</button>
                        </div>
                        <div id="edit-form-${comment.id}" class="floy-edit-form" style="display:none;">
                            <input type="text" id="edit-input-${comment.id}" value="${this.escapeHtml(comment.text)}" class="floy-edit-input">
                            <button onclick="commentaireModule.submitEdit(${postId}, ${comment.id})" class="floy-edit-submit">Enregistrer</button>
                        </div>
                    </div>
                </div>
            `;
        });

        modalHtml += `
                    </div>
                    <div class="floy-comments-modal-footer">
                        <div class="floy-add-comment-form">
                            <input type="text" id="floy-new-comment-input" placeholder="Ajouter un commentaire..." class="floy-new-comment-input">
                            <button id="floy-submit-comment" class="floy-submit-comment-btn" onclick="commentaireModule.addCommentaireUI(${postId})">Publier</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Fermer en cliquant en dehors
        const modal = document.getElementById('commentsModal');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // ========== UI - AJOUTER COMMENTAIRE ==========
    addCommentaireUI(postId) {
        const input = document.getElementById('floy-new-comment-input');
        if (!input) return;
        
        const text = input.value.trim();
        if (!text) return;

        const result = this.addCommentaire(postId, text);
        
        if (result.success) {
            input.value = '';
            // Mettre à jour l'affichage du compteur dans le post
            this.updateCommentCountDisplay(postId, result.count);
            // Rouvrir la modal avec les nouveaux commentaires
            this.showAllCommentaires(postId);
        } else {
            alert(result.message);
        }
    }

    // ========== UI - RÉPONDRE ==========
    showReplyForm(postId, commentId) {
        const form = document.getElementById(`reply-form-${commentId}`);
        if (form) {
            form.style.display = form.style.display === 'none' ? 'flex' : 'none';
            if (form.style.display === 'flex') {
                document.getElementById(`reply-input-${commentId}`).focus();
            }
        }
    }

    submitReply(postId, parentCommentId) {
        const input = document.getElementById(`reply-input-${parentCommentId}`);
        const text = input.value.trim();
        if (!text) return;

        const result = this.replyToCommentaire(postId, parentCommentId, text);
        
        if (result.success) {
            this.updateCommentCountDisplay(postId, this.getCommentairesCount(postId));
            this.showAllCommentaires(postId);
        } else {
            alert(result.message);
        }
    }

    // ========== UI - MODIFIER ==========
    showEditForm(postId, commentId) {
        const form = document.getElementById(`edit-form-${commentId}`);
        if (form) {
            form.style.display = form.style.display === 'none' ? 'flex' : 'none';
            if (form.style.display === 'flex') {
                document.getElementById(`edit-input-${commentId}`).focus();
            }
        }
    }

    submitEdit(postId, commentId) {
        const input = document.getElementById(`edit-input-${commentId}`);
        const newText = input.value.trim();
        if (!newText) return;

        const result = this.editCommentaire(postId, commentId, newText, this.getCurrentUserId());
        
        if (result.success) {
            this.showAllCommentaires(postId);
        } else {
            alert(result.message);
        }
    }

    // ========== UI - SUPPRIMER ==========
    deleteCommentaireUI(postId, commentId) {
        if (confirm("Supprimer ce commentaire ?")) {
            const result = this.deleteCommentaire(postId, commentId, this.getCurrentUserId());
            if (result.success) {
                this.updateCommentCountDisplay(postId, result.count);
                this.showAllCommentaires(postId);
            } else {
                alert(result.message);
            }
        }
    }

    // ========== RENDU HTML D'UN POST (section commentaires) ==========
    renderCommentSection(postId) {
        const countText = this.getFormattedCommentCount(postId);
        const hasComments = this.getCommentairesCount(postId) > 0;
        
        return `
            <div class="comment-module-container" data-post-id="${postId}">
                <div class="post-comments clickable" onclick="commentaireModule.showAllCommentaires(${postId})">
                    ${countText}
                </div>
                <div class="comment-form">
                    <input type="text" class="comment-input" id="quick-comment-${postId}" placeholder="Ajouter un commentaire..." 
                           onkeypress="if(event.key==='Enter') commentaireModule.addQuickComment(${postId})">
                    <button class="comment-post-btn" onclick="commentaireModule.addQuickComment(${postId})">Publier</button>
                </div>
            </div>
        `;
    }

    addQuickComment(postId) {
        const input = document.getElementById(`quick-comment-${postId}`);
        if (!input) return;
        
        const text = input.value.trim();
        if (!text) return;

        const result = this.addCommentaire(postId, text);
        
        if (result.success) {
            input.value = '';
            this.updateCommentCountDisplay(postId, result.count);
        } else {
            alert(result.message);
        }
    }

    // ========== METTRE À JOUR L'AFFICHAGE ==========
    updateCommentCountDisplay(postId, count) {
        const commentsDiv = document.querySelector(`.post[data-post-id="${postId}"] .post-comments`);
        if (commentsDiv) {
            const newText = count === 0 ? "Soyez le premier à commenter" : 
                           (count === 1 ? "Voir 1 commentaire" : `Voir les ${count} commentaires`);
            commentsDiv.textContent = newText;
        }
    }

    // ========== TEMPS RÉEL ==========
    subscribe(callback) {
        this.observers.push(callback);
    }

    notifyObservers(postId, comments) {
        this.observers.forEach(callback => {
            callback(postId, comments);
        });
    }

    // ========== UTILITAIRES ==========
    getCurrentUser() {
        const savedUser = localStorage.getItem('floy_user');
        if (savedUser) {
            return JSON.parse(savedUser);
        }
        return { id: 1, username: "invité", avatar: "I" };
    }

    getCurrentUserId() {
        const user = this.getCurrentUser();
        return user.id;
    }

    isAdmin(userId) {
        return userId === 1; // admin par défaut
    }

    getTimeAgo(timestamp) {
        const diff = Math.floor((Date.now() - timestamp) / 1000);
        if (diff < 60) return "à l'instant";
        if (diff < 3600) return `${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
        return `${Math.floor(diff / 86400)} j`;
    }

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
const commentaireStyles = `
    /* Module Commentaire - Styles */
    .post-comments {
        padding: 0 16px 4px;
        font-size: 14px;
        color: #8e8e8e;
        cursor: pointer;
    }
    
    .post-comments.clickable:hover {
        text-decoration: underline;
    }
    
    .comment-form {
        display: flex;
        align-items: center;
        padding: 8px 16px;
        border-top: 1px solid #262626;
    }
    
    .comment-input {
        flex: 1;
        background: none;
        border: none;
        color: #f5f5f5;
        padding: 12px 0;
        font-size: 14px;
        outline: none;
    }
    
    .comment-input::placeholder {
        color: #8e8e8e;
    }
    
    .comment-post-btn {
        background: none;
        border: none;
        color: #FF6B35;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        opacity: 0.7;
    }
    
    .comment-post-btn:hover {
        opacity: 1;
    }
    
    /* Modal Commentaires */
    .floy-comments-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .floy-comments-modal-content {
        background: #000000;
        border-radius: 16px;
        width: 500px;
        max-width: 90%;
        height: 80%;
        display: flex;
        flex-direction: column;
        border: 1px solid #262626;
    }
    
    .floy-comments-modal-header {
        padding: 16px;
        border-bottom: 1px solid #262626;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .floy-comments-modal-header h3 {
        font-size: 16px;
        color: #ffffff;
    }
    
    .floy-comments-modal-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
    }
    
    .floy-comments-modal-body {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
    }
    
    .floy-comments-modal-footer {
        padding: 16px;
        border-top: 1px solid #262626;
    }
    
    .floy-add-comment-form {
        display: flex;
        gap: 12px;
    }
    
    .floy-new-comment-input {
        flex: 1;
        background: #1a1a1a;
        border: 1px solid #262626;
        border-radius: 20px;
        padding: 10px 16px;
        color: white;
        outline: none;
    }
    
    .floy-new-comment-input:focus {
        border-color: #FF6B35;
    }
    
    .floy-submit-comment-btn {
        background: none;
        border: none;
        color: #FF6B35;
        font-weight: 600;
        cursor: pointer;
    }
    
    /* Item commentaire */
    .floy-comment-item {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
    }
    
    .floy-comment-reply {
        margin-left: 44px;
    }
    
    .floy-comment-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: #FF6B35;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: bold;
        flex-shrink: 0;
        overflow: hidden;
    }
    
    .floy-comment-content {
        flex: 1;
    }
    
    .floy-comment-header {
        display: flex;
        align-items: baseline;
        gap: 8px;
        flex-wrap: wrap;
    }
    
    .floy-comment-username {
        font-weight: 600;
        font-size: 13px;
    }
    
    .floy-comment-time {
        font-size: 11px;
        color: #8e8e8e;
    }
    
    .floy-comment-text {
        font-size: 13px;
        margin-top: 4px;
        word-break: break-word;
    }
    
    .floy-comment-edited {
        font-size: 10px;
        color: #8e8e8e;
        margin-top: 2px;
    }
    
    .floy-comment-actions {
        display: flex;
        gap: 12px;
        margin-top: 8px;
    }
    
    .floy-comment-actions button {
        background: none;
        border: none;
        font-size: 11px;
        cursor: pointer;
        padding: 0;
    }
    
    .floy-comment-reply-btn {
        color: #8e8e8e;
    }
    
    .floy-comment-edit-btn {
        color: #FF6B35;
    }
    
    .floy-comment-delete-btn {
        color: #ff4444;
    }
    
    /* Forms réponse et édition */
    .floy-reply-form, .floy-edit-form {
        display: flex;
        gap: 8px;
        margin-top: 10px;
    }
    
    .floy-reply-input, .floy-edit-input {
        flex: 1;
        background: #1a1a1a;
        border: 1px solid #262626;
        border-radius: 16px;
        padding: 8px 12px;
        color: white;
        font-size: 12px;
        outline: none;
    }
    
    .floy-reply-input:focus, .floy-edit-input:focus {
        border-color: #FF6B35;
    }
    
    .floy-reply-submit, .floy-edit-submit {
        background: none;
        border: none;
        color: #FF6B35;
        font-weight: 600;
        font-size: 12px;
        cursor: pointer;
    }
`;

// Ajouter les styles
if (!document.getElementById('commentaire-module-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'commentaire-module-styles';
    styleSheet.textContent = commentaireStyles;
    document.head.appendChild(styleSheet);
}

// ========== EXPORT ==========
const commentaireModule = new CommentaireModule();
window.commentaireModule = commentaireModule;

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    console.log("📝 Module Commentaire chargé");
});
