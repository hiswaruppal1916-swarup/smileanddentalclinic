import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  ShieldCheck,
  HeartHandshake,
  Sparkles,
  CheckCircle2,
  Phone,
  Award,
  Clock,
  UserCheck,
} from 'lucide-react';

export default function Team() {
  // Four supporting clinic staff members
  const staffMembers = [
    {
      id: 'mayra-yasmin',
      name: 'Mayra Yasmin',
      role: 'Head Incharge of Clinic',
      badgeRole: 'Head Incharge',
      photo: '/assets/team/mayra-yasmin.jpg',
      alt: 'Mayra Yasmin — Head Incharge of Clinic at Smile & Dental Clinic',
      objectPosition: 'object-[50%_28%]',
      description:
        'Head Incharge of Clinic, overseeing daily clinic operations, operatory readiness, patient care standards, and smooth workflow coordination.',
    },
    {
      id: 'tune-chowdhury',
      name: 'Tune Chowdhury',
      role: 'Account',
      badgeRole: 'Accounts',
      photo: '/assets/team/tune-chowdhury.jpg',
      alt: 'Tune Chowdhury — Account at Smile & Dental Clinic',
      objectPosition: 'object-[50%_42%]',
      description:
        'Manages clinic accounts, financial documentation, billing records, and administrative accounts management for the clinic.',
    },
    {
      id: 'manisha-mandal',
      name: 'Manisha Mandal',
      role: 'Cashier',
      badgeRole: 'Cashier Desk',
      photo: '/assets/team/manisha-mandal.jpg',
      alt: 'Manisha Mandal — Cashier at Smile & Dental Clinic',
      objectPosition: 'object-[50%_28%]',
      description:
        'Handles patient billing, payments, fee receipts, and desk financial transactions with attentive, accurate front-office service.',
    },
    {
      id: 'rameswar-raj-mandal',
      name: 'Rameswar Raj Mandal',
      role: 'Coordinator of Clinic',
      badgeRole: 'Clinic Coordinator',
      photo: '/assets/team/rameswar-raj-mandal.jpg',
      alt: 'Rameswar Raj Mandal — Coordinator of Clinic at Smile & Dental Clinic',
      // Focus on Rameswar Raj Mandal (coordinator standing on right)
      customImageStyle: {
        transform: 'scale(1.58)',
        transformOrigin: '73% 45%',
      },
      description:
        'Coordinator of Clinic, managing patient scheduling, front-desk logistics, appointments, and day-to-day administrative support.',
    },
  ];

  return (
    <div className="py-10 sm:py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">
      {/* 1. SECTION HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100 text-teal-800 text-xs sm:text-sm font-semibold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Meet Our Team</span>
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-navy tracking-tight leading-[1.15]">
          Dedicated Dental Healthcare{' '}
          <span className="text-teal-600 underline decoration-teal-300 underline-offset-4">
            Professionals
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Experienced professionals dedicated to your dental care. Led by Dr. Ananyo Mandal, our clinic combines specialist clinical expertise with friendly, attentive patient support.
        </p>
      </div>

      {/* 2. PRIMARY DOCTOR PROFILE (HEAD OF CLINIC) */}
      <section aria-labelledby="doctor-profile-heading" className="max-w-6xl mx-auto">
        <div className="relative bg-gradient-to-br from-white via-teal-50/20 to-white rounded-3xl border border-teal-200/80 p-6 sm:p-8 lg:p-12 shadow-clinical hover:shadow-clinical-hover transition-all duration-300 overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-teal-200/30 rounded-full blur-3xl pointer-events-none -z-0"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left: Doctor Photo */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative max-w-sm w-full">
                {/* Doctor Head Badge Pill */}
                <div className="absolute -top-3 left-4 z-20 px-3.5 py-1 rounded-full bg-navy text-white text-xs font-bold shadow-md flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>Head of Clinic</span>
                </div>

                <div className="bg-white p-3 rounded-3xl border border-slate-200/80 shadow-md space-y-3">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100">
                    <img
                      src="/assets/dr-ananyo-mandal.jpg"
                      alt="Dr. Ananyo Mandal — Head of Smile & Dental Clinic"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                  {/* Consultation hours banner */}
                  <div className="p-3 bg-teal-50 rounded-xl border border-teal-100/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-teal-900 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>Open 7 Days a Week</span>
                    </div>
                    <span className="text-[11px] font-bold text-teal-700">Walk-ins Welcomed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Doctor Information */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-100 text-teal-900 text-xs font-bold uppercase tracking-wide">
                  <Award className="w-3.5 h-3.5 text-teal-700" />
                  <span>Head / Doctor</span>
                </div>
                <h2
                  id="doctor-profile-heading"
                  className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-navy tracking-tight"
                >
                  Dr. Ananyo Mandal
                </h2>
                <p className="text-sm sm:text-base font-bold text-teal-700">
                  MDS (WBUHS, CAL) • Cosmetic Dental Surgeon
                </p>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Dept. of Conservative Dentistry & Endodontics
                </p>
              </div>

              {/* Professional Description */}
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Dr. Ananyo Mandal serves as the Head of Smile & Dental Clinic in Burdwan. Specializing in advanced single-sitting painless root canals, aesthetic smile makeovers, conservative tooth preservation, and laser dentistry, Dr. Mandal personally oversees every diagnosis and treatment plan to ensure hospital-grade excellence.
              </p>

              {/* Specialization Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 pt-1 text-left text-xs max-w-md mx-auto lg:mx-0">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-medium">Specialist Endodontist</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-medium">Single-Sitting RCT</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-medium">Cosmetic Smile Design</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-medium">Diode Laser Dentistry</span>
                </div>
              </div>

              {/* Book Appointment CTA (ONLY FOR DR. ANANYO MANDAL) */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-3">
                <Link
                  to="/book"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-heading font-bold text-white bg-teal-600 hover:bg-teal-700 active:scale-95 transition-all shadow-clinical hover:shadow-clinical-hover text-sm sm:text-base"
                >
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" /> Book Appointment
                </Link>
                <a
                  href="tel:9903424407"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-heading font-semibold text-navy bg-white hover:bg-slate-50 border border-slate-200 active:scale-95 transition-all text-sm sm:text-base shadow-sm"
                >
                  <Phone className="w-4 h-4 text-teal-600" /> Call: 9903424407
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOUR CLINIC STAFF MEMBERS (SUPPORT TEAM) */}
      <section aria-labelledby="support-team-heading" className="space-y-8 sm:space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-teal-600" />
            <span>Clinic Support</span>
          </div>
          <h2
            id="support-team-heading"
            className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-navy tracking-tight"
          >
            Meet Our Support Team
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Our clinic staff members assist the Doctor in daily operations, patient coordination, and hospital-grade clinic hygiene.
          </p>
        </div>

        {/* 4-Card Grid: Desktop 4-col, Tablet 2-col, Mobile 1-col */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-7xl mx-auto">
          {staffMembers.map((staff) => (
            <div
              key={staff.id}
              className="group bg-white rounded-3xl border border-slate-200/80 shadow-clinical hover:shadow-clinical-hover hover:border-teal-300 transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Staff Photo Container */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100">
                  <img
                    src={staff.photo}
                    alt={staff.alt}
                    loading="lazy"
                    style={staff.customImageStyle || {}}
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                      staff.objectPosition || 'object-center'
                    }`}
                  />
                  {/* Role Tag Pill Over Photo */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-navy/85 backdrop-blur-md text-white text-[11px] font-bold shadow-sm">
                    {staff.badgeRole}
                  </div>
                </div>

                {/* Staff Member Details */}
                <div className="p-5 sm:p-6 pt-0 space-y-2 text-left">
                  <div className="space-y-1">
                    <h3 className="font-heading font-bold text-lg text-navy group-hover:text-teal-700 transition-colors">
                      {staff.name}
                    </h3>
                    <p className="text-xs font-bold text-teal-700 uppercase tracking-wide">
                      {staff.role}
                    </p>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {staff.description}
                  </p>
                </div>
              </div>

              {/* Subtle Bottom Accent Strip (NO BOOKING BUTTON ON ANY STAFF CARDS) */}
              <div className="px-5 sm:px-6 pb-5 pt-0">
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5 text-teal-800">
                    <UserCheck className="w-3.5 h-3.5 text-teal-600" /> Clinic Staff
                  </span>
                  <span className="text-slate-400">Smile & Dental Clinic</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. HOSPITAL-GRADE STERILIZATION & PATIENT CARE COMMITMENT */}
      <section className="max-w-4xl mx-auto bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200/80 text-center space-y-3 shadow-sm">
        <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <HeartHandshake className="w-6 h-6" />
        </div>
        <h3 className="font-heading font-bold text-lg sm:text-xl text-navy">
          Dedicated to Hospital-Grade Sterilization & Comfort
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Under Dr. Ananyo Mandal's leadership, our team follows strict Class-B autoclave sterilization protocols for all instruments, handpieces, and operatory surfaces between every patient appointment.
        </p>
      </section>
    </div>
  );
}
