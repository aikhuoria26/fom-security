var CACHE_NAME = 'fom-security-v10';

// On install: pre-cache nothing. Don't auto-skipWaiting — the client drives
// the update so it can reload in lockstep. First-install case is handled by
// the client noting that navigator.serviceWorker.controller is null at load.
self.addEventListener('install', function(event) {
  // intentionally no skipWaiting() here
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(names.filter(function(n) { return n !== CACHE_NAME; }).map(function(n) { return caches.delete(n); }));
    }).then(function() { return self.clients.claim(); })
  );
});

// Page posts {type:'SKIP_WAITING'} when it's ready to activate the new worker.
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Network-first for everything except workers.dev and cdnjs.
// IMPORTANT: mobile.html / desktop.html / index.html / posting.html are
// bypass-the-cache-first — if network is available, use fresh HTML so
// migrations and deploys never stick.
self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;
  if (event.request.url.indexOf('workers.dev') !== -1) return;
  if (event.request.url.indexOf('cdnjs.cloudflare.com') !== -1) return;
  if (!event.request.url.startsWith('http')) return;

  // HTML navigation requests: network-first, fall back to cache only if offline.
  // This ensures deploys propagate even if the SW is stale.
  var isHtml = event.request.mode === 'navigate' ||
    (event.request.headers.get('accept') || '').indexOf('text/html') !== -1;

  event.respondWith(
    fetch(event.request).then(function(response) {
      if (response && response.status === 200 && response.type === 'basic') {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, clone); });
      }
      return response;
    }).catch(function() { return caches.match(event.request); })
  );
});
