// Service Worker for Web Push Notifications and Offline Caching

const CACHE_NAME = 'luxegems-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/ao-logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
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
    const options = {
      body: data.message,
      icon: data.icon || '/vite.svg', // Use a default icon or one from payload
      badge: '/vite.svg', // Small icon for status bar
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
          icon: '/vite.svg'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/vite.svg'
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
