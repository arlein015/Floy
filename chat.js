// ========================
// MODULE CHAT - FLOY
// Messagerie instantanée complète
// ========================

class ChatModule {
    constructor() {
        this.conversations = [];
        this.currentConversation = null;
        this.currentUser = null;
        this.typingTimeout = null;
        this.isTyping = false;
        this.unreadCount = 0;
        this.observers = [];
        this.loadFromStorage();
        this.setupRealtimeListeners();
    }

    // ========== CHARGEMENT/SAUVEGARDE ==========
    loadFromStorage() {
        const saved = localStorage.getItem('floy_chat_conversations');
        if (saved) {
            this.conversations = JSON.parse(saved);
        } else {
            this.initMockConversations();
        }
        
        const savedUser = localStorage.getItem('floy_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        } else {
            this.currentUser = { id: 1, username: "floy_user", avatar: "F" };
        }
        
        this.updateUnreadCount();
    }

    saveToStorage() {
        localStorage.setItem('floy_chat_conversations', JSON.stringify(this.conversations));
    }

    initMockConversations() {
        this.conversations = [
            {
                id: "conv_1",
                userId: 2,
                username: "artiste_orange",
                fullname: "Artiste Orange",
                avatar: "A",
                avatarUrl: null,
                lastMessage: "Super ton post ! 🔥",
                lastTime: Date.now() - 3600000,
                unreadCount: 2,
                typing: false,
                online: true,
                lastSeen: Date.now() - 600000,
                messages: [
                    { id: 1, senderId: 2, text: "Salut ! Super ton post 🔥", timestamp: Date.now() - 3600000, read: false, type: "text" },
                    { id: 2, senderId: 1, text: "Merci beaucoup ! 😊", timestamp: Date.now() - 3500000, read: true, type: "text" },
                    { id: 3, senderId: 2, text: "Tu fais de superbes photos", timestamp: Date.now() - 3400000, read: false, type: "text" }
                ]
            },
            {
                id: "conv_2",
                userId: 3,
                username: "photographe",
                fullname: "Le Photographe",
                avatar: "P",
                avatarUrl: null,
                lastMessage: "J'adore !",
                lastTime: Date.now() - 86400000,
                unreadCount: 0,
                typing: false,
                online: false,
                lastSeen: Date.now() - 7200000,
                messages: [
                    { id: 1, senderId: 1, text: "Salut !", timestamp: Date.now() - 86400000, read: true, type: "text" },
                    { id: 2, senderId: 3, text: "J'adore tes photos !", timestamp: Date.now() - 86000000, read: true, type: "text" },
                    { id: 3, senderId: 1, text: "Merci !", timestamp: Date.now() - 85000000, read: true, type: "text" }
                ]
            },
            {
                id: "conv_3",
                userId: 4,
                username: "design_noir",
                fullname: "Design Noir",
                avatar: "D",
                avatarUrl: null,
                lastMessage: "👌 Parfait",
                lastTime: Date.now() - 172800000,
                unreadCount: 0,
                typing: false,
                online: false,
                lastSeen: Date.now() - 86400000,
                messages: []
            }
        ];
        this.saveToStorage();
    }

    // ========== MESSAGERIE ==========
    getConversations() {
        return [...this.conversations].sort((a, b) => b.lastTime - a.lastTime);
    }

    getConversation(userId) {
        return this.conversations.find(c => c.userId === userId);
    }

    getOrCreateConversation(userId, username, avatar) {
        let conv = this.getConversation(userId);
        if (!conv) {
            conv = {
                id: `conv_${Date.now()}`,
                userId: userId,
                username: username,
                fullname: username,
                avatar: avatar,
                avatarUrl: null,
                lastMessage: null,
                lastTime: Date.now(),
                unreadCount: 0,
                typing: false,
                online: false,
                lastSeen: null,
                messages: []
            };
            this.conversations.push(conv);
            this.saveToStorage();
        }
        return conv;
    }

