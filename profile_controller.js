// profile_controller.js
import { db } from './firebase-config.js';
import { doc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export const ProfileController = {
    // Récupérer les infos de base (Nom, Bio, Photo)
    async getUserData(uid) {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    },

    // Écouter les changements en temps réel (pour les compteurs d'abonnés)
    subscribeToUpdates(uid, callback) {
        return onSnapshot(doc(db, "users", uid), (doc) => {
            callback(doc.data());
        });
    }
};
