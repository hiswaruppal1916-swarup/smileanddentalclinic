import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { supabase } from './supabase';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDUxtzb3a1oRvdxmgcQS8doPvO7vOdlYV8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "smile-and-dental-clinic.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "smile-and-dental-clinic",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "smile-and-dental-clinic.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "877260036656",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:877260036656:web:985e27fc69d0f0d296abf5",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-KEDBL3RZ0X",
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "BH4oxywbxrf1Lde3GF-VKvs44Qbuz3qlQ1M8m4ujgvsJQMQzuNNyLOIiMnGQyzj6BcyzFVzQ2_C_86YAfgyi1-k";

// Request Browser Permission and Generate Device FCM Token
export async function requestNotificationPermissionAndGetToken(role = 'patient', userId = null) {
  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn('[FCM] Firebase Messaging is not supported in this browser environment.');
      return { success: false, reason: 'unsupported' };
    }

    if (!('Notification' in window)) {
      console.warn('[FCM] Notifications are not supported by this browser.');
      return { success: false, reason: 'unsupported' };
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('[FCM] Notification permission was denied or dismissed:', permission);
      return { success: false, reason: 'denied', permission };
    }

    // Register Service Worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });
    await navigator.serviceWorker.ready;

    const messaging = getMessaging(app);

    const fcmToken = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (fcmToken) {
      console.log('[FCM] Generated Device Token:', fcmToken.substring(0, 15) + '...');

      // 1. Direct Supabase Upsert (Always reliable across local & deployed environments)
      const platform = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'mobile_pwa' : 'desktop';
      const deviceName = `${navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'} - ${navigator.platform || 'Browser'}`;
      const effectiveUserId = userId || localStorage.getItem('sdc_patient_token') || 'guest';

      try {
        await supabase.from('notification_devices').upsert(
          {
            fcm_token: fcmToken,
            role,
            user_id: effectiveUserId,
            device_name: deviceName,
            platform,
            is_active: true,
            updated_at: new Date().toISOString(),
            last_seen_at: new Date().toISOString(),
          },
          { onConflict: 'fcm_token' }
        );
      } catch (sbErr) {
        console.warn('[FCM] Supabase device registration error:', sbErr);
      }

      // 2. Also register device on backend API if reachable
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        await fetch(`${apiUrl}/api/register-device`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fcm_token: fcmToken,
            role,
            user_id: effectiveUserId,
            device_name: deviceName,
            platform,
          }),
        });
      } catch (apiErr) {
        // Backend optional
      }

      localStorage.setItem('sdc_fcm_token', fcmToken);
      localStorage.setItem('sdc_notifications_enabled', 'true');
      return { success: true, token: fcmToken };
    } else {
      return { success: false, reason: 'no-token' };
    }
  } catch (error) {
    console.error('[FCM] Error requesting permission / token:', error);
    return { success: false, error: error.message };
  }
}

// Setup Foreground Listener
export function setupForegroundMessageListener(onMessageReceived) {
  isSupported().then((supported) => {
    if (!supported) return;
    try {
      const messaging = getMessaging(app);
      onMessage(messaging, (payload) => {
        console.log('[FCM] Foreground notification payload received:', payload);
        if (onMessageReceived) {
          onMessageReceived(payload);
        }
      });
    } catch (e) {
      console.warn('[FCM] Could not attach foreground listener:', e.message);
    }
  });
}

export { app };
