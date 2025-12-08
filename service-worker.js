// --- CONFIGURATION V7.9 ---
const CACHE_NAME = 'prog-bellecour-v7-9'; // Changement de version ici
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  // Si vous n'avez pas les icônes, commentez les deux lignes ci-dessous avec //
  './icon-192x192.png',
  './icon-512x512.png',
  // Librairies externes (indispensables pour le mode hors-ligne)
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js'
];

// Installation : Mise en cache initiale
self.addEventListener('install', event => {
  self.skipWaiting(); // Force le nouveau SW à prendre le contrôle immédiatement
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache ouvert version 7.9');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activation : Nettoyage des anciens caches (V7.7, V7.8...)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interception : Servir le cache, sinon le réseau
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Trouvé dans le cache
        }
        return fetch(event.request); // Pas trouvé, on va sur internet
      })
  );
});
