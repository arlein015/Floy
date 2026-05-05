// story.js - Module de gestion des Stories pour Floy Network

const StoryModule = {
    // Configuration des couleurs
    colors: {
        primary: '#FF6B00',
        border: 'rgba(255, 107, 0, 0.5)'
    },

    // 1. Initialisation et affichage sur le profil
    init: function(storiesData) {
        const container = document.getElementById('stories-container');
        if (!container) return;

        let html = '';
        storiesData.forEach(story => {
            html += `
                <div class="flex flex-col items-center space-y-2 flex-shrink-0 cursor-pointer group" onclick="StoryModule.view('${story.id}')">
                    <div class="w-16 h-16 rounded-full p-[2px] border-2 border-[#FF6B00] bg-black transition-transform group-active:scale-90">
                        <img src="${story.thumbnail}" class="w-full h-full rounded-full object-cover grayscale group-hover:grayscale-0">
                    </div>
                    <span class="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white">${story.title}</span>
                </div>
            `;
        });
        
        // Bouton "+" pour ajouter une story (visible uniquement pour Floy)
        html += `
            <div class="flex flex-col items-center space-y-2 flex-shrink-0 cursor-pointer">
                <div class="w-16 h-16 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center text-gray-500 hover:border-[#FF6B00] hover:text-[#FF6B00]">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                </div>
                <span class="text-[10px] font-bold uppercase text-gray-600">Nouveau</span>
            </div>
        `;

        container.innerHTML = html;
    },

    // 2. Lecteur plein écran (Modal)
    view: function(storyId) {
        // Création dynamique de la vue plein écran
        const viewer = document.createElement('div');
        viewer.id = 'story-viewer-overlay';
        viewer.className = 'fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center';
        
        viewer.innerHTML = `
            <div class="relative w-full max-w-lg h-full md:h-[90vh] bg-gray-900 md:rounded-3xl overflow-hidden shadow-2xl">
                <div class="absolute top-4 left-0 right-0 flex space-x-1 px-4 z-10">
                    <div class="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                        <div class="h-full bg-[#FF6B00]" style="width: 30%"></div>
                    </div>
                </div>

                <div class="absolute top-8 left-4 flex items-center space-x-3 z-10">
                    <img src="/static/img/floy-avatar.jpg" class="w-8 h-8 rounded-full border border-[#FF6B00]">
                    <span class="font-bold text-sm">Floy</span>
                    <span class="text-xs text-white/50">12h</span>
                </div>

                <button onclick="document.getElementById('story-viewer-overlay').remove()" class="absolute top-8 right-4 z-10 text-white p-2">✕</button>

                <img src="https://picsum.photos/1080/1920?random=${storyId}" class="w-full h-full object-cover">

                <div class="absolute bottom-6 left-0 right-0 px-6 flex items-center space-x-4">
                    <input type="text" placeholder="Répondre..." class="flex-1 bg-white/10 border border-white/20 rounded-full px-5 py-3 text-sm outline-none backdrop-blur-md">
                    <button class="text-[#FF6B00]">
                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(viewer);
    }
};

// Simulation de données pour tester
const mesStories = [
    { id: 1, title: 'Network', thumbnail: 'https://picsum.photos/200/200?random=1' },
    { id: 2, title: 'Code', thumbnail: 'https://picsum.photos/200/200?random=2' },
    { id: 3, title: 'Setup', thumbnail: 'https://picsum.photos/200/200?random=3' }
];

// Lancement
document.addEventListener('DOMContentLoaded', () => {
    StoryModule.init(mesStories);
});
