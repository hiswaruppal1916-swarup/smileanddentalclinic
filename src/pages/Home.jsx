import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Award,
  Stethoscope,
  HeartPulse,
  ExternalLink,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTreatments() {
      const { data } = await supabase
        .from('treatments')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .limit(6);
      if (data) setTreatments(data);
      setLoading(false);
    }
    loadTreatments();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:py-24 bg-gradient-to-b from-teal-50/60 via-canvas to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Trust Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100 text-teal-800 text-xs sm:text-sm font-semibold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Open 7 Days a Week • No Weekly Off</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-navy tracking-tight leading-[1.15]">
                Painless, Advanced Dental Care for Your{' '}
                <span className="text-teal-600 underline decoration-teal-300 underline-offset-4">
                  Healthiest Smile
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Welcome to <strong className="text-navy">Smile & Dental Clinic</strong> in Burdwan. Led by{' '}
                <strong className="text-teal-800">Dr. Ananyo Mandal</strong>, MDS (WBUHS, CAL), specializing in Conservative Dentistry, Single-Sitting Root Canals, Laser Surgery, and Aesthetic Smile Makeovers.
              </p>

              {/* Doctor Quick Badge */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-clinical max-w-xl mx-auto lg:mx-0 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-left">
                <img
                  src="/assets/dr-ananyo-mandal.jpg"
                  alt="Dr. Ananyo Mandal"
                  className="w-16 h-16 rounded-full object-cover border-2 border-teal-500 shadow-sm shrink-0"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-heading font-bold text-base text-navy">Dr. Ananyo Mandal</h3>
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                  </div>
                  <p className="text-xs font-semibold text-teal-700">MDS (WBUHS, CAL) • Cosmetic Dental Surgeon</p>
                  <p className="text-xs text-slate-500 mt-0.5">Dept. of Conservative Dentistry & Endodontics</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
                <Link
                  to="/book"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-heading font-bold text-white bg-teal-600 hover:bg-teal-700 active:scale-95 transition-all shadow-clinical hover:shadow-clinical-hover text-base"
                >
                  <Calendar className="w-5 h-5" /> Book Preferred Time
                </Link>
                <a
                  href="tel:9903424407"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-heading font-semibold text-navy bg-white hover:bg-slate-50 border border-slate-200 active:scale-95 transition-all text-base shadow-sm"
                >
                  <Phone className="w-4 h-4 text-teal-600" /> Call: 9903424407
                </a>
              </div>

              {/* Clinic Key Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-200/60 text-left text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Exact Time Booking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Painless Techniques</span>
                </div>
                <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Push Status Updates</span>
                </div>
              </div>
            </div>

            {/* Right Visual Image */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative max-w-sm sm:max-w-md w-full">
                {/* Decorative glow */}
                <div className="absolute -inset-4 bg-gradient-to-r from-teal-400 to-accent-blue opacity-20 blur-2xl rounded-3xl -z-10"></div>
                
                <div className="bg-white p-3 sm:p-4 rounded-3xl shadow-xl border border-slate-100 space-y-3">
                  <img
                    src="/assets/dr-ananyo-mandal.jpg"
                    alt="Dr. Ananyo Mandal - Cosmetic Dental Surgeon"
                    className="w-full h-80 sm:h-96 object-cover rounded-2xl"
                  />
                  <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-teal-900">Consultation Hours</p>
                      <p className="text-[11px] text-teal-700">10:30 AM – 2:00 PM • 5:00 PM – 9:00 PM</p>
                    </div>
                    <span className="px-2.5 py-1 bg-teal-600 text-white rounded-lg text-xs font-bold">
                      Open Today
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CLINIC HOURS & LOCATION STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-navy text-white rounded-3xl p-6 sm:p-8 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Working Hours */}
          <div className="flex items-start gap-4 pt-4 md:pt-0">
            <div className="p-3 rounded-2xl bg-teal-600/30 text-teal-400 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-white text-base">Open 7 Days a Week</h4>
              <p className="text-xs text-teal-300 font-semibold mt-0.5">Morning: 10:30 AM – 2:00 PM</p>
              <p className="text-xs text-teal-300 font-semibold">Evening: 5:00 PM – 9:00 PM</p>
              <p className="text-xs text-slate-400 mt-1">No weekly holidays. Walk-ins welcomed.</p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-4 pt-4 md:pt-0 md:pl-6">
            <div className="p-3 rounded-2xl bg-teal-600/30 text-teal-400 shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-white text-base">Clinic Address</h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Opposite INOX, Beside WOW MOMO,<br />
                Beside SBI ATM, Burdwan 713101
              </p>
              <a
                href="https://maps.app.goo.gl/DaxAQyaVuSHSXSck9"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-teal-400 font-bold mt-2 hover:underline"
              >
                Directions on Google Maps <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Emergency & Primary Call */}
          <div className="flex items-start gap-4 pt-4 md:pt-0 md:pl-6">
            <div className="p-3 rounded-2xl bg-accent-orange/30 text-orange-400 shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-white text-base">Contact & WhatsApp</h4>
              <a href="tel:9903424407" className="block text-lg font-bold text-white hover:text-teal-300 mt-0.5">
                9903424407
              </a>
              <p className="text-xs text-slate-400">Additional: 6297190906 • 9732085852</p>
              <p className="text-xs text-slate-400">mandalananyo@gmail.com</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TREATMENTS PREVIEW (Bilingual: English + Bengali Subtitle) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Specialized Services
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-navy">
            Comprehensive Dental & Cosmetic Treatments
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            From single-sitting painless root canals to laser gum surgery and digital smile design, we provide world-class clinical care tailored to your exact needs.
          </p>
        </div>

        {/* Treatment Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {treatments.map((treatment) => (
            <div
              key={treatment.id}
              className="group bg-white rounded-2xl border border-slate-200/80 shadow-clinical hover:shadow-clinical-hover transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Treatment Image */}
              <div className="relative aspect-square overflow-hidden bg-slate-100">
                <img
                  src={treatment.image_url}
                  alt={treatment.name_en}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-navy/80 backdrop-blur-md text-white text-[11px] font-bold">
                  {treatment.name_bn}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="space-y-0.5">
                    <h3 className="font-heading font-bold text-lg text-navy group-hover:text-teal-700 transition-colors">
                      {treatment.name_en}
                    </h3>
                    <p className="text-xs font-semibold text-teal-700 font-body">
                      {treatment.name_bn}
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                    {treatment.short_desc}
                  </p>
                </div>

                {/* Features Pills */}
                {treatment.features && treatment.features.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {treatment.features.slice(0, 2).map((feat, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                )}

                {/* Card CTA Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    to={`/treatments/${treatment.slug}`}
                    className="text-xs font-bold text-slate-600 hover:text-teal-700 transition-colors flex items-center gap-1"
                  >
                    View Details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    to={`/book?treatment=${encodeURIComponent(treatment.name_en)}`}
                    className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1"
                  >
                    <Calendar className="w-3.5 h-3.5" /> Book
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Treatments CTA */}
        <div className="text-center pt-4">
          <Link
            to="/treatments"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-heading font-bold text-teal-800 bg-teal-100/70 hover:bg-teal-200/70 transition-all text-sm"
          >
            Explore All 12 Dental Treatments <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 4. WHY CHOOSE SMILE & DENTAL CLINIC */}
      <section className="bg-slate-50 py-16 sm:py-20 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-heading font-extrabold text-3xl text-navy">
              Why Patients Trust Dr. Ananyo Mandal
            </h2>
            <p className="text-sm text-slate-600">
              Modern clinical protocols designed to remove dental anxiety through comfortable care and long-lasting results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-clinical space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-base text-navy">Specialist Endodontist</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                MDS in Conservative Dentistry & Endodontics ensures mastery over root canal preservation and tooth biology.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-clinical space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-base text-navy">Painless Dental Care</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Modern electronic apex locators, rotary files, and gentle local anesthesia minimize patient discomfort.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-clinical space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-base text-navy">Laser & Cosmetic Care</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Diode laser for soft tissue surgery, UV ray composite fillings, and digital smile proportion makeover.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-clinical space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-base text-navy">Exact-Time Appointments</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Select your preferred exact time during morning (10:30AM–2PM) or evening (5PM–9PM) sessions with zero slot rounding.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION: BOOK WITH EXACT TIME */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-teal-800 via-teal-700 to-navy text-white p-8 sm:p-12 lg:p-16 shadow-2xl">
          <div className="max-w-2xl space-y-6">
            <span className="inline-block px-3 py-1 rounded-full bg-teal-500/30 text-teal-200 text-xs font-bold uppercase tracking-wider">
              Immediate Patient Scheduling
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl leading-tight">
              Ready for a Healthier, Confident Smile?
            </h2>
            <p className="text-sm sm:text-base text-teal-100 leading-relaxed">
              Book your preferred exact time today. Dr. Ananyo Mandal reviews every appointment personally and sends instant push notifications right to your device.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/book"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-heading font-bold text-teal-900 bg-white hover:bg-teal-50 transition-all text-base shadow-lg"
              >
                <Calendar className="w-5 h-5 text-teal-600" /> Book Exact Time Now
              </Link>
              <a
                href="https://wa.me/919903424407"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-heading font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all text-base"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
