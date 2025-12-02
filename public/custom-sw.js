// Service Worker - handles caching and updates

self.addEventListener('install', (event) => {
  console.log('[SW] Installing new version...');
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new version...');
  
  event.waitUntil(
    // Claim all clients immediately
    clients.claim().then(() => {
      // Notify all clients that update is complete
      return clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SW_ACTIVATED',
            version: '1.0.0',
          });
        });
      });
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Let next-pwa handle the rest of the caching
