import React, { useEffect } from 'react';
import { Bell, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

export default function NotificationToast() {
  const { activeToast, clearToast } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        clearToast();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [activeToast, clearToast]);

  if (!activeToast) return null;

  const handleClick = () => {
    if (activeToast.target_url) {
      navigate(activeToast.target_url);
    }
    clearToast();
  };

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm w-full bg-white border border-teal-200 rounded-2xl shadow-floating p-4 transition-all animate-bounceIn">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-teal-100 text-teal-700 rounded-xl shrink-0">
          <Bell className="w-5 h-5" />
        </div>
        <div className="flex-1 cursor-pointer" onClick={handleClick}>
          <h4 className="font-heading font-bold text-sm text-navy">{activeToast.title}</h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{activeToast.body}</p>
          {activeToast.target_url && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 mt-2 hover:underline">
              View details <ExternalLink className="w-3 h-3" />
            </span>
          )}
        </div>
        <button
          onClick={clearToast}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
