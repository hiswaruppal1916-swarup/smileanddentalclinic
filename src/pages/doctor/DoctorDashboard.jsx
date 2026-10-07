import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Phone,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Clock4,
  AlertTriangle,
  Bell,
  Settings,
  LogOut,
  RefreshCw,
  Search,
  Check,
  Send,
  FileText,
  Smartphone,
  Laptop,
  Sparkles,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export default function DoctorDashboard() {
  const { session, logoutDoctor, isDoctor } = useAuth();
  const navigate = useNavigate();
  const { enableNotifications, isPermissionGranted } = useNotifications();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'today', 'upcoming', 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectModalAppt, setRejectModalAppt] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [testPushStatus, setTestPushStatus] = useState('');

  // Protect route
  useEffect(() => {
    if (!session && !isDoctor) {
      navigate('/doctor/login');
    }
  }, [session, isDoctor, navigate]);

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: true })
        .order('exact_time', { ascending: true });

      if (!error && data) {
        setAppointments(data);
      }
    } catch (err) {
      console.error('Fetch appointments error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();

    // Setup Supabase Realtime subscription
    const channel = supabase
      .channel('doctor_appointments_live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAppointments((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setAppointments((prev) =>
              prev.map((a) => (a.id === payload.new.id ? payload.new : a))
            );
          } else if (payload.eventType === 'DELETE') {
            setAppointments((prev) => prev.filter((a) => a.id === payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Update appointment status and trigger patient FCM push notification
  const handleStatusChange = async (appointmentId, newStatus, reason = null) => {
    setIsUpdating(true);
    try {
      // 1. Update Supabase
      const { data, error } = await supabase
        .from('appointments')
        .update({
          status: newStatus,
          doctor_notes: reason ? reason : undefined,
          updated_at: new Date().toISOString(),
        })
        .eq('id', appointmentId)
        .select()
        .single();

      if (error) throw error;

      // 2. Dispatch FCM Push Notification to Patient
      await fetch('/api/notify/status-updated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointment_id: appointmentId,
          status: newStatus,
          notes: reason,
        }),
      });

      // Update local state
      setAppointments((prev) => prev.map((a) => (a.id === appointmentId ? data : a)));
      setRejectModalAppt(null);
      setRejectReason('');
    } catch (err) {
      console.error('Status update error:', err);
      alert('Failed to update status: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Test System Push to Doctor Device
  const handleTestDoctorPush = async () => {
    setTestPushStatus('Sending test push...');
    try {
      const res = await fetch('/api/notify/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'doctor',
          title: 'Smile & Dental Clinic 🦷',
          body: 'Doctor FCM push notification test was successful!',
        }),
      });
      const data = await res.json();
      setTestPushStatus(`Push sent to ${data.recipientCount || 1} registered device(s)!`);
      setTimeout(() => setTestPushStatus(''), 4000);
    } catch (e) {
      setTestPushStatus('Failed: ' + e.message);
    }
  };

  // Enable Doctor FCM on this device
  const handleRegisterCurrentDevice = async () => {
    const success = await enableNotifications('doctor', 'doctor');
    if (success) {
      alert('This device is now registered to receive real-time Doctor push notifications!');
    }
  };

  // Filter calculations
  const todayStr = new Date().toISOString().split('T')[0];

  const pendingAppointments = appointments.filter((a) => a.status === 'Pending');
  const todayAppointments = appointments.filter((a) => a.appointment_date === todayStr);
  const upcomingAppointments = appointments.filter(
    (a) => a.appointment_date >= todayStr && a.status === 'Accepted'
  );

  const displayedAppointments = appointments.filter((a) => {
    const matchesSearch =
      a.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.patient_phone.includes(searchQuery) ||
      a.treatment_name.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'pending') return a.status === 'Pending';
    if (activeTab === 'today') return a.appointment_date === todayStr;
    if (activeTab === 'upcoming') return a.appointment_date >= todayStr && a.status === 'Accepted';
    if (activeTab === 'completed') return a.status === 'Completed';
    return true; // 'all'
  });

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* 1. DOCTOR PORTAL HEADER */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src="/assets/logo.jpg" alt="Logo" className="w-12 h-12 object-contain" />
          <div>
            <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-navy">
              Dr. Ananyo Mandal — Portal
            </h1>
            <p className="text-xs text-slate-500">
              Smile & Dental Clinic • Live Management & FCM Notifications
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Register Current Device for FCM Push */}
          <button
            onClick={handleRegisterCurrentDevice}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isPermissionGranted
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'
            }`}
            title="Register this browser/device for Doctor system push"
          >
            <Smartphone className="w-3.5 h-3.5" />
            {isPermissionGranted ? 'Device Push Active' : 'Enable Push On This Device'}
          </button>

          {/* Test System Push Button */}
          <button
            onClick={handleTestDoctorPush}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-navy rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
            title="Test Push"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Test Push
          </button>

          {/* Settings */}
          <Link
            to="/doctor/settings"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
            title="Manage Treatments & Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>

          {/* Logout */}
          <button
            onClick={logoutDoctor}
            className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl transition-all"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {testPushStatus && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{testPushStatus}</span>
        </div>
      )}

      {/* 2. STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('pending')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'pending'
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Pending Requests
            </span>
            <Clock4 className="w-4 h-4 text-amber-600" />
          </div>
          <p className="font-heading font-extrabold text-2xl sm:text-3xl text-navy mt-2">
            {pendingAppointments.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Awaiting your approval</p>
        </div>

        <div
          onClick={() => setActiveTab('today')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'today'
              ? 'bg-teal-50/80 border-teal-300 ring-2 ring-teal-400'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
              Today's Patients
            </span>
            <Calendar className="w-4 h-4 text-teal-600" />
          </div>
          <p className="font-heading font-extrabold text-2xl sm:text-3xl text-navy mt-2">
            {todayAppointments.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">{todayStr}</p>
        </div>

        <div
          onClick={() => setActiveTab('upcoming')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'upcoming'
              ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-400'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
              Upcoming Confirmed
            </span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="font-heading font-extrabold text-2xl sm:text-3xl text-navy mt-2">
            {upcomingAppointments.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Accepted schedule</p>
        </div>

        <div
          onClick={() => setActiveTab('all')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'all'
              ? 'bg-slate-100 border-slate-400'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Total Log
            </span>
            <FileText className="w-4 h-4 text-slate-500" />
          </div>
          <p className="font-heading font-extrabold text-2xl sm:text-3xl text-navy mt-2">
            {appointments.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">All records</p>
        </div>
      </div>

      {/* 3. SEARCH & TABS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl overflow-x-auto">
          {[
            { id: 'pending', label: 'Pending', count: pendingAppointments.length },
            { id: 'today', label: 'Today', count: todayAppointments.length },
            { id: 'upcoming', label: 'Upcoming', count: upcomingAppointments.length },
            { id: 'completed', label: 'Completed' },
            { id: 'all', label: 'All Records', count: appointments.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-navy hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    activeTab === tab.id ? 'bg-teal-800 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient, phone, treatment..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* 4. APPOINTMENTS LIST */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" /> Loading appointments...
          </div>
        ) : displayedAppointments.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2 text-slate-400">
            <Calendar className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
            <p className="font-medium text-sm text-slate-600">No appointments in this category</p>
            <p className="text-xs">New bookings will appear here automatically in real time.</p>
          </div>
        ) : (
          displayedAppointments.map((appt) => {
            const hasConflict = !!appt.conflict_warning;
            const bookingDateFormatted = new Date(appt.booking_time).toLocaleString();

            return (
              <div
                key={appt.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm hover:shadow-clinical transition-all space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {appt.patient_tracking_token}
                    </span>
                    <h3 className="font-heading font-extrabold text-base sm:text-lg text-navy">
                      {appt.patient_name}
                    </h3>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        appt.status === 'Accepted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : appt.status === 'Rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : appt.status === 'Completed'
                          ? 'bg-teal-100 text-teal-800'
                          : appt.status === 'Cancelled'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {appt.status}
                    </span>
                  </div>

                  {/* Booking Submission Timestamp */}
                  <div className="text-[11px] text-slate-400 sm:text-right">
                    Booked on: {bookingDateFormatted}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  {/* Treatment */}
                  <div>
                    <span className="text-slate-400 font-medium block">Procedure</span>
                    <span className="font-bold text-navy text-sm">{appt.treatment_name}</span>
                  </div>

                  {/* Appointment Date */}
                  <div>
                    <span className="text-slate-400 font-medium block">Scheduled Date</span>
                    <span className="font-bold text-navy text-sm flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" /> {appt.appointment_date}
                    </span>
                  </div>

                  {/* EXACT REQUESTED TIME (Preserved exactly!) */}
                  <div>
                    <span className="text-teal-700 font-semibold block">Exact Preferred Time</span>
                    <span className="font-heading font-extrabold text-teal-900 text-base flex items-center gap-1">
                      <Clock className="w-4 h-4 text-teal-600" /> {appt.exact_time}
                    </span>
                  </div>

                  {/* Direct Contact Links */}
                  <div>
                    <span className="text-slate-400 font-medium block">Patient Phone</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <a
                        href={`tel:${appt.patient_phone}`}
                        className="font-bold text-navy hover:text-teal-700 flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5 text-teal-600" /> {appt.patient_phone}
                      </a>
                      <a
                        href={`https://wa.me/91${appt.patient_phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Hello ${appt.patient_name}, regarding your appointment for ${appt.treatment_name} at Smile & Dental Clinic.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200"
                        title="WhatsApp Patient"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Conflict Warning Alert if applicable */}
                {hasConflict && (
                  <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl flex items-center gap-2 text-xs text-amber-800">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>{appt.conflict_warning}</span>
                  </div>
                )}

                {/* Patient Notes / Doctor Notes */}
                {appt.doctor_notes && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-0.5">
                    <span className="font-bold text-slate-500">Patient Note / Symptoms:</span>
                    <p>{appt.doctor_notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-2 justify-end">
                  {appt.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(appt.id, 'Accepted')}
                        disabled={isUpdating}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" /> Accept Appointment
                      </button>

                      <button
                        onClick={() => setRejectModalAppt(appt)}
                        disabled={isUpdating}
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject Request
                      </button>
                    </>
                  )}

                  {appt.status === 'Accepted' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(appt.id, 'Completed')}
                        disabled={isUpdating}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Mark Completed
                      </button>

                      <button
                        onClick={() => handleStatusChange(appt.id, 'Cancelled', 'Cancelled by clinic')}
                        disabled={isUpdating}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-all"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* REJECT MODAL */}
      {rejectModalAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-heading font-extrabold text-lg text-navy">
              Decline Appointment Request
            </h3>
            <p className="text-xs text-slate-600">
              Provide an optional note to send via push notification to {rejectModalAppt.patient_name} (e.g. "Doctor is in emergency surgery, please select tomorrow 6:00 PM"):
            </p>
            <textarea
              rows="3"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason / suggested alternative time..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalAppt(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusChange(rejectModalAppt.id, 'Rejected', rejectReason)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
