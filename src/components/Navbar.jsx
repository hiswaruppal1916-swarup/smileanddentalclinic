import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, Bell, Menu, X, Calendar, ShieldCheck, Stethoscope } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { unreadCount, setIsBellOpen } = useNotifications();
  const { isDoctor } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Doctor', path: '/about' },
    { name: 'Treatments', path: '/treatments' },
    { name: 'Team', path: '/team' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Track Status', path: '/track' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-200">
      {/* Top micro bar for clinic hours & quick emergency */}
      <div className="bg-teal-700 text-white text-xs py-1 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span className="font-medium whitespace-nowrap">Open 7 Days:</span>
            <span className="hidden sm:inline text-teal-100">10:30 AM – 2:00 PM & 5:00 PM – 9:00 PM</span>
            <span className="sm:hidden text-teal-100 text-[11px] truncate">10:30AM–2PM | 5PM–9PM</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 text-teal-100 shrink-0">
            <span className="hidden md:inline">Burdwan (Opposite INOX)</span>
            <a
              href="tel:9903424407"
              className="font-semibold text-white hover:text-teal-200 transition-colors flex items-center gap-1 text-[11px] sm:text-xs"
            >
              <Phone className="w-3 h-3 shrink-0" /> 9903424407
            </a>
          </div>
        </div>
      </div>

      {/* Main navigation container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink min-w-0">
            <img
              src="/assets/logo.jpg"
              alt="Smile & Dental Clinic Logo"
              className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105 shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-heading font-extrabold text-sm sm:text-lg lg:text-xl text-navy tracking-tight leading-tight truncate group-hover:text-teal-700 transition-colors">
                Smile & Dental Clinic
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium text-teal-700 flex items-center gap-1 truncate">
                <Stethoscope className="w-3 h-3 text-teal-600 shrink-0 inline" />
                <span className="truncate">Dr. Ananyo Mandal, MDS</span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.path)
                    ? 'text-teal-700 bg-teal-50 font-semibold'
                    : 'text-slate-600 hover:text-navy hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Action CTAs: [Notification Bell] [Doctor Portal Icon] [Book Appointment] [Mobile Menu] */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 shrink-0">
            {/* Notification Bell */}
            <button
              onClick={() => setIsBellOpen(true)}
              className="relative p-2 rounded-full text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 shrink-0"
              title="Notifications"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-accent-coral text-white text-[10px] font-bold rounded-full animate-bounce shadow-sm">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Doctor Portal Quick Access Icon */}
            <Link
              to={isDoctor ? '/doctor/dashboard' : '/doctor/login'}
              className="relative p-2 sm:px-2.5 sm:py-2 rounded-full xl:rounded-xl text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 flex items-center gap-1.5 shrink-0"
              title={isDoctor ? 'Doctor Portal Dashboard' : 'Doctor Portal Login'}
              aria-label="Doctor Portal"
            >
              <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
              <span className="hidden xl:inline text-xs font-semibold whitespace-nowrap">Doctor Portal</span>
            </Link>

            {/* Book Appointment CTA */}
            <Link
              to="/book"
              className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl font-heading font-semibold text-xs sm:text-sm text-white bg-teal-600 hover:bg-teal-700 active:scale-95 transition-all shadow-clinical hover:shadow-clinical-hover shrink-0"
            >
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline">Book Appointment</span>
              <span className="sm:hidden font-bold">Book</span>
            </Link>

            {/* Mobile menu hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg text-slate-600 hover:text-navy hover:bg-slate-100 focus:outline-none shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-1 shadow-lg animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-base font-medium transition-all ${
                isActive(link.path)
                  ? 'text-teal-700 bg-teal-50 font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.name}
            </Link>
          ))}

          {isDoctor ? (
            <Link
              to="/doctor/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-base font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 transition-all flex items-center gap-2"
            >
              <ShieldCheck className="w-5 h-5 text-amber-600" /> Doctor Portal Dashboard
            </Link>
          ) : (
            <Link
              to="/doctor/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:text-teal-700 hover:bg-slate-50 transition-all"
            >
              Doctor Login
            </Link>
          )}

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            <a
              href="tel:9903424407"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-100 text-navy font-semibold text-sm hover:bg-slate-200"
            >
              <Phone className="w-4 h-4 text-teal-600" /> Call Clinic: 9903424407
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
