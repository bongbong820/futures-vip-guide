const CACHE = 'vip-guide-v2';
const ASSETS = ['/futures-vip-guide/', '/futures-vip-guide/index.html'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .catch(() => {/* cache fail is non-fatal */})
  );
  self.skipWaiting();
});

// Network First strategy: try network, fallback to cache
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Cache successful responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone)).catch(() => {});
        }
        return response;
      })
      .catch(() => caches.match(e.request).then(r => r || new Response('Offline', { status: 503 })))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .catch(() => {})
  );
  self.clients.claim();
});
