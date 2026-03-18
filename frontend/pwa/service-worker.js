const CACHE_NAME = 'krishyasetu-v9';
const CACHE_VERSION = '1.0.0';
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB cache limit
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const ASSETS = [
    './',
    './index.html',
    './splash.html',
    './login.html',
    './language.html',
    './permissions.html',
    './dashboard.html',
    './chatbot.html',
    './arscan.html',
    './soil.html',
    './pest.html',
    './calendar.html',
    './market.html',
    './reports.html',
    './profile.html',
    './signup.html',
    './offline.html',
    './css/krishyasetu.css',
    './css/framework/components.css',
    './css/framework/layout.css',
    './css/framework/utilities.css',
    './css/framework/animations.css',
    './css/framework/accessibility.css',
    './css/framework/mobile-pwa.css',
    './css/framework/responsive-utilities.css',
    './css/framework/advanced-animations.css',
    './css/components/dropdown-components.css',
    './css/components/radio-components.css',
    './css/components/file-components.css',
    './css/components/range-components.css',
    './css/components/calendar-components.css',
    './css/components/task-components.css',
    './css/components/chatbot-components.css',
    './css/components/scanner-components.css',
    './css/components/crop-components.css',
    './js/common.js',
    './js/framework/components.js',
    './js/components/calendar-components.js',
    './js/components/task-components.js',
    './js/components/file-components.js',
    './js/components/range-components.js',
    './js/components/radio-components.js',
    './js/components/dropdown-components.js',
    './js/functional/file-manager.js',
    './js/functional/camera-functional.js',
    './js/functional/gallery-functional.js',
    './js/functional/notification-functional.js',
    './js/functional/main-functional.js',
    './js/functional/dashboard-functional.js',
    './js/functional/chatbot-functional.js',
    './js/data/india-states-districts.js'
];

// Cache management utilities
async function getCacheSize() {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    let totalSize = 0;

    for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
            const responseClone = response.clone();
            const blob = await responseClone.blob();
            totalSize += blob.size;
        }
    }

    return totalSize;
}

async function cleanupExpiredCache() {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    const now = Date.now();

    for (const request of requests) {
        const response = await cache.match(request);
        if (response && response.headers.get('date')) {
            const cacheDate = new Date(response.headers.get('date'));
            if (now - cacheDate.getTime() > CACHE_EXPIRY) {
                await cache.delete(request);
                console.log('Expired cache entry removed:', request);
            }
        }
    }
}

async function enforceCacheSizeLimit() {
    const currentSize = await getCacheSize();

    if (currentSize > MAX_CACHE_SIZE) {
        const cache = await caches.open(CACHE_NAME);
        const requests = await cache.keys();

        // Sort by last modified (if available) or URL
        requests.sort((a, b) => a.localeCompare(b));

        // Remove oldest entries until under limit
        while (currentSize > MAX_CACHE_SIZE * 0.8 && requests.length > 0) {
            const oldestRequest = requests.shift();
            await cache.delete(oldestRequest);
            console.log('Cache size limit exceeded, removed:', oldestRequest);

            // Recalculate size
            const response = await cache.match(oldestRequest);
            if (response) {
                const responseClone = response.clone();
                const blob = await responseClone.blob();
                currentSize -= blob.size;
            }
        }
    }
}
function shouldCacheUpdate(url) {
    // Don't cache dynamic content
    const dynamicPatterns = [
        '/api/',
        '/weather/',
        '/chat/',
        'googleapis.com',
        'openweathermap.org'
    ];

    return !dynamicPatterns.some(pattern => url.includes(pattern));
}

function getCacheStrategy(request) {
    const url = request.url;

    // Network-first for dynamic content
    if (!shouldCacheUpdate(url)) {
        return 'network-first';
    }

    // Cache-first for static assets
    return 'cache-first';
}

// Cache static assets during install
self.addEventListener('install', (event) => {
    // BUG 17 Fix: skipWaiting so new SW activates without requiring tab refresh
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching app assets');
                return cache.addAll(ASSETS);
            })
            .then(() => {
                // Initialize cache management
                return enforceCacheSizeLimit();
            })
            .catch((error) => {
                console.warn('Failed to cache assets:', error);
            })
    );
});

// Serve cached content when offline
self.addEventListener('fetch', (event) => {
    // Only cache GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    const strategy = getCacheStrategy(event.request);

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Network-first strategy for dynamic content
                if (strategy === 'network-first') {
                    return fetch(event.request)
                        .then((networkResponse) => {
                            if (!networkResponse || networkResponse.status !== 200) {
                                return cachedResponse || networkResponse;
                            }


                            // Cache successful network response
                            const responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseToCache);
                                });


                            return networkResponse;
                        })
                        .catch(() => {
                            // Fallback to cache if network fails
                            if (cachedResponse) {
                                return cachedResponse;
                            }
                            // If no cached response and it's a navigation request, show offline page
                            if (event.request.mode === 'navigate') {
                                return caches.match('./offline.html');
                            }
                        });
                }

                // Cache-first strategy for static assets
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Otherwise fetch from network
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Check if we received a valid response
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        // Clone response to put in cache


                        // Cache response for future use
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                // Add timestamp for expiry tracking
                                const responseClone = networkResponse.clone();

                                caches.open(CACHE_NAME)
                                    .then((cache) => {
                                        cache.put(event.request, responseClone);
                                    });
                            });

                        return networkResponse;
                    })
                    .catch((error) => {
                        console.warn('Fetch failed:', error);
                        // Return a fallback page for HTML requests
                        if (event.request.headers.get('accept')?.includes('text/html')) {
                            return caches.match('./offline.html');
                        }
                    });
            })
    );
});

// Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all([
                    // Delete old caches
                    ...cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    }),
                    // Clean up current cache
                    cleanupExpiredCache(),
                    enforceCacheSizeLimit()
                ]);
            })
            .catch((error) => {
                console.warn('Cache cleanup failed:', error);
            })
            .then(() => {
                console.log('Service worker activated and old caches cleaned up');
                // BUG 17 Fix: Claim all open clients immediately so pages use this SW without refresh
                return self.clients.claim();
            })
    );
});
