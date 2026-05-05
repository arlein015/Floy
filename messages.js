// ========================
// MODULE MESSAGES PRIVÉS - FLOY
// Messagerie instantanée
// ========================

class MessagesModule {
    constructor() {
        this.conversations = [];
        this.currentConversation = null;
        this.loadFromStorage();
    }

    loadFromStorage() {
        const saved = localStorage.getItem('floy_messages');
        if (saved) {
            this.conversations = JSON.parse(saved);
        }
    }

    saveToStorage() {
        localStorage.setItem('floy_messages', JSON.stringify(this.conversations));
    }

    // ========== OUVERTURE DE LA MESSAGERIE ==========
    openMessagesModal() {
        const modalHtml = `
            <div id="messagesModal" class="messages-modal">
                <div class="messages-modal-content">
                    <div class="messages-modal-header">
                        <h3>Messages</h3>
                        <button class="new-message-btn" onclick="messagesModule.openNewMessageModal()">✏️</button>
                        <button class="modal-close" onclick="this.closest('#messagesModal').remove()">×</button>
                    </div>
                    <div class="messages-modal-body">
                        <div class="conversations-list" id="conversationsList">
                            ${this.renderConversationsList()}
                        </div>
                        <div class="chat-area" id="chatArea" style="display:none;">
                            <div class="chat-header" id="chatHeader"></div>
                            <div class="chat-messages" id="chatMessages"></div>
                            <div class="chat-input-area">
                                <button class="chat-emoji-btn" onclick="messagesModule.openEmojiPicker()">😊</button>
                                <input type="text" id="chatInput" placeholder="Message..." onkeypress="if(event.key==='Enter') messagesModule.sendMessage()">
                                <button class="chat-send-btn" onclick="messagesModule.sendMessage()">➤</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Sélectionner la première conversation par défaut
        if (this.conversations.length > 0) {
            this.openConversation(this.conversations[0].userId);
        }
    }

    renderConversationsList() {
        if (this.conversations.length === 0) {
            return `
                <div class="conversations-empty">
                    <svg viewBox="0 0 24 24">
                        <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"/>
                    </svg>
                    <p>Aucune conversation</p>
                    <button onclick="messagesModule.openNewMessageModal()">Nouveau message</button>
                </div>
            `;
        }
        
        return this.conversations.map(conv => `
            <div class="conversation-item" data-user-id="${conv.userId}" onclick="messagesModule.openConversation(${conv.userId})">
                <div class="conv-avatar">${conv.avatar || conv.username.charAt(0)}</div>
                <div class="conv-info">
                    <div class="conv-username">${conv.username}</div>
                    <div class="conv-last-message">${conv.lastMessage?.substring(0, 30) || ''}</div>
                </div>
                ${conv.unreadCount > 0 ? `<div class="conv-unread">${conv.unreadCount}</div>` : ''}
            </div>
        `).join('');
    }

    // ========== OUVRIR UNE CONVERSATION ==========
    openConversation(userId) {
        this.currentConversation = this.conversations.find(c => c.userId === userId);
        if (!this.currentConversation) return;
        
        // Marquer comme lu
        this.currentConversation.unreadCount = 0;
        this.saveToStorage();
        
        const chatArea = document.getElementById('chatArea');
        const conversationsList = document.querySelector('.conversations-list');
        const chatHeader = document.getElementById('chatHeader');
        const chatMessages = document.getElementById('chatMessages');
        
        conversationsList.style.display = 'none';
        chatArea.style.display = 'flex';
        
        chatHeader.innerHTML = `
            <button class="back-to-list" onclick="messagesModule.backToList()">←</button>
            <div class="chat-user-info">
                <div class="chat-user-avatar">${this.currentConversation.avatar || this.currentConversation.username.charAt(0)}</div>
                <div class="chat-user-name">${this.currentConversation.username}</div>
            </div>
        `;
        
        chatMessages.innerHTML = this.currentConversation.messages?.map(msg => `
            <div class="message ${msg.senderId === this.getCurrentUser().id ? 'sent' : 'received'}">
                <div class="message-text">${this.escapeHtml(msg.text)}</div>
                <div class="message-time">${this.getTimeAgo(msg.timestamp)}</div>
            </div>
        `).join('') || '<div class="no-messages">Envoyez un premier message</div>';
        
        // Scroll en bas
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    backToList() {
        const chatArea = document.getElementById('chatArea');
        const conversationsList = document.querySelector('.conversations-list');
        conversationsList.style.display = 'block';
        chatArea.style.display = 'none';
        this.renderConversationsList();
    }

    // ========== ENVOYER UN MESSAGE ==========
    sendMessage() {
        const input = document.getElementById('chatInput');
        const text = input.value.trim();
        if (!text || !this.currentConversation) return;
        
        const currentUser = this.getCurrentUser();
        const newMessage = {
            id: Date.now(),
            senderId: currentUser.id,
            text: text,
            timestamp: Date.now(),
            read: false
        };
        
        if (!this.currentConversation.messages) this.currentConversation.messages = [];
        this.currentConversation.messages.push(newMessage);
        this.currentConversation.lastMessage = text;
        this.currentConversation.lastMessageTime = Date.now();
        
        this.saveToStorage();
        input.value = '';
        
        // Rafraîchir l'affichage
        this.openConversation(this.currentConversation.userId);
    }

    // ========== NOUVELLE CONVERSATION ==========
    openNewMessageModal() {
        const modalHtml = `
            <div id="newMessageModal" class="new-message-modal">
                <div class="new-message-content">
                    <div class="new-message-header">
                        <h3>Nouveau message</h3>
                        <button onclick="this.closest('#newMessageModal').remove()">×</button>
                    </div>
                    <div class="new-message-body">
                        <input type="text" id="searchUserInput" placeholder="Rechercher un utilisateur..." onkeyup="messagesModule.searchUsers(this.value)">
                        <div id="searchResults" class="search-results"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Charger des utilisateurs suggérés
        this.searchUsers('');
    }

