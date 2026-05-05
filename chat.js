// ========================
// MODULE CHAT - FLOY
// Système de messagerie complet
// ========================

class ChatModule {
    constructor() {
        this.conversations = [];
        this.currentConversation = null;
        this.currentUser = null;
        this.loadFromStorage();
    }

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
    }

    saveToStorage() {
        localStorage.setItem('floy_chat_conversations', JSON.stringify(this.conversations));
    }

    initMockConversations() {
        this.conversations = [
            {
                userId: 2,
                username: "artiste_orange",
                avatar: "A",
                online: true,
                lastMessage: "Super ton post ! 🔥",
                lastTime: Date.now() - 3600000,
                unreadCount: 2,
                messages: [
                    { id: 1, senderId: 2, text: "Salut ! Super ton post 🔥", timestamp: Date.now() - 3600000 },
                    { id: 2, senderId: 1, text: "Merci beaucoup ! 😊", timestamp: Date.now() - 3500000 },
                    { id: 3, senderId: 2, text: "Tu fais de superbes photos", timestamp: Date.now() - 3400000 }
                ]
            },
            {
                userId: 3,
                username: "photographe",
                avatar: "P",
                online: false,
                lastMessage: "J'adore !",
                lastTime: Date.now() - 86400000,
                unreadCount: 0,
                messages: [
                    { id: 1, senderId: 1, text: "Salut !", timestamp: Date.now() - 86400000 },
                    { id: 2, senderId: 3, text: "J'adore tes photos !", timestamp: Date.now() - 86000000 }
                ]
            }
        ];
        this.saveToStorage();
    }

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
                userId: userId,
                username: username,
                avatar: avatar,
                online: false,
                lastMessage: null,
                lastTime: Date.now(),
                unreadCount: 0,
                messages: []
            };
            this.conversations.push(conv);
            this.saveToStorage();
        }
        return conv;
    }

    sendMessage(userId, text) {
        if (!text.trim()) return null;
        
        let conv = this.getConversation(userId);
        if (!conv) return null;
        
        const newMessage = {
            id: Date.now(),
            senderId: this.currentUser.id,
            text: text.trim(),
            timestamp: Date.now()
        };
        
        conv.messages.push(newMessage);
        conv.lastMessage = text.trim();
        conv.lastTime = Date.now();
        
        this.saveToStorage();
        return newMessage;
    }

    getTimeAgo(timestamp) {
        const diff = Math.floor((Date.now() - timestamp) / 1000);
        if (diff < 60) return "maintenant";
        if (diff < 3600) return `${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
        return `${Math.floor(diff / 86400)} j`;
    }

    formatMessageTime(timestamp) {
        const date = new Date(timestamp);
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
    }
}

const chatModule = new ChatModule();
window.chatModule = chatModule;
