// ========================================================
// JIV FLEET VLADIVOSTOK - SERVICE WORKER (PWABuilder / TWA)
// Enables offline fallback & caching for Android PWA
// ========================================================

const CACHE_NAME = 'jiv-fleet-v1.0.0';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/index.html',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install Event - Pre-cache essential offline shells
self.addEventListener('install', (event) => {
  console.log('[SW] JIV Fleet Service Worker Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching offline shell assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Cache addAll skipped non-critical files:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker Activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Removing stale cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network First Strategy with Offline Cache Fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests or browser extension requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  // Bypass API requests to ensure fresh real-time boat data
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Dynamic cache successful responses
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to offline cache if offline
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return offline fallback shell if navigating HTML
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/');
          }
        });
      })
  );
});
