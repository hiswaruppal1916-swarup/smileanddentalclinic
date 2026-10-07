import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Award, Stethoscope, HeartPulse, Clock, MapPin, Calendar, Phone } from 'lucide-react';

export default function About() {
  return (
    <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Hero / Bio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative max-w-sm w-full">
            <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-clinical space-y-3">
              <img
                src="/assets/dr-ananyo-mandal.jpg"
                alt="Dr. Ananyo Mandal"
                className="w-full h-96 object-cover rounded-2xl"
              />
              <div className="p-3 bg-teal-50 rounded-xl text-center space-y-1 border border-teal-100">
                <h3 className="font-heading font-extrabold text-base text-navy">Dr. Ananyo Mandal</h3>
                <p className="text-xs font-semibold text-teal-800">MDS (WBUHS, CAL)</p>
                <p className="text-[11px] text-slate-500">Dept. of Conservative Dentistry & Endodontics</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider">
              <Stethoscope className="w-3.5 h-3.5 text-teal-600" /> Specialist Profile
            </div>
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-navy leading-tight">
              Meet Dr. Ananyo Mandal
            </h1>
            <p className="text-base font-bold text-teal-700">
              Cosmetic Dental Surgeon & Specialist Endodontist
            </p>
          </div>

          <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed">
            <p>
              Dr. Ananyo Mandal holds a Master of Dental Surgery (MDS) from the West Bengal University of Health Sciences (WBUHS, CAL) specializing in the <strong>Department of Conservative Dentistry and Endodontics</strong>.
            </p>
            <p>
              His clinical focus centers on conservative tooth preservation, advanced single-sitting root canal treatments, aesthetic smile proportioning, and minimally invasive diode laser dentistry.
            </p>
            <p>
              At <strong>Smile & Dental Clinic</strong> in Burdwan, Dr. Mandal is committed to compassionate, anxiety-free patient care. Utilizing electronic apex locators, rotary endodontic micro-instrumentation, and biocompatible restorative resins, patients receive high-precision treatments designed to endure.
            </p>
          </div>

          {/* Credentials Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3">
              <Award className="w-5 h-5 text-teal-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-navy">MDS (WBUHS, CAL)</p>
                <p className="text-[11px] text-slate-500">Postgraduate Endodontics</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-navy">7 Days a Week</p>
                <p className="text-[11px] text-slate-500">Morning & Evening Consultations</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <Link
              to="/book"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-heading font-bold text-sm shadow-clinical transition-all"
            >
              <Calendar className="w-4 h-4" /> Book Consultation with Dr. Mandal
            </Link>
            <a
              href="tel:9903424407"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-200 text-navy hover:bg-slate-50 rounded-xl font-heading font-semibold text-sm transition-all"
            >
              <Phone className="w-4 h-4 text-teal-600" /> Direct Call: 9903424407
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
