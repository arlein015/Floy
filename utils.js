// utils.js

/**
 * Génère un ID de chat unique et constant entre deux utilisateurs.
 * L'ordre alphabétique permet de garantir que (UserA + UserB) aura le même ID que (UserB + UserA).
 */
export function getChatId(uid1, uid2) {
    if (!uid1 || !uid2) return null;
    return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
}
