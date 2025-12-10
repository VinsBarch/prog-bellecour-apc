const CACHE_NAME = 'prog-tool-v8.36';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  // On cache aussi les icônes si elles existent
  './icon-192.png',
  './icon-512.png',
  // On cache les librairies externes pour le mode hors ligne complet
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js',
  'https://unpkg.com/vis-network/standalone/umd/vis-network.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'
];

// Installation du Service Worker et mise en cache des ressources
self.addEventListener('install', (e) => {
  console.log('[Service Worker] Installation');
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Mise en cache globale');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// Activation et nettoyage des anciens caches (V8.35, etc.)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Suppression ancien cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

// Interception des requêtes réseau
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      // Si la ressource est dans le cache, on la retourne, sinon on va la chercher sur le réseau
      return res || fetch(e.request);
    })
  );
});
