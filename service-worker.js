const CACHE_NAME = 'prog-bellecour-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // Les icônes
  '/icon-192x192.png',
  '/icon-512x512.png',
  // Les CDN que vous utilisez
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js'
];

// Installation du Service Worker et mise en cache des ressources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache ouvert, ajout des ressources.');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Erreur de mise en cache:', err);
      })
  );
});

// Interception des requêtes : Servir depuis le cache en priorité
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si la ressource est dans le cache, on la sert immédiatement
        if (response) {
          return response;
        }
        // Sinon, on fait une requête réseau
        return fetch(event.request);
      })
  );
});

// Nettoyage des anciens caches (pour les mises à jour futures)
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});