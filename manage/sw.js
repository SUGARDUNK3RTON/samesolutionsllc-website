const CACHE_NAME = 'ss-manager-v53';
const STATIC_CACHE = 'ss-static-v53';
const DYNAMIC_CACHE = 'ss-dynamic-v53';
const CURRENT_CACHES = [CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE];

// Core app files to cache immediately
const STATIC_ASSETS = [
  '/manage/',
  '/manage/index.html',
  '/manage/utilities.css',
  '/manage/manifest.json',
  '/manage/icon-192.png',
  '/manage/icon-512.png'
];

// Install - cache static assets
self.addEventListener('install', event => {
  console.log('[SW] Installing v53...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => !CURRENT_CACHES.includes(key))
            .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - network first with cache fallback
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // Skip Firebase calls
  if (url.hostname.includes('firebase') || url.hostname.includes('googleapis')) return;
  
  // Navigation - network first
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request).then(c => c || caches.match('/manage/index.html')))
    );
    return;
  }
  
  // CDN resources - cache first
  if (url.hostname.includes('cdnjs') || url.hostname.includes('gstatic')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => cache.put(event.request, clone));
          return response;
        });
      })
    );
    return;
  }
  
  // Default - network first
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(DYNAMIC_CACHE).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
