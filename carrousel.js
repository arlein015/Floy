// ========================
// MODULE CARROUSEL - FLOY
// Plusieurs photos glissables (type Instagram)
// ========================

class CarrouselModule {
    constructor() {
        this.currentIndex = 0;
        this.images = [];
        this.startX = 0;
        this.isDragging = false;
    }

    // ========== CRÉER UN CARROUSEL ==========
    createCarrousel(images, containerId) {
        this.images = images;
        this.currentIndex = 0;
        
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const carrouselHtml = `
            <div class="carrousel-container">
                <div class="carrousel-track" id="carrouselTrack">
                    ${images.map((img, index) => `
                        <div class="carrousel-slide">
                            <img src="${img}" class="carrousel-image" data-index="${index}">
                        </div>
                    `).join('')}
                </div>
                ${images.length > 1 ? `
                    <button class="carrousel-nav prev" onclick="carrouselModule.prev()">‹</button>
                    <button class="carrousel-nav next" onclick="carrouselModule.next()">›</button>
                    <div class="carrousel-dots">
                        ${images.map((_, i) => `
                            <div class="carrousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}" onclick="carrouselModule.goToSlide(${i})"></div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        container.innerHTML = carrouselHtml;
        this.setupTouchEvents();
    }

    // ========== NAVIGATION ==========
    next() {
        if (this.currentIndex + 1 < this.images.length) {
            this.goToSlide(this.currentIndex + 1);
        }
    }

    prev() {
        if (this.currentIndex - 1 >= 0) {
            this.goToSlide(this.currentIndex - 1);
        }
    }

    goToSlide(index) {
        this.currentIndex = index;
        const track = document.getElementById('carrouselTrack');
        if (track) {
            track.style.transform = `translateX(-${index * 100}%)`;
        }
        
        // Mettre à jour les dots
        document.querySelectorAll('.carrousel-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    // ========== TOUCH EVENTS (swipe) ==========
    setupTouchEvents() {
        const container = document.querySelector('.carrousel-container');
        if (!container) return;
        
        container.addEventListener('touchstart', (e) => {
            this.startX = e.touches[0].clientX;
            this.isDragging = true;
        });
        
        container.addEventListener('touchmove', (e) => {
            if (!this.isDragging) return;
            const diff = e.touches[0].clientX - this.startX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.prev();
                } else {
                    this.next();
                }
                this.isDragging = false;
            }
        });
        
        container.addEventListener('touchend', () => {
            this.isDragging = false;
        });
    }

    // ========== UPLOAD MULTIPLE (pour carrousel) ==========
    openCarrouselUpload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'image/*';
        input.onchange = (e) => {
            const files = Array.from(e.target.files);
            const promises = files.map(file => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (ev) => resolve(ev.target.result);
                    reader.readAsDataURL(file);
                });
            });
            Promise.all(promises).then(images => {
                this.images = images;
                this.currentIndex = 0;
                this.createCarrousel(this.images, 'carrouselPreview');
            });
        };
        input.click();
    }
}

const carrouselModule = new CarrouselModule();
window.carrouselModule = carrouselModule;

// ========== STYLES CSS ==========
const carrouselStyles = `
    .carrousel-container {
        position: relative;
        width: 100%;
        overflow: hidden;
        border-radius: 8px;
        background: #1a1a1a;
    }
    .carrousel-track {
        display: flex;
        transition: transform 0.3s ease-out;
    }
    .carrousel-slide {
        min-width: 100%;
        flex-shrink: 0;
    }
    .carrousel-image {
        width: 100%;
        display: block;
        aspect-ratio: 1 / 1;
        object-fit: cover;
    }
    .carrousel-nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(0,0,0,0.5);
        border: none;
        color: white;
        font-size: 30px;
        cursor: pointer;
        padding: 10px 15px;
        border-radius: 50%;
        z-index: 10;
    }
    .carrousel-nav.prev { left: 10px; }
    .carrousel-nav.next { right: 10px; }
    .carrousel-dots {
        position: absolute;
        bottom: 15px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 8px;
        z-index: 10;
    }
    .carrousel-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgba(255,255,255,0.5);
        cursor: pointer;
        transition: 0.2s;
    }
    .carrousel-dot.active {
        background: white;
        width: 20px;
        border-radius: 4px;
    }
`;

if (!document.getElementById('carrousel-styles')) {
    const style = document.createElement('style');
    style.id = 'carrousel-styles';
    style.textContent = carrouselStyles;
    document.head.appendChild(style);
}
