// ========================
// MODULE NOTIFICATIONS - FLOY
// Cloche en temps réel + centre de notifications
// ========================

class NotificationsModule {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
        this.listeners = [];
        this.loadFromStorage();
        this.setupRealtimeListeners();
        this.updateBadge();
        
        // Vérifier toutes les minutes pour les nouvelles notifs
        setInterval(() => this.checkForNewNotifications(), 60000);
    }

    // ========== STOCKAGE ==========
    loadFromStorage() {
        const saved = localStorage.getItem('floy_notifications');
        if (saved) {
            this.notifications = JSON.parse(saved);
            this.unreadCount = this.notifications.filter(n => !n.read).length;
        }
    }

    saveToStorage() {
        localStorage.setItem('floy_notifications', JSON.stringify(this.notifications));
    }

    // ========== AJOUTER UNE NOTIFICATION ==========
    addNotification(type, data) {
        const currentUser = this.getCurrentUser();
        const newNotif = {
            id: Date.now(),
            type: type, // 'like', 'comment', 'follow', 'mention', 'story'
            userId: data.userId,
            username: data.username,
            avatar: data.avatar,
            postId: data.postId || null,
            postImage: data.postImage || null,
            message: this.getMessageForType(type, data),
            timestamp: Date.now(),
            read: false
        };
        
        this.notifications.unshift(newNotif);
        this.unreadCount++;
        this.saveToStorage();
        this.updateBadge();
        this.notifyListeners(newNotif);
        
        // Afficher toast temps réel
        this.showToast(newNotif);
        
        return newNotif;
    }

    getMessageForType(type, data) {
        switch(type) {
            case 'like': return `${data.username} a aimé votre publication.`;
            case 'comment': return `${data.username} a commenté : "${data.commentPreview}"`;
            case 'follow': return `${data.username} a commencé à vous suivre.`;
            case 'mention': return `${data.username} vous a mentionné dans un commentaire.`;
            case 'story': return `${data.username} a ajouté une story.`;
            default: return `${data.username} a interagi avec vous.`;
        }
    }

    // ========== MARQUER COMME LU ==========
    markAsRead(notifId) {
        const notif = this.notifications.find(n => n.id === notifId);
        if (notif && !notif.read) {
            notif.read = true;
            this.unreadCount--;
            this.saveToStorage();
            this.updateBadge();
        }
    }

    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.unreadCount = 0;
        this.saveToStorage();
        this.updateBadge();
    }

    // ========== METTRE À JOUR LE BADGE (icône cloche) ==========
    updateBadge() {
        const bellIcon = document.querySelector('.nav-item[data-page="notifications"]');
        if (bellIcon) {
            let badge = bellIcon.querySelector('.notif-badge');
            if (this.unreadCount > 0) {
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'notif-badge';
                    bellIcon.appendChild(badge);
                }
                badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
                badge.style.display = 'flex';
            } else if (badge) {
                badge.style.display = 'none';
            }
        }
        
        // Mettre à jour le titre de la page
        if (this.unreadCount > 0) {
            document.title = `(${this.unreadCount}) Floy - Notifications`;
        } else {
            document.title = 'Floy - Partagez vos moments';
        }
    }

    // ========== AFFICHER LE CENTRE DE NOTIFICATIONS ==========
    showNotificationsModal() {
        const modalHtml = `
            <div id="notificationsModal" class="notifications-modal">
                <div class="notifications-modal-content">
                    <div class="notifications-modal-header">
                        <h3>Notifications</h3>
                        <div class="notifications-header-actions">
                            ${this.unreadCount > 0 ? `<button class="mark-all-read" onclick="notificationsModule.markAllAsRead(); notificationsModule.showNotificationsModal()">Tout marquer comme lu</button>` : ''}
                            <button class="modal-close" onclick="this.closest('#notificationsModal').remove()">×</button>
                        </div>
                    </div>
                    <div class="notifications-modal-body">
                        ${this.renderNotificationsList()}
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Marquer comme lues quand on ouvre le centre
        this.markAllAsRead();
    }

    renderNotificationsList() {
        if (this.notifications.length === 0) {
            return `
                <div class="notifications-empty">
                    <svg viewBox="0 0 24 24">
                        <path d="M16.5 18.5v-5.5a4.5 4.5 0 0 0-9 0v5.5H5v-5.5a6 6 0 1 1 12 0v5.5h-2.5Z"/>
                        <path d="M8.5 18.5h-2v-5.5a4.5 4.5 0 0 1 9 0v5.5h-2"/>
                        <path d="M9 20.5h6"/>
                    </svg>
                    <p>Aucune notification pour le moment</p>
                </div>
            `;
        }
        
        return this.notifications.map(notif => `
            <div class="notification-item ${notif.read ? '' : 'unread'}" data-id="${notif.id}" onclick="notificationsModule.handleNotificationClick(${notif.id}, '${notif.type}', ${notif.postId || null})">
                <div class="notification-avatar">
                    ${notif.avatar ? (notif.avatar.startsWith('http') ? `<img src="${notif.avatar}">` : notif.avatar) : '👤'}
                </div>
                <div class="notification-content">
                    <div class="notification-message">${notif.message}</div>
                    <div class="notification-time">${this.getTimeAgo(notif.timestamp)}</div>
                </div>
                ${notif.postImage ? `<img src="${notif.postImage}" class="notification-image">` : ''}
                ${!notif.read ? '<div class="notification-dot"></div>' : ''}
            </div>
        `).join('');
    }

    // ========== GESTION DES CLICS ==========
    handleNotificationClick(notifId, type, postId) {
        this.markAsRead(notifId);
        
        if (type === 'like' || type === 'comment') {
            // Rediriger vers le post
            const post = document.querySelector(`.post[data-post-id="${postId}"]`);
            if (post) {
                post.scrollIntoView({ behavior: 'smooth' });
                post.style.animation = 'highlightPost 1s ease';
                setTimeout(() => post.style.animation = '', 1000);
            }
        } else if (type === 'follow') {
            // Rediriger vers le profil
            window.location.href = 'profil.html';
        }
        
        document.getElementById('notificationsModal')?.remove();
    }

    // ========== ÉCOUTEURS TEMPS RÉEL ==========
    setupRealtimeListeners() {
        // Écouter les likes
        window.addEventListener('floy-like-toggled', (e) => {
            if (e.detail.liked && e.detail.userId !== this.getCurrentUser().id) {
                this.addNotification('like', {
                    userId: e.detail.userId,
                    username: e.detail.username,
                    avatar: e.detail.avatar,
                    postId: e.detail.postId
                });
            }
        });
        
        // Écouter les commentaires
        window.addEventListener('floy-comment-added', (e) => {
            this.addNotification('comment', {
                userId: e.detail.userId,
                username: e.detail.username,
                avatar: e.detail.avatar,
                postId: e.detail.postId,
                commentPreview: e.detail.commentText.substring(0, 50)
            });
        });
        
        // Écouter les follow (à implémenter)
        window.addEventListener('floy-follow', (e) => {
            this.addNotification('follow', {
                userId: e.detail.userId,
                username: e.detail.username,
                avatar: e.detail.avatar
            });
        });
    }

    checkForNewNotifications() {
        // Simulation de nouvelles notifications (à remplacer par API)
        console.log("🔔 Vérification des nouvelles notifications...");
    }

    // ========== TOAST NOTIFICATION ==========
    showToast(notif) {
        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        toast.innerHTML = `
            <div class="toast-icon">${notif.type === 'like' ? '❤️' : notif.type === 'comment' ? '💬' : '🔔'}</div>
            <div class="toast-content">
                <strong>${notif.username}</strong>
                <span>${notif.message}</span>
            </div>
        `;
        toast.onclick = () => {
            toast.remove();
            this.showNotificationsModal();
        };
        
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    // ========== UTILITAIRES ==========
    getCurrentUser() {
        const saved = localStorage.getItem('floy_user');
        if (saved) return JSON.parse(saved);
        return { id: 1, username: "floy_user", avatar: "F" };
    }

    getTimeAgo(timestamp) {
        const diff = Math.floor((Date.now() - timestamp) / 1000);
        if (diff < 60) return "à l'instant";
        if (diff < 3600) return `${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
        return `${Math.floor(diff / 86400)} j`;
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    notifyListeners(notif) {
        this.listeners.forEach(cb => cb(notif));
    }
}

const notificationsModule = new NotificationsModule();
window.notificationsModule = notificationsModule;

// ========== STYLES CSS ==========
const notifStyles = `
    .notif-badge {
        position: absolute;
        top: -5px;
        right: -5px;
        background: #FF6B35;
        color: white;
        font-size: 10px;
        font-weight: bold;
        padding: 2px 6px;
        border-radius: 10px;
        min-width: 18px;
        text-align: center;
    }
    
    .notifications-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 3000;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .notifications-modal-content {
        background: #000;
        border-radius: 16px;
        width: 450px;
        max-width: 90%;
        max-height: 80%;
        display: flex;
        flex-direction: column;
        border: 1px solid #262626;
    }
    
    .notifications-modal-header {
        padding: 16px;
        border-bottom: 1px solid #262626;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .notifications-modal-header h3 {
        font-size: 18px;
    }
    
    .notifications-header-actions {
        display: flex;
        gap: 12px;
        align-items: center;
    }
    
    .mark-all-read {
        background: none;
        border: none;
        color: #FF6B35;
        font-size: 12px;
        cursor: pointer;
    }
    
    .notifications-modal-body {
        flex: 1;
        overflow-y: auto;
        padding: 8px 0;
    }
    
    .notifications-empty {
        text-align: center;
        padding: 60px 20px;
        color: #8e8e8e;
    }
    
    .notifications-empty svg {
        width: 60px;
        height: 60px;
        margin-bottom: 16px;
        stroke: #8e8e8e;
    }
    
    .notification-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        cursor: pointer;
        transition: background 0.2s;
        position: relative;
    }
    
    .notification-item:hover {
        background: #1a1a1a;
    }
    
    .notification-item.unread {
        background: rgba(255,107,53,0.1);
    }
    
    .notification-avatar {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: #FF6B35;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        overflow: hidden;
        flex-shrink: 0;
    }
    
    .notification-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .notification-content {
        flex: 1;
    }
    
    .notification-message {
        font-size: 14px;
        margin-bottom: 4px;
    }
    
    .notification-time {
        font-size: 11px;
        color: #8e8e8e;
    }
    
    .notification-image {
        width: 44px;
        height: 44px;
        border-radius: 8px;
        object-fit: cover;
    }
    
    .notification-dot {
        width: 10px;
        height: 10px;
        background: #FF6B35;
        border-radius: 50%;
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
    }
    
    /* Toast notification */
    .notification-toast {
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: #1a1a1a;
        border-radius: 12px;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 4000;
        cursor: pointer;
        transition: 0.3s;
        border: 1px solid #262626;
        max-width: 90%;
    }
    
    .notification-toast.show {
        transform: translateX(-50%) translateY(0);
    }
    
    .toast-icon {
        font-size: 24px;
    }
    
    .toast-content {
        display: flex;
        flex-direction: column;
    }
    
    .toast-content strong {
        font-size: 14px;
    }
    
    .toast-content span {
        font-size: 12px;
        color: #8e8e8e;
    }
    
    @keyframes highlightPost {
        0% { background: rgba(255,107,53,0.2); }
        100% { background: transparent; }
    }
`;

if (!document.getElementById('notif-styles')) {
    const style = document.createElement('style');
    style.id = 'notif-styles';
    style.textContent = notifStyles;
    document.head.appendChild(style);
}
