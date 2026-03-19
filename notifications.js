function showNotification(type, message) {
    const container = document.getElementById('notification-container');
    
    // Création de la carte
    const toast = document.createElement('div');
    toast.className = "notification-card p-4 rounded-lg flex items-center space-x-4 glass";
    
    // Icône selon le type (Like ou Follow)
    const icon = type === 'like' 
        ? '<svg class="w-6 h-6 text-[#FF6B00]" fill="currentColor" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"></path></svg>'
        : '<svg class="w-6 h-6 text-[#FF6B00]" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path></svg>';

    toast.innerHTML = `
        <div class="flex-shrink-0">${icon}</div>
        <div class="flex-1">
            <p class="text-xs font-black text-[#FF6B00] uppercase tracking-tighter">${type}</p>
            <p class="text-sm text-white font-medium">${message}</p>
        </div>
    `;

    container.appendChild(toast);

    // Animation d'entrée
    setTimeout(() => toast.classList.add('show'), 100);

    // Suppression automatique après 4 secondes
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

// TEST : Déclenche une notification après 3 secondes pour essayer
setTimeout(() => {
    showNotification('like', 'Quelqu\'un a aimé votre photo !');
}, 3000);
