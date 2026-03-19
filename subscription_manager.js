// subscription_manager.js
import { db } from './firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export const SubscriptionManager = {
    async checkVerificationStatus(uid) {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
            const data = userDoc.data();
            // Retourne true si l'utilisateur a payé ou est certifié
            return data.isVerified === true || data.plan === 'premium';
        }
        return false;
    }
};
