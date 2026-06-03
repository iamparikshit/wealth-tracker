const CACHE_NAME = 'expense-tracker-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// API endpoints that should NOT be cached
const SKIP_CACHE_PATTERNS = [
  /\/rest\/v1\//,  // Supabase API
  /\/functions\/v1\//,  // Edge functions
  /^http.*\.supabase\.co/,
];

function shouldSkipCache(url) {
  return SKIP_CACHE_PATTERNS.some(pattern => pattern.test(url));
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          // Delete ALL old caches, not just different CACHE_NAME
          if (key.startsWith('expense-tracker-') && key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = event.request.url;

  // Skip caching for API/Supabase calls
  if (shouldSkipCache(url)) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // If offline, try to return a cached version if available
        return caches.match(event.request);
      })
    );
    return;
  }

  // Network-first strategy: try network first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache successful responses
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Offline: return cached version or fallback to index.html
        return caches.match(event.request)
          .then((cached) => cached || caches.match('/index.html'));
      })
  );
});

// Handle messages from clients for cache clearing
self.addEventListener('message', (event) => {
  if (event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});
