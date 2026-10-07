import React from 'react';
import { Phone, MessageCircle, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FloatingActions() {
  const primaryPhone = '9903424407';
  const whatsappUrl = `https://wa.me/91${primaryPhone}?text=${encodeURIComponent(
    'Hello Dr. Ananyo Mandal, I would like to book a dental consultation at Smile & Dental Clinic.'
  )}`;

  return (
    <aside aria-label="Quick contact actions" className="fixed bottom-5 right-4 z-40 flex flex-col gap-2.5 items-end">
      {/* Floating Book Button */}
      <Link
        to="/book"
        className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-full font-heading font-semibold text-xs sm:text-sm shadow-floating hover:scale-105 active:scale-95 transition-all"
        title="Book Appointment"
      >
        <Calendar className="w-4 h-4" />
        <span className="hidden sm:inline">Book Preferred Time</span>
        <span className="sm:hidden">Book Now</span>
      </Link>

      {/* Floating WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-12 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-floating hover:scale-110 active:scale-95 transition-all"
        aria-label="Chat on WhatsApp"
        title="WhatsApp: 9903424407"
      >
        <MessageCircle className="w-6 h-6 fill-current" />
      </a>

      {/* Floating Direct Call Button */}
      <a
        href={`tel:${primaryPhone}`}
        className="flex items-center justify-center w-12 h-12 bg-teal-700 hover:bg-teal-800 text-white rounded-full shadow-floating hover:scale-110 active:scale-95 transition-all"
        aria-label="Direct Call Doctor"
        title="Call: 9903424407"
      >
        <Phone className="w-5 h-5" />
      </a>
    </aside>
  );
}