    sendMessage(userId, text, type = "text") {
        if (!text.trim() && type === "text") return null;
        
        let conv = this.getConversation(userId);
        if (!conv) return null;
        
        const newMessage = {
            id: Date.now(),
            senderId: this.currentUser.id,
            text: type === "text" ? text.trim() : text,
            timestamp: Date.now(),
            read: false,
            type: type
        };
        
        conv.messages.push(newMessage);
        conv.lastMessage = type === "text" ? text.trim() : (type === "image" ? "📷 Photo" : "🎥 Vidéo");
        conv.lastTime = Date.now();
        
        this.saveToStorage();
        this.notifyObservers('newMessage', { userId, message: newMessage });
        this.updateUnreadCount();
        
        return newMessage;
    }

    markAsRead(userId) {
        const conv = this.getConversation(userId);
        if (conv) {
            conv.unreadCount = 0;
            conv.messages.forEach(msg => {
                if (msg.senderId !== this.currentUser.id && !msg.read) {
                    msg.read = true;
                }
            });
            this.saveToStorage();
            this.updateUnreadCount();
            this.notifyObservers('read', { userId });
        }
    }

    markAllAsRead() {
        this.conversations.forEach(conv => {
            conv.unreadCount = 0;
            conv.messages.forEach(msg => {
                if (msg.senderId !== this.currentUser.id && !msg.read) {
                    msg.read = true;
                }
            });
        });
        this.saveToStorage();
        this.updateUnreadCount();
        this.notifyObservers('readAll', {});
    }

    deleteMessage(userId, messageId) {
        const conv = this.getConversation(userId);
        if (conv) {
            conv.messages = conv.messages.filter(m => m.id !== messageId);
            if (conv.messages.length > 0) {
                const lastMsg = conv.messages[conv.messages.length - 1];
                conv.lastMessage = lastMsg.text;
                conv.lastTime = lastMsg.timestamp;
            } else {
                conv.lastMessage = null;
                conv.lastTime = Date.now();
            }
            this.saveToStorage();
            this.notifyObservers('deleteMessage', { userId, messageId });
        }
    }

    deleteConversation(userId) {
        this.conversations = this.conversations.filter(c => c.userId !== userId);
        this.saveToStorage();
        this.updateUnreadCount();
        this.notifyObservers('deleteConversation', { userId });
    }

    // ========== TYPING INDICATOR ==========
    sendTyping(userId) {
        if (this.typingTimeout) clearTimeout(this.typingTimeout);
        
        const conv = this.getConversation(userId);
        if (conv) {
            conv.typing = true;
            this.notifyObservers('typing', { userId, typing: true });
            
            this.typingTimeout = setTimeout(() => {
                if (conv) {
                    conv.typing = false;
                    this.notifyObservers('typing', { userId, typing: false });
                }
            }, 2000);
        }
    }

    // ========== NOTIFICATIONS ==========
    updateUnreadCount() {
        let count = 0;
        this.conversations.forEach(conv => {
            count += conv.unreadCount;
        });
        this.unreadCount = count;
        this.notifyObservers('unreadUpdate', { count });
        
        // Mettre à jour le badge sur l'icône messages
        this.updateMessageBadge();
    }

