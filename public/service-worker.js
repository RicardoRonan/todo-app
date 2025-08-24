// Service Worker for Pixel Task Master PWA
const CACHE_NAME = 'pixel-task-master-v1.0.0';
const STATIC_CACHE = 'pixel-task-master-static-v1.0.0';
const DYNAMIC_CACHE = 'pixel-task-master-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './js/storage.js',
    './js/gamify.js',
    './js/quickadd.js',
    './js/filters.js',
    './js/dashboard.js',
    './js/theme.js',
    './public/manifest.webmanifest',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Orbitron:wght@400;700;900&display=swap'
];

// External resources to cache
const EXTERNAL_RESOURCES = [
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2',
    'https://fonts.gstatic.com/s/patrickhand/v18/LN1Rc2Mn6mA8QfEW7fLj8Qs.woff2',
    'https://fonts.gstatic.com/s/orbitron/v31/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nyGy6BoWgz.woff2'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Service Worker: Static files cached');
                return caches.open(DYNAMIC_CACHE);
            })
            .then((cache) => {
                console.log('Service Worker: Dynamic cache created');
                return cache.addAll(EXTERNAL_RESOURCES);
            })
            .then(() => {
                console.log('Service Worker: External resources cached');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Error during install', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Handle different types of requests
    if (url.origin === self.location.origin) {
        // Same-origin requests
        event.respondWith(handleSameOriginRequest(request));
    } else {
        // Cross-origin requests (CDN resources)
        event.respondWith(handleCrossOriginRequest(request));
    }
});

// Handle same-origin requests
async function handleSameOriginRequest(request) {
    try {
        // Try network first for HTML files
        if (request.destination === 'document') {
            const networkResponse = await fetch(request);
            if (networkResponse.ok) {
                // Cache the fresh response
                const cache = await caches.open(DYNAMIC_CACHE);
                cache.put(request, networkResponse.clone());
                return networkResponse;
            }
        }
        
        // For other files, try cache first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Fallback to network
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            // Cache the response for future use
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
        
    } catch (error) {
        console.error('Service Worker: Error handling same-origin request', error);
        
        // Return cached version if available
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page for HTML requests
        if (request.destination === 'document') {
            return caches.match('/index.html');
        }
        
        throw error;
    }
}

// Handle cross-origin requests (CDN resources)
async function handleCrossOriginRequest(request) {
    try {
        // Try cache first for external resources
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Fallback to network
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            // Cache the response
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
        
    } catch (error) {
        console.error('Service Worker: Error handling cross-origin request', error);
        
        // Return cached version if available
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync triggered', event.tag);
    
    if (event.tag === 'background-sync-tasks') {
        event.waitUntil(syncTasks());
    }
});

// Sync tasks when back online
async function syncTasks() {
    try {
        // Get any pending tasks from IndexedDB
        const db = await openDB();
        const pendingTasks = await db.getAll('pendingTasks');
        
        if (pendingTasks.length > 0) {
            console.log('Service Worker: Syncing', pendingTasks.length, 'pending tasks');
            
            // Process each pending task
            for (const task of pendingTasks) {
                try {
                    // Attempt to sync with server (if applicable)
                    // For now, just mark as synced
                    await db.delete('pendingTasks', task.id);
                } catch (error) {
                    console.error('Service Worker: Error syncing task', error);
                }
            }
        }
    } catch (error) {
        console.error('Service Worker: Error during background sync', error);
    }
}

// Open IndexedDB for offline storage
async function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('PixelTaskMasterDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create pending tasks store
            if (!db.objectStoreNames.contains('pendingTasks')) {
                db.createObjectStore('pendingTasks', { keyPath: 'id' });
            }
        };
    });
}

// Push notifications (if implemented)
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'You have a new task reminder!',
        icon: '/public/icons/icon-192.png',
        badge: '/public/icons/icon-192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Tasks',
                icon: '/public/icons/icon-192.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/public/icons/icon-192.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Pixel Task Master', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked', event.action);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Handle app updates
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
    console.log('Service Worker: Periodic sync triggered', event.tag);
    
    if (event.tag === 'periodic-sync-tasks') {
        event.waitUntil(syncTasks());
    }
});

// Error handling
self.addEventListener('error', (event) => {
    console.error('Service Worker: Error', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker: Unhandled rejection', event.reason);
});
