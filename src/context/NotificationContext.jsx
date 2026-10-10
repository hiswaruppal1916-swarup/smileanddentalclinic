import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { requestNotificationPermissionAndGetToken, setupForegroundMessageListener } from '../lib/firebase';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { isDoctor: authIsDoctor } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeToast, setActiveToast] = useState(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );
  const [isBellOpen, setIsBellOpen] = useState(false);

  // Dynamic patient tracking token state
  const [patientToken, setPatientToken] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('sdc_patient_token') : null
  );

  // Active recipient identity
  const isDoctor = authIsDoctor || (typeof window !== 'undefined' && localStorage.getItem('sdc_is_doctor') === 'true');
  const currentRole = isDoctor ? 'doctor' : 'patient';
  const currentRecipientId = isDoctor ? 'doctor' : patientToken;

  // Listen for patient token changes across app and tabs
  useEffect(() => {
    const handleTokenChange = (e) => {
      const newToken = e.detail || localStorage.getItem('sdc_patient_token');
      if (newToken && newToken !== patientToken) {
        setPatientToken(newToken);
      }
    };
    window.addEventListener('sdc-patient-token-updated', handleTokenChange);
    window.addEventListener('storage', handleTokenChange);
    return () => {
      window.removeEventListener('sdc-patient-token-updated', handleTokenChange);
      window.removeEventListener('storage', handleTokenChange);
    };
  }, [patientToken]);

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    try {
      let query = supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(30);

      if (isDoctor) {
        query = query.eq('recipient_role', 'doctor').neq('recipient_id', 'deleted');
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
  }, [isDoctor, patientToken]);

  useEffect(() => {
    fetchNotifications();

    // Setup Supabase Realtime Subscription for notifications
    const channelName = isDoctor ? 'notifs_doctor_live' : `notifs_patient_${patientToken || 'guest'}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newNotif = payload.new;
            if (newNotif.recipient_id === 'deleted') return;
            const isRelevant =
              (isDoctor && newNotif.recipient_role === 'doctor') ||
              (!isDoctor && patientToken && newNotif.recipient_role === 'patient' && newNotif.recipient_id === patientToken);

            if (isRelevant) {
              setNotifications((prev) => {
                if (prev.some((n) => n.id === newNotif.id)) return prev;
                return [newNotif, ...prev];
              });
              if (!newNotif.is_read) {
                setUnreadCount((c) => c + 1);
              }

              // Trigger in-app toast
              setActiveToast({
                title: newNotif.title,
                body: newNotif.body,
                target_url: newNotif.target_url,
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedNotif = payload.new;
            if (updatedNotif.recipient_id === 'deleted') {
              setNotifications((prev) => {
                const next = prev.filter((n) => n.id !== updatedNotif.id);
                setUnreadCount(next.filter((n) => !n.is_read).length);
                return next;
              });
            } else {
              setNotifications((prev) => {
                const next = prev.map((n) => (n.id === updatedNotif.id ? updatedNotif : n));
                setUnreadCount(next.filter((n) => !n.is_read).length);
                return next;
              });
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old?.id;
            if (deletedId) {
              setNotifications((prev) => {
                const next = prev.filter((n) => n.id !== deletedId);
                setUnreadCount(next.filter((n) => !n.is_read).length);
                return next;
              });
            }
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
  }, [patientToken, isDoctor, fetchNotifications]);

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

  const getAuthHeaders = async () => {
    const headers = { 'Content-Type': 'application/json' };
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
    } catch {
      // ignore
    }
    if (isDoctor) {
      headers['x-doctor-auth'] = 'true';
      headers['x-doctor-role'] = 'doctor';
    }
    if (patientToken) {
      headers['x-patient-token'] = patientToken;
    }
    return headers;
  };

  const markAsRead = async (id) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(next.filter((n) => !n.is_read).length);
      return next;
    });
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

  const deleteNotification = async (id) => {
    if (!id) return;

    // 1. Optimistic UI update
    const target = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (target && !target.is_read) {
      setUnreadCount((c) => Math.max(0, c - 1));
    }

    // 2. Persist with server-side authorization check
    try {
      const headers = await getAuthHeaders();
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/notifications/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (!res.ok) {
        // Fallback scoped direct database query if server endpoint unreachable
        let fb = supabase.from('notifications').delete().eq('id', id);
        if (isDoctor) {
          fb = fb.eq('recipient_role', 'doctor');
        } else if (patientToken) {
          fb = fb.eq('recipient_role', 'patient').eq('recipient_id', patientToken);
        }
        await fb;
      }
    } catch (err) {
      console.warn('[NotificationContext] API delete error, executing scoped direct query:', err.message);
      let fb = supabase.from('notifications').delete().eq('id', id);
      if (isDoctor) {
        fb = fb.eq('recipient_role', 'doctor');
      } else if (patientToken) {
        fb = fb.eq('recipient_role', 'patient').eq('recipient_id', patientToken);
      }
      await fb;
    }
  };

  const deleteAllNotifications = async () => {
    if (notifications.length === 0) return;

    // 1. Optimistic UI update
    setNotifications([]);
    setUnreadCount(0);

    // 2. Persist with server-side authorization check
    try {
      const headers = await getAuthHeaders();
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/notifications`, {
        method: 'DELETE',
        headers,
      });

      if (!res.ok) {
        let fb = supabase.from('notifications').delete();
        if (isDoctor) {
          fb = fb.eq('recipient_role', 'doctor');
        } else if (patientToken) {
          fb = fb.eq('recipient_role', 'patient').eq('recipient_id', patientToken);
        }
        await fb;
      }
    } catch (err) {
      console.warn('[NotificationContext] API delete all error, executing scoped direct query:', err.message);
      let fb = supabase.from('notifications').delete();
      if (isDoctor) {
        fb = fb.eq('recipient_role', 'doctor');
      } else if (patientToken) {
        fb = fb.eq('recipient_role', 'patient').eq('recipient_id', patientToken);
      }
      await fb;
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
        deleteNotification,
        deleteAllNotifications,
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
