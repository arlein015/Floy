const CACHE_NAME = 'mon-reseau-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/static/css/profile_styles.css',
  '/static/js/realtime_sync.js',
  '/static/icons/icon-192x192.png'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Stratégie : Réseau d'abord, sinon Cache (pour le temps réel)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