    updateMessageBadge() {
        const messagesIcon = document.querySelector('.nav-item[data-page="messages"]');
        if (messagesIcon) {
            let badge = messagesIcon.querySelector('.msg-badge');
            if (this.unreadCount > 0) {
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'msg-badge';
                    messagesIcon.appendChild(badge);
                }
                badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
                badge.style.display = 'flex';
            } else if (badge) {
                badge.style.display = 'none';
            }
        }
    }

    // ========== RENDU HTML ==========
    renderConversationsList(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const conversations = this.getConversations();
        
        if (conversations.length === 0) {
            container.innerHTML = `
                <div class="chat-empty-state">
                    <div class="chat-empty-icon">💬</div>
                    <p>Aucune conversation</p>
                    <button class="chat-new-msg-btn" onclick="chatModule.openNewMessageModal()">Nouveau message</button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = conversations.map(conv => `
            <div class="chat-conversation-item ${this.currentConversation?.userId === conv.userId ? 'active' : ''}" 
                 data-user-id="${conv.userId}" 
                 onclick="chatModule.selectConversation(${conv.userId})">
                <div class="chat-conv-avatar">
                    ${conv.avatarUrl ? `<img src="${conv.avatarUrl}">` : conv.avatar}
                    ${conv.online ? '<span class="chat-online-dot"></span>' : ''}
                </div>
                <div class="chat-conv-info">
                    <div class="chat-conv-name">${conv.username}</div>
                    <div class="chat-conv-lastmsg">${conv.lastMessage || 'Nouvelle conversation'}</div>
                </div>
                <div class="chat-conv-meta">
                    <div class="chat-conv-time">${this.formatTime(conv.lastTime)}</div>
                    ${conv.unreadCount > 0 ? `<div class="chat-conv-unread">${conv.unreadCount}</div>` : ''}
                </div>
                ${conv.typing ? '<div class="chat-typing-indicator">...</div>' : ''}
            </div>
        `).join('');
    }

    renderChatArea(containerId) {
        const container = document.getElementById(containerId);
        if (!container || !this.currentConversation) {
            if (container) {
                container.innerHTML = `
                    <div class="chat-empty-area">
                        <div class="chat-empty-icon">💬</div>
                        <p>Sélectionnez une conversation</p>
                        <button class="chat-new-msg-btn" onclick="chatModule.openNewMessageModal()">Nouveau message</button>
                    </div>
                `;
            }
            return;
        }
        
        const conv = this.currentConversation;
        
        container.innerHTML = `
            <div class="chat-header">
                <div class="chat-header-left">
                    <button class="chat-back-btn" onclick="chatModule.showConversationsList()">←</button>
                    <div class="chat-header-avatar">
                        ${conv.avatarUrl ? `<img src="${conv.avatarUrl}">` : conv.avatar}
                    </div>
                    <div class="chat-header-info">
                        <div class="chat-header-name">${conv.username}</div>
                        <div class="chat-header-status">
                            ${conv.typing ? 'En train d\'écrire...' : (conv.online ? 'En ligne' : `Vu ${this.formatTime(conv.lastSeen)}`)}
                        </div>
                    </div>
                </div>
                <div class="chat-header-actions">
                    <button class="chat-header-btn" onclick="chatModule.showConversationOptions()">⋮</button>
                </div>
            </div>
            
            <div class="chat-messages" id="chatMessagesContainer">
                ${this.renderMessages()}
            </div>
            
            <div class="chat-input-container">
                <button class="chat-emoji-btn" onclick="chatModule.openEmojiPicker()">😊</button>
                <button class="chat-attach-btn" onclick="chatModule.openAttachMenu()">📎</button>
                <div class="chat-input-wrapper">
                    <input type="text" class="chat-input" id="chatMessageInput" 
                           placeholder="Message..." 
                           onkeypress="if(event.key==='Enter') chatModule.sendCurrentMessage()"
                           oninput="chatModule.onTyping()">
                </div>
                <button class="chat-send-btn" onclick="chatModule.sendCurrentMessage()">📤</button>
            </div>
        `;
        
        // Scroll en bas
        const messagesDiv = document.getElementById('chatMessagesContainer');
        if (messagesDiv) messagesDiv.scrollTop = messagesDiv.scrollHeight;
        
        // Focus sur l'input
        document.getElementById('chatMessageInput')?.focus();
    }

    renderMessages() {
        if (!this.currentConversation || !this.currentConversation.messages || this.currentConversation.messages.length === 0) {
            return '<div class="chat-no-messages">Envoyez un premier message</div>';
        }
        
        let lastDate = null;
        
        return this.currentConversation.messages.map(msg => {
            const msgDate = new Date(msg.timestamp);
            const today = new Date();
            const showDate = !lastDate || new Date(lastDate).toDateString() !== msgDate.toDateString();
            lastDate = msg.timestamp;
            
            const isSent = msg.senderId === this.currentUser.id;
            const timeStr = this.formatMessageTime(msg.timestamp);
            const dateStr = this.formatMessageDate(msg.timestamp);
            
            let contentHtml = '';
            if (msg.type === 'image') {
                contentHtml = `<img src="${msg.text}" class="chat-message-image" onclick="window.open('${msg.text}')">`;
            } else if (msg.type === 'video') {
                contentHtml = `<video src="${msg.text}" class="chat-message-video" controls></video>`;
            } else {
                contentHtml = msg.text;
            }
            
            return `
                ${showDate ? `<div class="chat-date-separator">${dateStr}</div>` : ''}
                <div class="chat-message ${isSent ? 'sent' : 'received'}">
                    <div class="chat-message-bubble">
                        <div class="chat-message-content">${this.escapeHtml(contentHtml)}</div>
                        <div class="chat-message-time">${timeStr}</div>
                    </div>
                    ${!msg.read && isSent ? '<div class="chat-message-status">✓✓</div>' : ''}
                </div>
            `;
        }).join('');
    }

    // ========== ACTIONS ==========
    selectConversation(userId) {
        this.currentConversation = this.getConversation(userId);
        if (this.currentConversation) {
            this.markAsRead(userId);
            this.notifyObservers('conversationSelected', { userId });
        }
    }

    sendCurrentMessage() {
        const input = document.getElementById('chatMessageInput');
        if (input && input.value.trim()) {
            this.sendMessage(this.currentConversation.userId, input.value);
            input.value = '';
            this.renderChatArea('chatAreaContainer');
        }
    }

    onTyping() {
        if (this.currentConversation) {
            this.sendTyping(this.currentConversation.userId);
        }
    }

    // ========== MODALS ==========
    openNewMessageModal() {
        const modalHtml = `
            <div id="newChatModal" class="chat-modal">
                <div class="chat-modal-content">
                    <div class="chat-modal-header">
                        <h3>Nouveau message</h3>
                        <button class="chat-modal-close" onclick="this.closest('#newChatModal').remove()">&times;</button>
                    </div>
                    <div class="chat-modal-body">
                        <input type="text" id="chatSearchUser" placeholder="Rechercher un utilisateur..." 
                               class="chat-search-input" onkeyup="chatModule.searchUsers(this.value)">
                        <div id="chatSearchResults" class="chat-search-results"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.searchUsers('');
    }

    searchUsers(query) {
        const suggestedUsers = [
            { id: 2, username: "artiste_orange", fullname: "Artiste Orange", avatar: "A" },
            { id: 3, username: "photographe", fullname: "Le Photographe", avatar: "P" },
            { id: 4, username: "design_noir", fullname: "Design Noir", avatar: "D" },
            { id: 5, username: "voyageur", fullname: "Grand Voyageur", avatar: "V" }
        ];
        
        const filtered = suggestedUsers.filter(u => 
            u.username.toLowerCase().includes(query.toLowerCase()) && u.id !== this.currentUser.id
        );
        
        const resultsDiv = document.getElementById('chatSearchResults');
        if (resultsDiv) {
            if (filtered.length === 0 && query.length > 0) {
                resultsDiv.innerHTML = '<div class="chat-no-results">Aucun utilisateur trouvé</div>';
            } else {
                resultsDiv.innerHTML = filtered.map(user => `
                    <div class="chat-search-result" onclick="chatModule.startNewConversation(${user.id}, '${user.username}', '${user.avatar}'); document.getElementById('newChatModal')?.remove()">
                        <div class="chat-result-avatar">${user.avatar}</div>
                        <div class="chat-result-info">
                            <div class="chat-result-name">${user.username}</div>
                            <div class="chat-result-fullname">${user.fullname}</div>
                        </div>
                    </div>
                `).join('');
            }
        }
    }

    startNewConversation(userId, username, avatar) {
        const conv = this.getOrCreateConversation(userId, username, avatar);
        this.selectConversation(userId);
        this.notifyObservers('conversationSelected', { userId });
    }

    openEmojiPicker() {
        const emojis = ['😀', '😂', '❤️', '🔥', '👍', '😍', '🎉', '😢', '😎', '✨', '💯', '🔝', '🥰', '😘', '🤣', '😱', '🥺', '👏', '🙏'];
        const picker = document.createElement('div');
        picker.className = 'chat-emoji-picker';
        picker.innerHTML = emojis.map(e => `<span onclick="chatModule.addEmoji('${e}'); this.parentElement.remove()">${e}</span>`).join('');
        document.querySelector('.chat-input-container')?.appendChild(picker);
        setTimeout(() => picker.remove(), 3000);
    }

    addEmoji(emoji) {
        const input = document.getElementById('chatMessageInput');
        if (input) {
            input.value += emoji;
            input.focus();
        }
    }

    openAttachMenu() {
        const menuHtml = `
            <div id="attachMenu" class="chat-attach-menu">
                <button onclick="chatModule.sendImage(); document.getElementById('attachMenu')?.remove()">📷 Photo</button>
                <button onclick="chatModule.sendVideo(); document.getElementById('attachMenu')?.remove()">🎥 Vidéo</button>
                <button onclick="document.getElementById('attachMenu')?.remove()">❌ Annuler</button>
            </div>
        `;
        document.querySelector('.chat-input-container')?.insertAdjacentHTML('beforeend', menuHtml);
        setTimeout(() => document.getElementById('attachMenu')?.remove(), 5000);
    }

    sendImage() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file && this.currentConversation) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    this.sendMessage(this.currentConversation.userId, ev.target.result, 'image');
                    this.renderChatArea('chatAreaContainer');
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    }

    sendVideo() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file && this.currentConversation) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    this.sendMessage(this.currentConversation.userId, ev.target.result, 'video');
                    this.renderChatArea('chatAreaContainer');
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    }

    showConversationOptions() {
        const options = [
            { label: "Supprimer la conversation", action: () => this.deleteConversation(this.currentConversation.userId) },
            { label: "Bloquer l'utilisateur", action: () => alert(`🚫 ${this.currentConversation.username} bloqué`) },
            { label: "Annuler", action: () => {} }
        ];
        
        const menuHtml = `
            <div id="convOptions" class="chat-options-menu">
                ${options.map(opt => `<button onclick="chatModule.handleOption('${opt.label}', this); ${opt.action.toString().includes('alert') ? 'alert' : ''}">${opt.label}</button>`).join('')}
            </div>
        `;
        document.querySelector('.chat-header-actions')?.insertAdjacentHTML('beforeend', menuHtml);
        setTimeout(() => document.getElementById('convOptions')?.remove(), 3000);
    }

    handleOption(label, btn) {
        if (label === "Supprimer la conversation") {
            if (confirm(`Supprimer la conversation avec ${this.currentConversation?.username} ?`)) {
                this.deleteConversation(this.currentConversation.userId);
                this.currentConversation = null;
                this.notifyObservers('conversationDeleted', {});
            }
        }
        document.getElementById('convOptions')?.remove();
    }

    // ========== OBSERVATEURS ==========
    subscribe(callback) {
        this.observers.push(callback);
    }

    notifyObservers(event, data) {
        this.observers.forEach(cb => cb(event, data));
    }

    setupRealtimeListeners() {
        // Simulation WebSocket - vérifie les nouveaux messages
        setInterval(() => {
            // Simuler des messages entrants (à remplacer par vrai WebSocket)
        }, 5000);
    }

    // ========== UTILITAIRES ==========
    formatTime(timestamp) {
        if (!timestamp) return '';
        const diff = Math.floor((Date.now() - timestamp) / 1000);
        if (diff < 60) return "maintenant";
        if (diff < 3600) return `${Math.floor(diff/60)} min`;
        if (diff < 86400) return `${Math.floor(diff/3600)} h`;
        return `${Math.floor(diff/86400)} j`;
    }

    formatMessageTime(timestamp) {
        const date = new Date(timestamp);
        return `${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;
    }

    formatMessageDate(timestamp) {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
        if (date.toDateString() === yesterday.toDateString()) return "Hier";
        return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`;
    }

    escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m]));
    }
}