    searchUsers(query) {
        // Utilisateurs simulés (à remplacer par API)
        const users = [
            { id: 2, username: "artiste_orange", avatar: "A" },
            { id: 3, username: "photographe", avatar: "P" },
            { id: 4, username: "design_noir", avatar: "D" },
            { id: 5, username: "voyageur", avatar: "V" }
        ];
        
        const filtered = users.filter(u => u.username.toLowerCase().includes(query.toLowerCase()));
        const resultsDiv = document.getElementById('searchResults');
        
        resultsDiv.innerHTML = filtered.map(user => `
            <div class="search-result-item" onclick="messagesModule.startConversation(${user.id}, '${user.username}', '${user.avatar}')">
                <div class="result-avatar">${user.avatar}</div>
                <div class="result-name">${user.username}</div>
            </div>
        `).join('');
    }

    startConversation(userId, username, avatar) {
        // Vérifier si la conversation existe déjà
        let conv = this.conversations.find(c => c.userId === userId);
        
        if (!conv) {
            conv = {
                userId: userId,
                username: username,
                avatar: avatar,
                messages: [],
                lastMessage: null,
                unreadCount: 0
            };
            this.conversations.push(conv);
            this.saveToStorage();
        }
        
        document.getElementById('newMessageModal')?.remove();
        this.openMessagesModal();
        setTimeout(() => this.openConversation(userId), 100);
    }

    // ========== EMOJI PICKER ==========
    openEmojiPicker() {
        const emojis = ['😀', '😂', '❤️', '🔥', '👍', '😍', '🎉', '😢', '😎', '✨', '💯', '🔝', '🥰', '😘', '🤣'];
        const picker = document.createElement('div');
        picker.className = 'message-emoji-picker';
        picker.innerHTML = emojis.map(e => `<span onclick="messagesModule.addEmojiToInput('${e}'); this.parentElement.remove()">${e}</span>`).join('');
        document.querySelector('.chat-input-area').appendChild(picker);
        setTimeout(() => picker.remove(), 3000);
    }

    addEmojiToInput(emoji) {
        const input = document.getElementById('chatInput');
        if (input) {
            input.value += emoji;
            input.focus();
        }
    }

    // ========== UTILITAIRES ==========
    getCurrentUser() {
        const saved = localStorage.getItem('floy_user');
        if (saved) return JSON.parse(saved);
        return { id: 1, username: "floy_user", avatar: "F" };
    }

