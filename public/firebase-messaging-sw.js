// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

// Initialize Firebase in Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyDUxtzb3a1oRvdxmgcQS8doPvO7vOdlYV8",
  authDomain: "smile-and-dental-clinic.firebaseapp.com",
  projectId: "smile-and-dental-clinic",
  storageBucket: "smile-and-dental-clinic.firebasestorage.app",
  messagingSenderId: "877260036656",
  appId: "1:877260036656:web:985e27fc69d0f0d296abf5",
});

const messaging = firebase.messaging();

// Handle Background Push Messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || 'Smile & Dental Clinic';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'New update regarding your appointment.',
    icon: payload.notification?.icon || '/assets/favicon.jpg',
    badge: '/assets/favicon.jpg',
    data: {
      url: payload.data?.url || payload.data?.target_url || '/',
      appointment_id: payload.data?.appointment_id,
    },
    vibrate: [200, 100, 200],
    tag: payload.data?.tag || 'sdc-notification',
    renotify: true,
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Notification Click Event Listener (Opens target URL without 404)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