// ========== STYLES CSS ==========
const chatStyles = `
    /* Chat Module Styles */
    .chat-module-container {
        display: flex;
        height: 100%;
        background: #000000;
    }
    
    /* Conversations list */
    .chat-conversations-list {
        width: 350px;
        border-right: 1px solid #262626;
        overflow-y: auto;
        flex-shrink: 0;
    }
    
    .chat-conversation-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        cursor: pointer;
        transition: background 0.2s;
        border-bottom: 1px solid #1a1a1a;
        position: relative;
    }
    
    .chat-conversation-item:hover {
        background: #1a1a1a;
    }
    
    .chat-conversation-item.active {
        background: #1a1a1a;
    }
    
    .chat-conv-avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #FF6B35;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        font-weight: bold;
        position: relative;
        flex-shrink: 0;
    }
    
    .chat-online-dot {
        position: absolute;
        bottom: 2px;
        right: 2px;
        width: 12px;
        height: 12px;
        background: #10B981;
        border-radius: 50%;
        border: 2px solid #000;
    }
    
    .chat-conv-info {
        flex: 1;
        min-width: 0;
    }
    
    .chat-conv-name {
        font-weight: 600;
        margin-bottom: 4px;
    }
    
    .chat-conv-lastmsg {
        font-size: 13px;
        color: #8e8e8e;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .chat-conv-meta {
        text-align: right;
        flex-shrink: 0;
    }
    
    .chat-conv-time {
        font-size: 11px;
        color: #8e8e8e;
        margin-bottom: 4px;
    }
    
    .chat-conv-unread {
        background: #FF6B35;
        color: white;
        font-size: 11px;
        padding: 2px 6px;
        border-radius: 20px;
        min-width: 20px;
        text-align: center;
    }
    
    .chat-typing-indicator {
        position: absolute;
        bottom: 5px;
        right: 10px;
        font-size: 10px;
        color: #FF6B35;
    }
    
    /* Chat area */
    .chat-area {
        flex: 1;
        display: flex;
        flex-direction: column;
        background: #000000;
    }
    
    .chat-empty-area {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 16px;
        color: #8e8e8e;
    }
    
    .chat-empty-icon {
        font-size: 64px;
        opacity: 0.5;
    }
    
    .chat-header {
        padding: 16px;
        border-bottom: 1px solid #262626;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .chat-header-left {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .chat-back-btn {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        display: none;
    }
    
    .chat-header-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #FF6B35;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
    }
    
    .chat-header-name {
        font-weight: 600;
        font-size: 16px;
    }
    
    .chat-header-status {
        font-size: 12px;
        color: #8e8e8e;
    }
    
    .chat-header-btn {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 8px;
    }
    
    /* Messages */
    .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .chat-date-separator {
        text-align: center;
        font-size: 11px;
        color: #8e8e8e;
        margin: 16px 0;
        position: relative;
    }
    
    .chat-date-separator::before,
    .chat-date-separator::after {
        content: '';
        position: absolute;
        top: 50%;
        width: 30%;
        height: 1px;
        background: #262626;
    }
    
    .chat-date-separator::before { left: 0; }
    .chat-date-separator::after { right: 0; }
    
    .chat-message {
        display: flex;
        flex-direction: column;
        max-width: 70%;
    }
    
    .chat-message.sent {
        align-self: flex-end;
    }
    
    .chat-message.received {
        align-self: flex-start;
    }
    
    .chat-message-bubble {
        padding: 10px 14px;
        border-radius: 20px;
        position: relative;
    }
    
    .chat-message.sent .chat-message-bubble {
        background: #FF6B35;
        color: white;
        border-bottom-right-radius: 4px;
    }
    
    .chat-message.received .chat-message-bubble {
        background: #1a1a1a;
        border-bottom-left-radius: 4px;
    }
    
    .chat-message-content {
        font-size: 14px;
        word-break: break-word;
    }
    
    .chat-message-time {
        font-size: 10px;
        margin-top: 4px;
        opacity: 0.7;
    }
    
    .chat-message-status {
        font-size: 10px;
        color: #8e8e8e;
        text-align: right;
        margin-top: 2px;
    }
    
    .chat-message-image {
        max-width: 200px;
        max-height: 200px;
        border-radius: 12px;
        cursor: pointer;
    }
    
    .chat-message-video {
        max-width: 200px;
        max-height: 200px;
        border-radius: 12px;
    }
    
    .chat-no-messages {
        text-align: center;
        color: #8e8e8e;
        padding: 40px;
    }
    
    /* Input */
    .chat-input-container {
        padding: 16px;
        border-top: 1px solid #262626;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .chat-emoji-btn, .chat-attach-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        padding: 8px;
    }
    
    .chat-input-wrapper {
        flex: 1;
    }
    
    .chat-input {
        width: 100%;
        background: #1a1a1a;
        border: 1px solid #262626;
        border-radius: 24px;
        padding: 12px 16px;
        color: white;
        font-size: 15px;
        outline: none;
    }
    
    .chat-input:focus {
        border-color: #FF6B35;
    }
    
    .chat-send-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        padding: 8px;
    }
    
    /* Modals */
    .chat-modal {
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
    
    .chat-modal-content {
        background: #000;
        border-radius: 16px;
        width: 350px;
        max-width: 90%;
        border: 1px solid #262626;
    }
    
    .chat-modal-header {
        padding: 16px;
        border-bottom: 1px solid #262626;
        display: flex;
        justify-content: space-between;
    }
    
    .chat-modal-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
    }
    
    .chat-modal-body {
        padding: 16px;
    }
    
    .chat-search-input {
        width: 100%;
        background: #1a1a1a;
        border: 1px solid #262626;
        border-radius: 8px;
        padding: 12px;
        color: white;
        margin-bottom: 16px;
    }
    
    .chat-search-results {
        max-height: 300px;
        overflow-y: auto;
    }
    
    .chat-search-result {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        cursor: pointer;
        border-radius: 8px;
    }
    
    .chat-search-result:hover {
        background: #1a1a1a;
    }
    
    .chat-result-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #FF6B35;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
    }
    
    .chat-no-results {
        text-align: center;
        padding: 20px;
        color: #8e8e8e;
    }
    
    /* Menus */
    .chat-emoji-picker {
        position: absolute;
        bottom: 80px;
        left: 20px;
        background: #1a1a1a;
        border: 1px solid #262626;
        border-radius: 12px;
        padding: 8px;
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 4px;
        z-index: 150;
    }
    
    .chat-emoji-picker span {
        cursor: pointer;
        font-size: 20px;
        padding: 4px;
    }
    
    .chat-attach-menu, .chat-options-menu {
        position: absolute;
        bottom: 80px;
        right: 20px;
        background: #1a1a1a;
        border: 1px solid #262626;
        border-radius: 12px;
        overflow: hidden;
        z-index: 150;
    }
    
    .chat-attach-menu button, .chat-options-menu button {
        display: block;
        width: 100%;
        padding: 12px 20px;
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        text-align: left;
    }
    
    .chat-attach-menu button:hover, .chat-options-menu button:hover {
        background: #262626;
    }
    
    /* Badge messages dans sidebar */
    .msg-badge {
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
    
    .chat-empty-state {
        text-align: center;
        padding: 60px 20px;
        color: #8e8e8e;
    }
    
    .chat-new-msg-btn {
        background: #FF6B35;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        color: white;
        margin-top: 16px;
        cursor: pointer;
    }
    
    /* Responsive */
    @media (max-width: 700px) {
        .chat-conversations-list {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            z-index: 100;
            background: #000;
            transform: translateX(0);
            transition: transform 0.3s;
        }
        .chat-conversations-list.hide {
            transform: translateX(-100%);
        }
        .chat-back-btn {
            display: block !important;
        }
        .chat-message {
            max-width: 85%;
        }
    }
`;

// Ajouter les styles
if (!document.getElementById('chat-module-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'chat-module-styles';
    styleSheet.textContent = chatStyles;
    document.head.appendChild(styleSheet);
}

// ========== EXPORT ==========
const chatModule = new ChatModule();
window.chatModule = chatModule;

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    console.log("💬 Module Chat chargé");
});
