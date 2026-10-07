import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Bell,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '../lib/supabase';
import { useNotifications } from '../context/NotificationContext';

export default function BookAppointment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { enableNotifications, isPermissionGranted } = useNotifications();

  const [treatmentsList, setTreatmentsList] = useState([]);
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_phone: '',
    patient_email: '',
    treatment_name: searchParams.get('treatment') || '',
    appointment_date: new Date().toISOString().split('T')[0],
    session: 'morning', // 'morning' (10:30AM - 2:00PM) or 'evening' (5:00PM - 9:00PM)
    time_hour: '11',
    time_minute: '15',
    time_period: 'AM',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Load treatments for dropdown
  useEffect(() => {
    async function loadTreatments() {
      const { data } = await supabase
        .from('treatments')
        .select('name_en')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (data) {
        setTreatmentsList(data.map((t) => t.name_en));
        if (!formData.treatment_name && data.length > 0) {
          setFormData((prev) => ({ ...prev, treatment_name: data[0].name_en }));
        }
      }
    }
    loadTreatments();
  }, []);

  // Update session & period helper
  const handleSessionChange = (session) => {
    if (session === 'morning') {
      setFormData((prev) => ({
        ...prev,
        session: 'morning',
        time_hour: '11',
        time_period: 'AM',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        session: 'evening',
        time_hour: '06',
        time_period: 'PM',
      }));
    }
  };

  // Validate exact time falls inside clinic working hours:
  // Morning: 10:30 AM - 2:00 PM
  // Evening: 5:00 PM - 9:00 PM
  const validateWorkingHours = (hourStr, minuteStr, period) => {
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    let hour24 = hour;
    if (period === 'PM' && hour !== 12) hour24 += 12;
    if (period === 'AM' && hour === 12) hour24 = 0;

    const timeMinutes = hour24 * 60 + minute;

    const morningStart = 10 * 60 + 30; // 10:30 AM = 630 mins
    const morningEnd = 14 * 60; // 2:00 PM = 840 mins

    const eveningStart = 17 * 60; // 5:00 PM = 1020 mins
    const eveningEnd = 21 * 60; // 9:00 PM = 1260 mins

    const isMorning = timeMinutes >= morningStart && timeMinutes <= morningEnd;
    const isEvening = timeMinutes >= eveningStart && timeMinutes <= eveningEnd;

    if (!isMorning && !isEvening) {
      return {
        valid: false,
        message:
          'Selected time is outside clinic working hours. Morning session: 10:30 AM – 2:00 PM, Evening session: 5:00 PM – 9:00 PM.',
      };
    }
    return { valid: true, exactTime: `${hourStr}:${minuteStr.padStart(2, '0')} ${period}` };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.patient_name.trim()) {
      setErrorMsg('Patient full name is required.');
      return;
    }

    if (!formData.patient_phone.trim() || formData.patient_phone.replace(/\D/g, '').length < 10) {
      setErrorMsg('Valid 10-digit mobile number is required.');
      return;
    }

    if (!formData.treatment_name) {
      setErrorMsg('Please select a dental treatment.');
      return;
    }

    // Validate exact time
    const timeCheck = validateWorkingHours(
      formData.time_hour,
      formData.time_minute,
      formData.time_period
    );

    if (!timeCheck.valid) {
      setErrorMsg(timeCheck.message);
      return;
    }

    if (!navigator.onLine) {
      setErrorMsg("You are offline. Please reconnect to submit your appointment.");
      return;
    }

    setIsSubmitting(true);

    try {
      const exactTimeStr = timeCheck.exactTime;
      const trackingToken = 'SDC-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      const appointmentNum = 'SDC-' + Date.now().toString().slice(-6);

      // Check existing appointments on this date to detect potential conflicts
      const { data: existingOnDate } = await supabase
        .from('appointments')
        .select('exact_time, patient_name')
        .eq('appointment_date', formData.appointment_date)
        .neq('status', 'Cancelled');

      let conflictWarning = null;
      if (existingOnDate && existingOnDate.length > 0) {
        // Check if another appointment has exact same or very close time
        const hasDirectMatch = existingOnDate.some((a) => a.exact_time === exactTimeStr);
        if (hasDirectMatch) {
          conflictWarning = `Note: Another appointment is scheduled around ${exactTimeStr}. Doctor will review prior to confirmation.`;
        }
      }

      // 1. Insert appointment into Supabase
      const { data: insertedAppt, error: insertError } = await supabase
        .from('appointments')
        .insert({
          appointment_num: appointmentNum,
          patient_name: formData.patient_name.trim(),
          patient_phone: formData.patient_phone.trim(),
          patient_email: formData.patient_email ? formData.patient_email.trim() : null,
          treatment_name: formData.treatment_name,
          appointment_date: formData.appointment_date,
          exact_time: exactTimeStr,
          booking_time: new Date().toISOString(),
          status: 'Pending',
          conflict_warning: conflictWarning,
          patient_tracking_token: trackingToken,
          doctor_notes: formData.message || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Save tracking token in patient's localStorage
      localStorage.setItem('sdc_patient_token', trackingToken);
      localStorage.setItem('sdc_last_appointment_id', insertedAppt.id);

      // 2. Dispatch real-time push notification to Doctor via server API
      try {
        await fetch('/api/notify/appointment-booked', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ appointment: insertedAppt }),
        });
      } catch (pushErr) {
        console.warn('[FCM] Server push notify trigger:', pushErr.message);
      }

      // Fire celebratory confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setBookingSuccess(insertedAppt);
    } catch (err) {
      console.error('Booking submission error:', err);
      if (!navigator.onLine || err.message?.toLowerCase().includes('fetch') || err.message?.toLowerCase().includes('network')) {
        setErrorMsg("You are offline. Please reconnect to submit your appointment.");
      } else {
        setErrorMsg(err.message || 'Failed to submit appointment. Please try again or call 9903424407.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {bookingSuccess ? (
        /* SUCCESS CONFIRMATION SCREEN */
        <div className="bg-white rounded-3xl border border-teal-200 p-8 sm:p-12 shadow-xl text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full">
              Booking Submitted Successfully
            </span>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-navy">
              Appointment Request Received!
            </h1>
            <p className="text-sm text-slate-600 max-w-lg mx-auto">
              Dr. Ananyo Mandal has received your request for{' '}
              <strong className="text-teal-800">{bookingSuccess.treatment_name}</strong>.
            </p>
          </div>

          {/* Appointment Summary Card */}
          <div className="max-w-md mx-auto bg-slate-50 p-6 rounded-2xl border border-slate-200/80 text-left space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Tracking ID:</span>
              <span className="font-mono font-bold text-teal-800">{bookingSuccess.patient_tracking_token}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Patient:</span>
              <span className="font-bold text-navy">{bookingSuccess.patient_name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Appointment Date:</span>
              <span className="font-bold text-navy">{bookingSuccess.appointment_date}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Exact Requested Time:</span>
              <span className="font-bold text-teal-700 text-base">{bookingSuccess.exact_time}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-slate-500">Current Status:</span>
              <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 text-xs font-bold">
                {bookingSuccess.status} (Doctor Reviewing)
              </span>
            </div>
          </div>

          {/* Push Notification Opt-in Prompt */}
          {!isPermissionGranted && (
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl max-w-md mx-auto text-left flex items-start gap-3">
              <Bell className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-bold text-teal-900">Receive Push Alerts When Confirmed?</h4>
                <p className="text-[11px] text-teal-700 mt-0.5">
                  Get an instant notification sound on this device when Dr. Mandal accepts your slot.
                </p>
                <button
                  onClick={() => enableNotifications('patient', bookingSuccess.patient_tracking_token)}
                  className="mt-2 text-xs font-bold px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 active:scale-95 transition-all"
                >
                  Enable Push Notifications
                </button>
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => navigate(`/track?token=${bookingSuccess.patient_tracking_token}`)}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-heading font-semibold text-sm transition-all shadow-clinical"
            >
              Track Appointment Live
            </button>
            <button
              onClick={() => {
                setBookingSuccess(null);
                setFormData((prev) => ({ ...prev, patient_name: '', message: '' }));
              }}
              className="px-5 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-sm transition-all"
            >
              Book Another Appointment
            </button>
          </div>
        </div>
      ) : (
        /* BOOKING FORM */
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-clinical space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-teal-600" /> Exact Preferred Time Booking
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-navy">
              Book Your Dental Consultation
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              No fixed 30-minute restrictions. Select your preferred exact time inside clinic hours.
            </p>
          </div>

          {/* Clinic Hours Reminder */}
          <div className="p-4 bg-teal-50/70 border border-teal-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-teal-900 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span><strong>Working Hours:</strong> Open 7 Days A Week (No Weekly Off)</span>
            </div>
            <div className="flex items-center gap-3 text-teal-800 font-semibold">
              <span>Morning: 10:30 AM – 2:00 PM</span>
              <span>•</span>
              <span>Evening: 5:00 PM – 9:00 PM</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Patient Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-teal-600" /> Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.patient_name}
                  onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-teal-600" /> Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={formData.patient_phone}
                  onChange={(e) => setFormData({ ...formData, patient_phone: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* 2. Email & Treatment Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. patient@gmail.com"
                  value={formData.patient_email}
                  onChange={(e) => setFormData({ ...formData, patient_email: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Dental Treatment <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.treatment_name}
                  onChange={(e) => setFormData({ ...formData, treatment_name: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select a treatment</option>
                  {treatmentsList.map((t, idx) => (
                    <option key={idx} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Appointment Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-navy flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-teal-600" /> Appointment Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={formData.appointment_date}
                onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* 4. EXACT PREFERRED TIME PICKER (Morning vs Evening Session) */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-teal-600" /> Preferred Exact Time
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Choose your exact time. The system records your precise requested minute.
                  </p>
                </div>

                {/* Session Toggle */}
                <div className="inline-flex p-1 bg-white border border-slate-200 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleSessionChange('morning')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      formData.session === 'morning'
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-navy'
                    }`}
                  >
                    Morning (10:30 AM – 2:00 PM)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSessionChange('evening')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      formData.session === 'evening'
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-navy'
                    }`}
                  >
                    Evening (5:00 PM – 9:00 PM)
                  </button>
                </div>
              </div>

              {/* Exact Time Inputs: Hour, Minute, Period */}
              <div className="grid grid-cols-3 gap-3 max-w-sm">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Hour</label>
                  <select
                    value={formData.time_hour}
                    onChange={(e) => setFormData({ ...formData, time_hour: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-navy focus:ring-2 focus:ring-teal-500"
                  >
                    {formData.session === 'morning' ? (
                      <>
                        <option value="10">10 (from 10:30)</option>
                        <option value="11">11</option>
                        <option value="12">12</option>
                        <option value="01">01</option>
                        <option value="02">02 (until 2:00)</option>
                      </>
                    ) : (
                      <>
                        <option value="05">05 (from 5:00)</option>
                        <option value="06">06</option>
                        <option value="07">07</option>
                        <option value="08">08</option>
                        <option value="09">09 (until 9:00)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Minute</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={formData.time_minute}
                    onChange={(e) => {
                      const val = e.target.value.slice(0, 2);
                      setFormData({ ...formData, time_minute: val });
                    }}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-navy focus:ring-2 focus:ring-teal-500"
                    placeholder="e.g. 17"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Period</label>
                  <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-center text-teal-800">
                    {formData.session === 'morning' && (formData.time_hour === '01' || formData.time_hour === '02')
                      ? 'PM'
                      : formData.session === 'morning'
                      ? 'AM'
                      : 'PM'}
                  </div>
                </div>
              </div>

              {/* Exact requested time preview */}
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-500">Your requested exact time:</span>
                <span className="font-heading font-extrabold text-teal-700 text-sm">
                  {formData.time_hour}:{formData.time_minute.padStart(2, '0')}{' '}
                  {formData.session === 'morning' && (formData.time_hour === '01' || formData.time_hour === '02')
                    ? 'PM'
                    : formData.session === 'morning'
                    ? 'AM'
                    : 'PM'}
                </span>
              </div>
            </div>

            {/* 5. Additional Message / Reason */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-navy flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" /> Additional Notes or Dental Symptoms{' '}
                <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows="3"
                placeholder="Mention any pain, swelling, tooth location, or previous treatment details..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white rounded-xl font-heading font-bold text-base shadow-clinical hover:shadow-clinical-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>Submitting Appointment...</>
              ) : (
                <>
                  <Calendar className="w-5 h-5" /> Request Appointment with Dr. Mandal
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
