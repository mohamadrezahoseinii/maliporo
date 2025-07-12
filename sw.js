const CACHE_NAME = 'financial-manager-v2.1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-180.png',
  // اگر فایل‌های داخلی دیگر داری اضافه کن
];

// نصب سرویس‌ورکر و کش اولیه
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch((error) => {
        console.error('Cache addAll failed:', error);
      })
  );
  self.skipWaiting();
});

// فعال‌سازی و پاکسازی کش‌های قدیمی
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

// کش هوشمند: اول شبکه، اگر نبود کش (برای به‌روزرسانی سریع‌تر)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // جواب جدید را کش هم کن
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, copy);
        });
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((response) =>
          response || caches.match('/index.html')
        )
      )
  );
});