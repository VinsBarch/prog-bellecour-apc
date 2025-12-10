const CACHE_NAME = 'v8-outil-prog-cache-v2'; // Mettre à jour la version à chaque changement majeur (ex: V8.11 -> v3)

// Ressources locales à mettre en cache
const APP_FILES = [
  './index.html',
  './manifest.json',
  // Ajoutez ici les chemins vers vos fichiers icons/
  // 'icons/icon-192.png',
  // 'icons/icon-512.png',
  // etc.
  './', // Chemin pour la racine
];

// URLs des librairies externes (CDN) utilisées dans l'application
const CDN_URLS = [
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js',
  'https://unpkg.com/vis-network/standalone/umd/vis-network.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'
];


// Événement d'installation : met en cache les fichiers statiques de l'application
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installation et mise en cache des ressources.');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Pré-mise en cache des fichiers de l'application + CDN
      return cache.addAll([...APP_FILES, ...CDN_URLS]);
    })
  );
});

// Événement d'activation : supprime les anciens caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activation en cours...');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Suppression de l\'ancien cache :', key);
          return caches.delete(key);
        }
      }));
    })
  );
  // Assure que le Service Worker prend le contrôle immédiatement
  return self.clients.claim();
});


// Événement fetch : gestion des requêtes
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non GET
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);

  // 1. Stratégie Cache-First pour les fichiers de l'application (pour le mode hors ligne)
  const isAppFile = APP_FILES.some(file => event.request.url.includes(file.substring(1))) || event.request.url.includes(requestUrl.origin);

  if (isAppFile) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
    return;
  }
  
  // 2. Stratégie Stale-While-Revalidate pour les CDN (si besoin de mise à jour)
  const isCdn = CDN_URLS.some(url => event.request.url.startsWith(url.substring(0, url.indexOf('/', 8)))); 
  if (isCdn) {
     event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            const fetchPromise = fetch(event.request).then(networkResponse => {
                // Mettre à jour le cache avec la nouvelle version
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, networkResponse.clone());
                });
                return networkResponse;
            }).catch(() => {
                // En cas d'échec du réseau, on compte sur le cache initial.
                return cachedResponse; 
            });

            // Retourne immédiatement la version en cache, ou lance la requête réseau
            return cachedResponse || fetchPromise;
        })
    );
    return;
  }
  
  // 3. Toutes les autres requêtes (ex: images, ressources non identifiées)
  event.respondWith(fetch(event.request));
});
