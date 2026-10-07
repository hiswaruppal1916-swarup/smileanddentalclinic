import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { requestNotificationPermissionAndGetToken, setupForegroundMessageListener } from '../lib/firebase';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeToast, setActiveToast] = useState(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );
  const [isBellOpen, setIsBellOpen] = useState(false);

  // Active recipient identity
  const patientToken = typeof window !== 'undefined' ? localStorage.getItem('sdc_patient_token') : null;
  const isDoctor = typeof window !== 'undefined' ? localStorage.getItem('sdc_is_doctor') === 'true' : false;
  const currentRole = isDoctor ? 'doctor' : 'patient';
  const currentRecipientId = isDoctor ? 'doctor' : patientToken;

  // Fetch initial notifications
  const fetchNotifications = async () => {
    try {
      let query = supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(30);

      if (isDoctor) {
        query = query.eq('recipient_role', 'doctor');
      } else if (patientToken) {
        query = query.eq('recipient_role', 'patient').eq('recipient_id', patientToken);
      } else {
        // Guest - no private notifications yet
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      const { data, error } = await query;
      if (!error && data) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.is_read).length);
      }
    } catch (e) {
      console.error('[NotificationContext] Fetch error:', e);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Setup Supabase Realtime Subscription
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const newNotif = payload.new;
          // Filter strictly: patient sees only their own notifications, doctor sees doctor notifications
          const isRelevant =
            (isDoctor && newNotif.recipient_role === 'doctor') ||
            (!isDoctor && patientToken && newNotif.recipient_role === 'patient' && newNotif.recipient_id === patientToken);

          if (isRelevant) {
            setNotifications((prev) => [newNotif, ...prev]);
            setUnreadCount((c) => c + 1);

            // Trigger in-app toast
            setActiveToast({
              title: newNotif.title,
              body: newNotif.body,
              target_url: newNotif.target_url,
            });
          }
        }
      )
      .subscribe();

    // Setup Firebase Foreground Push Listener
    setupForegroundMessageListener((payload) => {
      setActiveToast({
        title: payload.notification?.title || payload.data?.title || 'Smile & Dental Clinic',
        body: payload.notification?.body || payload.data?.body || '',
        target_url: payload.data?.url || '/',
      });
      fetchNotifications();
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [patientToken, isDoctor]);

  const enableNotifications = async (customRole = currentRole, customUserId = currentRecipientId) => {
    const res = await requestNotificationPermissionAndGetToken(customRole, customUserId);
    if (res.success) {
      setIsPermissionGranted(true);
      setActiveToast({
        title: 'Notifications Enabled! 🔔',
        body: 'You will receive real-time push updates for appointments.',
        target_url: '/',
      });
      return true;
    }
    return false;
  };

  const markAsRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length > 0) {
      await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        activeToast,
        setActiveToast,
        clearToast: () => setActiveToast(null),
        isPermissionGranted,
        enableNotifications,
        markAsRead,
        markAllAsRead,
        isBellOpen,
        setIsBellOpen,
        refreshNotifications: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
