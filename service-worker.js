const CACHE_VERSION = 'v8.36';
const PRECACHE = `prog-tool-precache-${CACHE_VERSION}`;
const RUNTIME = `prog-tool-runtime-${CACHE_VERSION}`;

// Precache only same-origin assets (cross-origin precache can break install).
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  './icon-192x192.png',
  './icon-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== PRECACHE && key !== RUNTIME) return caches.delete(key);
          return undefined;
        })
      )
    )
  );
  self.clients.claim();
});

function isNavigationRequest(request) {
  return request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html');
}

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME);
  try {
    const response = await fetch(request);
    if (response && (response.ok || response.type === 'opaque')) cache.put(request, response.clone());
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    return caches.match('./index.html');
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response && (response.ok || response.type === 'opaque')) cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);
  return cached || (await fetchPromise);
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && (response.ok || response.type === 'opaque')) cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;

  // HTML navigations: prefer fresh content, fall back to cache.
  if (isNavigationRequest(request)) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Same-origin assets: SWR for fast repeat loads + background refresh.
  if (isSameOrigin) {
    event.respondWith(staleWhileRevalidate(request, PRECACHE));
    return;
  }

  // Cross-origin: cache-first for fonts/libs, to speed up repeat loads.
  if (
    url.hostname.includes('cdnjs.cloudflare.com') ||
    url.hostname.includes('unpkg.com') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(cacheFirst(request, RUNTIME));
    return;
  }

  // Default: try cache, then network.
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).catch(() => cached))
  );
});
