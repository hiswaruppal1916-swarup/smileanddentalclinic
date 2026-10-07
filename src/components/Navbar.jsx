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
      <div className="bg-teal-700 text-white text-xs py-1 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium">Open 7 Days a Week:</span>
            <span className="hidden sm:inline text-teal-100">10:30 AM – 2:00 PM & 5:00 PM – 9:00 PM</span>
            <span className="sm:hidden text-teal-100">10:30AM–2PM | 5PM–9PM</span>
          </div>
          <div className="flex items-center gap-4 text-teal-100">
            <span className="hidden md:inline">Burdwan (Opposite INOX)</span>
            <a
              href="tel:9903424407"
              className="font-semibold text-white hover:text-teal-200 transition-colors flex items-center gap-1"
            >
              <Phone className="w-3 h-3" /> 9903424407
            </a>
          </div>
        </div>
      </div>

      {/* Main navigation container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/assets/logo.jpg"
              alt="Smile & Dental Clinic Logo"
              className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-lg sm:text-xl text-navy tracking-tight leading-tight group-hover:text-teal-700 transition-colors">
                Smile & Dental Clinic
              </span>
              <span className="text-[11px] font-medium text-teal-700 flex items-center gap-1">
                <Stethoscope className="w-3 h-3 text-teal-600 inline" /> Dr. Ananyo Mandal, MDS (CAL)
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

            {isDoctor && (
              <Link
                to="/doctor/dashboard"
                className="px-3 py-2 rounded-lg text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-all flex items-center gap-1"
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" /> Doctor Portal
              </Link>
            )}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell */}
            <button
              onClick={() => setIsBellOpen(true)}
              className="relative p-2.5 rounded-full text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
              title="Notifications"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-5 h-5 px-1 bg-accent-coral text-white text-[11px] font-bold rounded-full animate-bounce shadow-sm">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Book Appointment CTA */}
            <Link
              to="/book"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-heading font-semibold text-sm text-white bg-teal-600 hover:bg-teal-700 active:scale-95 transition-all shadow-clinical hover:shadow-clinical-hover"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Book Appointment</span>
              <span className="sm:hidden">Book</span>
            </Link>

            {/* Mobile menu hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-navy hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
