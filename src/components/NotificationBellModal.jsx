import React from 'react';
import { X, Bell, CheckCheck, ExternalLink, ShieldAlert, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

export default function NotificationBellModal() {
  const {
    isBellOpen,
    setIsBellOpen,
    notifications,
    markAsRead,
    markAllAsRead,
    unreadCount,
    isPermissionGranted,
    enableNotifications,
  } = useNotifications();

  const navigate = useNavigate();

  if (!isBellOpen) return null;

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id);
    if (notif.target_url) {
      navigate(notif.target_url);
    }
    setIsBellOpen(false);
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return (
        d.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }) +
        ' • ' +
        d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' })
      );
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-navy/40 backdrop-blur-sm animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="flex-1" onClick={() => setIsBellOpen(false)} />

      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 transition-transform">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-100 text-teal-700 rounded-lg">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-navy">Notifications</h3>
              <p className="text-xs text-slate-500">
                {unreadCount > 0 ? `${unreadCount} unread update(s)` : 'All caught up'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 p-1 flex items-center gap-1"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Read All
              </button>
            )}
            <button
              onClick={() => setIsBellOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
              aria-label="Close notifications panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Enable Push Notifications Banner if not granted */}
        {!isPermissionGranted && (
          <div className="p-4 bg-teal-50 border-b border-teal-100 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-xs font-bold text-teal-900">Enable Push Notifications</h4>
              <p className="text-[11px] text-teal-700 mt-0.5 leading-relaxed">
                Receive instant sound & popup alerts on your device for appointment confirmations and updates.
              </p>
              <button
                onClick={() => enableNotifications()}
                className="mt-2 text-xs font-bold px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 active:scale-95 transition-all shadow-sm"
              >
                Enable System Push
              </button>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <Bell className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
              <p className="text-sm font-medium">No notifications yet</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Updates regarding your bookings and clinic schedules will appear right here.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  notif.is_read
                    ? 'bg-white border-slate-100 hover:bg-slate-50'
                    : 'bg-teal-50/50 border-teal-200 hover:bg-teal-50/80 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h5 className="font-heading font-bold text-xs sm:text-sm text-navy">
                    {notif.title}
                  </h5>
                  {!notif.is_read && (
                    <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0 mt-1"></span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.body}</p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{formatDate(notif.created_at)}</span>
                  {notif.target_url && (
                    <span className="text-teal-600 font-semibold flex items-center gap-0.5 hover:underline">
                      Open <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
