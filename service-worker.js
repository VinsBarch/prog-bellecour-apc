// --- CONFIGURATION V7.9.1 ---
// Changement de nom de cache pour forcer la mise à jour immédiate chez les clients
const CACHE_NAME = 'prog-bellecour-v7-9-1'; 

const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  // Si vous utilisez des icônes, assurez-vous qu'elles sont présentes sur Github
  // Sinon, commentez les lignes suivantes avec //
  './icon-192x192.png',
  './icon-512x512.png',
  // Librairies externes (indispensables pour le mode hors-ligne)
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js'
];

// 1. Installation : On met en cache les fichiers vitaux
self.addEventListener('install', event => {
  // Force l'activation immédiate du nouveau Service Worker sans attendre la fermeture des onglets
  self.skipWaiting(); 
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Ouverture du cache version 7.9.1');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Activation : On supprime les anciens caches (V7.8, V7.9, etc.) pour faire de la place
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Nettoyage ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 3. Interception Réseau : Stratégie "Cache, puis Réseau"
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si le fichier est dans le cache, on le sert
        if (response) {
          return response;
        }
        // Sinon, on le télécharge sur internet
        return fetch(event.request);
      })
  );
});
