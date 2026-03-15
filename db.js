/**
 * MODULE DATABASE - IndexedDB (Stockage illimité)
 */
const DBModule = {
    dbName: "FloyChatDB",
    dbVersion: 1,
    storeName: "messages",

    open: function() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: "id", autoIncrement: true });
                }
            };

            request.onsuccess = (e) => resolve(e.target.result);
            request.onerror = (e) => reject("Erreur IndexedDB : " + e.target.errorCode);
        });
    },

    // Sauvegarder un message
    saveMessage: async function(convoId, messageObj) {
        const db = await this.open();
        return new Promise((resolve) => {
            const transaction = db.transaction([this.storeName], "readwrite");
            const store = transaction.objectStore(this.storeName);
            
            // On ajoute l'ID de la conversation à l'objet
            messageObj.convoId = convoId;
            messageObj.timestamp = Date.now();

            store.add(messageObj);
            transaction.oncomplete = () => resolve(true);
        });
    },

    // Récupérer les messages d'une conversation
    getMessages: async function(convoId) {
        const db = await this.open();
        return new Promise((resolve) => {
            const transaction = db.transaction([this.storeName], "readonly");
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                // On filtre pour ne garder que les messages de cette discussion
                const filtered = request.result.filter(m => m.convoId === convoId);
                resolve(filtered);
            };
        });
    }
};
