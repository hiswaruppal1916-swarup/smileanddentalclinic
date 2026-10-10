import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Clock4,
  XCircle,
  FileText,
  AlertCircle,
  Phone,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNotifications } from '../context/NotificationContext';

export default function AppointmentTracking() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token');
  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('sdc_patient_token') : null;

  const [inputToken, setInputToken] = useState(tokenFromUrl || storedToken || '');
  const [appointment, setAppointment] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchAppointment = async (tokenToUse) => {
    if (!tokenToUse || !tokenToUse.trim()) return;
    setLoading(true);
    setErrorMsg('');

    try {
      // Security: fetch exclusively by patient tracking token
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_tracking_token', tokenToUse.trim().toUpperCase())
        .single();

      if (error || !data) {
        setAppointment(null);
        setErrorMsg('No appointment found matching this tracking code. Please verify and try again.');
      } else {
        setAppointment(data);
        localStorage.setItem('sdc_patient_token', data.patient_tracking_token);
        window.dispatchEvent(new CustomEvent('sdc-patient-token-updated', { detail: data.patient_tracking_token }));

        // Fetch related notifications
        const { data: notifs } = await supabase
          .from('notifications')
          .select('*')
          .eq('recipient_id', data.patient_tracking_token)
          .order('created_at', { ascending: false });

        if (notifs) setNotifications(notifs);
      }
    } catch (err) {
      console.error('Tracking fetch error:', err);
      setErrorMsg('Error looking up appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialToken = tokenFromUrl || storedToken;
    if (initialToken) {
      fetchAppointment(initialToken);
    }
  }, [tokenFromUrl]);

  // Setup Supabase Realtime for this appointment so status updates live!
  useEffect(() => {
    if (!appointment?.id) return;

    const channel = supabase
      .channel(`patient_appt_${appointment.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointments',
          filter: `id=eq.${appointment.id}`,
        },
        (payload) => {
          setAppointment(payload.new);
          supabase
            .from('notifications')
            .select('*')
            .eq('recipient_id', payload.new.patient_tracking_token)
            .order('created_at', { ascending: false })
            .then(({ data: notifs }) => {
              if (notifs) setNotifications(notifs);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [appointment?.id]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAppointment(inputToken);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Accepted':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed by Doctor
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-bold">
            <XCircle className="w-3.5 h-3.5" /> Could Not Be Confirmed
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
            <Clock4 className="w-3.5 h-3.5" /> Pending Doctor Review
          </span>
        );
    }
  };

  return (
    <div className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Secure Tracking
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-navy">
          Track Your Appointment
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Enter your unique tracking token to inspect your real-time booking status and Dr. Mandal's notes.
        </p>
      </div>

      {/* Search Input Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-clinical max-w-xl mx-auto">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              placeholder="e.g. SDC-X7K9LP"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 uppercase"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold text-sm rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Track'}
          </button>
        </form>

        {errorMsg && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Appointment Live Status Card */}
      {appointment && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-clinical space-y-8 animate-fadeIn">
          {/* Top Status Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                  {appointment.patient_tracking_token}
                </span>
                <span className="text-xs text-slate-400">Ref: {appointment.appointment_num}</span>
              </div>
              <h2 className="font-heading font-extrabold text-2xl text-navy mt-1.5">
                {appointment.treatment_name}
              </h2>
            </div>
            <div>{getStatusBadge(appointment.status)}</div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs sm:text-sm">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-teal-600" /> Appointment Date
              </span>
              <p className="font-bold text-navy text-base">{appointment.appointment_date}</p>
            </div>

            <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-100 space-y-1">
              <span className="text-teal-700 flex items-center gap-1 font-semibold">
                <Clock className="w-3.5 h-3.5 text-teal-600" /> Exact Requested Time
              </span>
              <p className="font-heading font-extrabold text-teal-900 text-lg">
                {appointment.exact_time}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-slate-500">Patient Name</span>
              <p className="font-bold text-navy text-base">{appointment.patient_name}</p>
              <p className="text-slate-400 text-xs">{appointment.patient_phone}</p>
            </div>
          </div>

          {/* Doctor Notes / Comments */}
          {appointment.doctor_notes && (
            <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/70 space-y-1 text-xs">
              <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-700" /> Note from Dr. Ananyo Mandal
              </h4>
              <p className="text-amber-800 leading-relaxed">{appointment.doctor_notes}</p>
            </div>
          )}

          {/* Notifications Log for this patient */}
          {notifications.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="font-heading font-bold text-sm text-navy">
                Appointment Notification History
              </h3>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-navy">
                      <span>{n.title}</span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600">{n.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Help */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <span>Need to reschedule? Call clinic directly:</span>
            <a
              href="tel:9903424407"
              className="inline-flex items-center gap-1.5 font-bold text-teal-700 hover:text-teal-800"
            >
              <Phone className="w-3.5 h-3.5" /> 9903424407
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
