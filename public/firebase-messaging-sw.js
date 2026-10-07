// ============================================================
// SMILE & DENTAL CLINIC - UNIFIED PWA & FCM SERVICE WORKER
// ============================================================

// 1. IMPORT FIREBASE COMPAT SCRIPTS FOR BACKGROUND MESSAGING
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

// 2. INITIALIZE FIREBASE APP IN SERVICE WORKER
firebase.initializeApp({
  apiKey: "AIzaSyDUxtzb3a1oRvdxmgcQS8doPvO7vOdlYV8",
  authDomain: "smile-and-dental-clinic.firebaseapp.com",
  projectId: "smile-and-dental-clinic",
  storageBucket: "smile-and-dental-clinic.firebasestorage.app",
  messagingSenderId: "877260036656",
  appId: "1:877260036656:web:985e27fc69d0f0d296abf5",
});

const messaging = firebase.messaging();

// 3. PWA CACHE CONFIGURATION
const CACHE_NAME = 'sdc-pwa-v1.2';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/assets/logo.jpg',
  '/assets/favicon.jpg',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/icon-maskable-512.png',
  '/assets/apple-touch-icon.png',
];

// URLs that MUST NEVER be cached to prevent leaking sensitive patient/doctor data
const SENSITIVE_URL_PATTERNS = [
  'supabase.co',
  '/auth/v1/',
  '/rest/v1/',
  '/api/',
  'fcm.googleapis.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
];

function isSensitiveRequest(url) {
  return SENSITIVE_URL_PATTERNS.some((pattern) => url.includes(pattern));
}

// 4. INSTALL EVENT - PRECACHE APP SHELL
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    }).catch((err) => {
      console.warn('[SW] Pre-caching app shell warning:', err);
    })
  );
  self.skipWaiting();
});

// 5. ACTIVATE EVENT - CLEAN UP OLD CACHES & CLAIM CLIENTS
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[SW] Deleting outdated cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 6. FETCH EVENT - ROBUST OFFLINE HANDLING WITHOUT CACHING PRIVATE DATA
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = request.url;

  // Only handle GET requests; all mutations pass directly to network
  if (request.method !== 'GET') {
    return;
  }

  // Never intercept or cache Supabase, Firebase Auth, or sensitive API requests
  if (isSensitiveRequest(url)) {
    return;
  }

  // Skip chrome-extension or other non-http schemes
  if (!url.startsWith('http')) {
    return;
  }

  // Handle SPA Navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        // When offline, serve cached SPA shell so routes never break into a browser 404
        const cachedShell = await caches.match('/index.html');
        if (cachedShell) return cachedShell;
        return caches.match('/');
      })
    );
    return;
  }

  // Handle Static Assets (images, CSS, JS bundles)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache for next time (stale-while-revalidate for static files)
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
        }).catch(() => {
          // Network unavailable; cached response is already serving
        });
        return cachedResponse;
      }

      // If not in cache, fetch from network and cache successful public static responses
      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // Cache static JS/CSS/image assets only
        const isStaticAsset = url.includes('/assets/') || url.endsWith('.js') || url.endsWith('.css') || url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.svg');
        if (isStaticAsset && !isSensitiveRequest(url)) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }

        return networkResponse;
      }).catch(() => {
        // Fallback for failed image requests when offline
        if (request.destination === 'image') {
          return caches.match('/assets/favicon.jpg');
        }
      });
    })
  );
});

// 7. HANDLE BACKGROUND PUSH MESSAGES (FCM)
messaging.onBackgroundMessage((payload) => {
  console.log('[SW FCM] Received background push message:', payload);

  const notificationTitle = payload.notification?.title || payload.data?.title || 'Smile & Dental Clinic';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'New update regarding your appointment.',
    icon: payload.notification?.icon || '/assets/icon-192.png',
    badge: '/assets/icon-192.png',
    data: {
      url: payload.data?.url || payload.data?.target_url || '/',
      appointment_id: payload.data?.appointment_id,
    },
    vibrate: [200, 100, 200],
    tag: payload.data?.tag || `sdc-notification-${Date.now()}`,
    renotify: true,
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 8. NOTIFICATION CLICK - DEEP LINKING TO CORRECT DOCTOR OR PATIENT ROUTE
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  let targetUrl = event.notification.data?.url || '/';

  // Ensure absolute URL resolution
  if (targetUrl.startsWith('/')) {
    targetUrl = self.location.origin + targetUrl;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing tab if open and navigate to target
      for (const client of clientList) {
        if ('focus' in client) {
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // Otherwise open new window/PWA client
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