    getTimeAgo(timestamp) {
        const diff = Math.floor((Date.now() - timestamp) / 1000);
        if (diff < 60) return "maintenant";
        if (diff < 3600) return `${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
        return `${Math.floor(diff / 86400)} j`;
    }

    escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m]));
    }
}

const messagesModule = new MessagesModule();
window.messagesModule = messagesModule;

// ========== STYLES CSS ==========
const messagesStyles = `
    .messages-modal {
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
    
    .messages-modal-content {
        background: #000;
        border-radius: 16px;
        width: 800px;
        max-width: 90%;
        height: 600px;
        max-height: 80%;
        display: flex;
        flex-direction: column;
        border: 1px solid #262626;
    }
    
    .messages-modal-header {
        padding: 16px;
        border-bottom: 1px solid #262626;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .messages-modal-header h3 {
        font-size: 18px;
    }
    
    .new-message-btn {
        background: none;
        border: none;
        color: #FF6B35;
        font-size: 20px;
        cursor: pointer;
    }
    
    .messages-modal-body {
        flex: 1;
        display: flex;
        overflow: hidden;
    }
    
    .conversations-list {
        width: 300px;
        border-right: 1px solid #262626;
        overflow-y: auto;
    }
    
    .conversations-empty {
        text-align: center;
        padding: 60px 20px;
        color: #8e8e8e;
    }
    
    .conversations-empty svg {
        width: 50px;
        height: 50px;
        margin-bottom: 16px;
    }
    
    .conversations-empty button {
        background: #FF6B35;
        border: none;
        padding: 8px 20px;
        border-radius: 8px;
        color: white;
        margin-top: 16px;
        cursor: pointer;
    }
    
    .conversation-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        cursor: pointer;
        transition: background 0.2s;
    }
    
    .conversation-item:hover {
        background: #1a1a1a;
    }
    
    .conv-avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #FF6B35;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
    }
    
    .conv-info {
        flex: 1;
    }
    
    .conv-username {
        font-weight: 600;
        margin-bottom: 4px;
    }
    
    .conv-last-message {
        font-size: 12px;
        color: #8e8e8e;
    }
    
    .conv-unread {
        background: #FF6B35;
        color: white;
        font-size: 11px;
        padding: 2px 6px;
        border-radius: 10px;
    }
    
    .chat-area {
        flex: 1;
        display: flex;
        flex-direction: column;
    }
    
    .chat-header {
        padding: 16px;
        border-bottom: 1px solid #262626;
        display: flex;
        align-items: center;
        gap: 16px;
    }
    
    .back-to-list {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
    }
    
    .chat-user-info {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .chat-user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #FF6B35;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
    }
    
    .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    
    .message {
        max-width: 70%;
        padding: 10px 14px;
        border-radius: 20px;
        position: relative;
    }
    
    .message.sent {
        align-self: flex-end;
        background: #FF6B35;
        color: white;
        border-bottom-right-radius: 4px;
    }
    
    .message.received {
        align-self: flex-start;
        background: #1a1a1a;
        border-bottom-left-radius: 4px;
    }
    
    .message-text {
        font-size: 14px;
        word-break: break-word;
    }
    
    .message-time {
        font-size: 10px;
        margin-top: 4px;
        opacity: 0.7;
    }
    
    .no-messages {
        text-align: center;
        color: #8e8e8e;
        padding: 40px;
    }
    
    .chat-input-area {
        padding: 16px;
        border-top: 1px solid #262626;
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .chat-emoji-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
    }
    
    .chat-input-area input {
        flex: 1;
        background: #1a1a1a;
        border: 1px solid #262626;
        border-radius: 20px;
        padding: 10px 16px;
        color: white;
        outline: none;
    }
    
    .chat-send-btn {
        background: none;
        border: none;
        color: #FF6B35;
        font-size: 20px;
        cursor: pointer;
    }
    
    .message-emoji-picker {
        position: absolute;
        bottom: 70px;
        left: 20px;
        background: #1a1a1a;
        border: 1px solid #262626;
        border-radius: 12px;
        padding: 8px;
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 4px;
        z-index: 100;
    }
    
    .message-emoji-picker span {
        cursor: pointer;
        font-size: 20px;
        padding: 4px;
    }
    
    .new-message-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 3500;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .new-message-content {
        background: #000;
        border-radius: 16px;
        width: 350px;
        border: 1px solid #262626;
    }
    
    .new-message-header {
        padding: 16px;
        border-bottom: 1px solid #262626;
        display: flex;
        justify-content: space-between;
    }
    
    .new-message-body {
        padding: 16px;
    }
    
    .new-message-body input {
        width: 100%;
        background: #1a1a1a;
        border: 1px solid #262626;
        border-radius: 8px;
        padding: 12px;
        color: white;
        margin-bottom: 16px;
    }
    
    .search-results {
        max-height: 300px;
        overflow-y: auto;
    }
    
    .search-result-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px;
        cursor: pointer;
        border-radius: 8px;
    }
    
    .search-result-item:hover {
        background: #1a1a1a;
    }
    
    .result-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #FF6B35;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
    }
`;

if (!document.getElementById('messages-styles')) {
    const style = document.createElement('style');
    style.id = 'messages-styles';
    style.textContent = messagesStyles;
    document.head.appendChild(style);
}
