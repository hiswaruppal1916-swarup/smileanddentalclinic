import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy text-slate-300 pt-16 pb-24 lg:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-slate-800">
          {/* Clinic Brand & Doctor Credential */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/assets/logo.jpg"
                alt="Smile & Dental Clinic"
                className="h-12 w-auto bg-white p-1 rounded-xl object-contain"
              />
              <div>
                <h3 className="font-heading font-extrabold text-white text-lg leading-tight">
                  Smile & Dental Clinic
                </h3>
                <p className="text-teal-400 text-xs font-medium">Burdwan, West Bengal</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              State-of-the-art aesthetic dentistry, painless root canals, and restorative dental surgery led by Dr. Ananyo Mandal.
            </p>
            <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 text-xs space-y-1">
              <p className="font-bold text-white text-sm">Dr. Ananyo Mandal</p>
              <p className="text-teal-300 font-medium">MDS (WBUHS, CAL)</p>
              <p className="text-slate-400">Dept. of Conservative Dentistry & Endodontics</p>
              <p className="text-slate-400">Cosmetic Dental Surgeon</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-white text-base mb-4 tracking-wide">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-teal-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-teal-400 transition-colors">About Dr. Ananyo Mandal</Link>
              </li>
              <li>
                <Link to="/treatments" className="hover:text-teal-400 transition-colors">All Dental Treatments</Link>
              </li>
              <li>
                <Link to="/book" className="hover:text-teal-400 transition-colors text-teal-300 font-semibold">Book Preferred Time</Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-teal-400 transition-colors">Track Your Appointment</Link>
              </li>
              <li>
                <Link to="/team" className="hover:text-teal-400 transition-colors">Dental Care Team</Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-teal-400 transition-colors">Clinic Gallery</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-teal-400 transition-colors">Location & Contact</Link>
              </li>
              <li>
                <Link to="/doctor/login" className="hover:text-teal-400 transition-colors text-slate-500 text-xs flex items-center gap-1 pt-2">
                  <ShieldCheck className="w-3.5 h-3.5" /> Doctor Portal Access
                </Link>
              </li>
            </ul>
          </div>

          {/* Clinic Hours */}
          <div>
            <h4 className="font-heading font-bold text-white text-base mb-4 tracking-wide flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-400" /> Clinic Hours
            </h4>
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                <span className="font-bold text-white">OPEN 7 DAYS A WEEK</span>
              </div>
              <p className="text-xs text-slate-400">No weekly closed days. Walk-ins & bookings welcome daily.</p>
              <div className="border-t border-slate-700 pt-2 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-medium text-teal-300">Morning Session:</span>
                  <span className="font-semibold text-white">10:30 AM – 2:00 PM</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-medium text-teal-300">Evening Session:</span>
                  <span className="font-semibold text-white">5:00 PM – 9:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Location */}
          <div className="space-y-3.5">
            <h4 className="font-heading font-bold text-white text-base mb-4 tracking-wide flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-400" /> Location & Contact
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              Opposite INOX, Beside WOW MOMO, Beside SBI ATM<br />
              Burdwan 713101, West Bengal
            </p>

            <a
              href="https://maps.app.goo.gl/DaxAQyaVuSHSXSck9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-teal-800/50 hover:bg-teal-700/60 border border-teal-600/50 text-teal-200 text-xs font-semibold transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View on Google Maps
            </a>

            <div className="pt-2 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-400">Primary (Call / WhatsApp):</p>
                  <a href="tel:9903424407" className="font-bold text-white text-sm hover:text-teal-300">
                    9903424407
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-400">Additional Clinic Lines:</p>
                  <div className="flex flex-wrap gap-2 text-slate-200 font-medium">
                    <a href="tel:6297190906" className="hover:text-teal-300">6297190906</a>
                    <span>•</span>
                    <a href="tel:9732085852" className="hover:text-teal-300">9732085852</a>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <a href="mailto:mandalananyo@gmail.com" className="text-slate-300 hover:text-teal-300">
                  mandalananyo@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & legal */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Smile & Dental Clinic. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-slate-400 transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
