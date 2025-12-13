
const CACHE_NAME = 'funding-board-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Stale-while-revalidate for external resources (CDNs)
  // This allows the app to work offline by caching dependencies
  if (requestUrl.hostname === 'esm.sh' ||
    requestUrl.hostname === 'cdn.tailwindcss.com' ||
    requestUrl.hostname === 'fonts.googleapis.com' ||
    requestUrl.hostname === 'fonts.gstatic.com' ||
    requestUrl.hostname === 'cdn-icons-png.flaticon.com') {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            // Check if we received a valid response
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(err => {
            // Network failed, return cached if available, else fail
            return cachedResponse;
          });
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Network first for everything else, fallback to cache
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});