const CACHE_NAME = 'bawss-planner-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './main.js',
  './render.js',
  './dialogs.js',
  './data.js',
  './file-access.js',
  './styles.css',
  './icons/icon-192.png',
  './icons/icon-512.png'
  // Add any other static assets your app needs to cache
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
