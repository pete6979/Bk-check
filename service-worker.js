/* BK SureCheck PWA Service Worker - bump CACHE_VERSION for every release. */
const CACHE_VERSION = 'bksc-shell-v1.2.0';
const RUNTIME_CACHE = 'bksc-runtime-v1.2.0';
const SCANNER_URL = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
const APP_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    const base = self.registration.scope;
    await cache.addAll(APP_FILES.map(path => new URL(path, base).href));
    // Best-effort pre-cache of the pinned camera fallback library. It is an opaque
    // response on a no-cors request; cache it only if the browser/CDN permits it.
    try {
      const response = await fetch(SCANNER_URL, { mode: 'no-cors', cache: 'no-store' });
      if (response && (response.type === 'opaque' || response.ok)) {
        const runtime = await caches.open(RUNTIME_CACHE);
        await runtime.put(SCANNER_URL, response.clone());
      }
    } catch (error) {
      // Camera fallback remains online-only until the library is fetched successfully.
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keep = new Set([CACHE_VERSION, RUNTIME_CACHE]);
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('bksc-') && !keep.has(key)).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.href === SCANNER_URL) {
    event.respondWith((async () => {
      const runtime = await caches.open(RUNTIME_CACHE);
      const cached = await runtime.match(SCANNER_URL);
      if (cached) {
        if (self.navigator && self.navigator.onLine) {
          fetch(request).then(response => runtime.put(SCANNER_URL, response.clone())).catch(() => {});
        }
        return cached;
      }
      try {
        const response = await fetch(request);
        if (response && (response.type === 'opaque' || response.ok)) await runtime.put(SCANNER_URL, response.clone());
        return response;
      } catch (error) {
        return new Response('Camera scanner library is not cached. Connect to the internet once and retry.', {
          status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      }
    })());
    return;
  }
  if (url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response && response.ok && url.pathname.startsWith(new URL(self.registration.scope).pathname)) {
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    } catch (error) {
      if (request.mode === 'navigate') {
        const shell = await caches.match(new URL('./index.html', self.registration.scope).href);
        if (shell) return shell;
      }
      return new Response('Offline: requested resource is not available in cache.', {
        status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
  })());
});
