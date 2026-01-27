// Service Worker for Web Push Notifications and Offline Caching

const CACHE_NAME = 'AO';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/ao-logo.png'
];

self.addEventListener('install', (event) => {
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', (event) => {
  // Tell the active service worker to take control of the page immediately.
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Simple network-first strategy
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    
    // Use self.location.origin to get the base URL
    const origin = self.location.origin;
    const defaultIcon = `${origin}/ao-logo.png`;

    const options = {
      body: data.message,
      icon: data.icon || defaultIcon,
      badge: defaultIcon,
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
        url: data.url || '/'
      },
      actions: [
        {
          action: 'explore',
          title: 'View Details',
          icon: defaultIcon
        },
        {
          action: 'close',
          title: 'Close',
          icon: defaultIcon
        },
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
