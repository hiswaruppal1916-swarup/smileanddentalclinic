import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, ExternalLink, MessageCircle, Send, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSendMessage = (e) => {
    e.preventDefault();
    const text = `Hello Dr. Ananyo Mandal,\nMy name is ${formData.name} (${formData.phone}).\nInquiry: ${formData.message}`;
    window.open(`https://wa.me/919903424407?text=${encodeURIComponent(text)}`, '_blank');
    setSent(true);
  };

  return (
    <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5 text-teal-600" /> Location & Contact
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-navy">
          Visit Smile & Dental Clinic
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Centrally located in Burdwan. We are open 7 days a week with zero weekly off days.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          {/* Address Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-clinical space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-teal-100 text-teal-700 rounded-2xl shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-base text-navy">Clinic Location</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Opposite INOX, Beside WOW MOMO, Beside SBI ATM<br />
                  Burdwan 713101, West Bengal
                </p>
              </div>
            </div>

            <a
              href="https://maps.app.goo.gl/DaxAQyaVuSHSXSck9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-heading font-bold text-xs transition-all shadow-sm"
            >
              <ExternalLink className="w-4 h-4" /> Open in Google Maps
            </a>
          </div>

          {/* Working Hours Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-clinical space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-teal-100 text-teal-700 rounded-2xl shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-navy">Opening Hours</h3>
                <p className="text-xs text-emerald-600 font-bold">Open 7 Days a Week • No Weekly Off</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-medium">Morning Session:</span>
                <span className="font-bold text-navy">10:30 AM – 2:00 PM</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-medium">Evening Session:</span>
                <span className="font-bold text-navy">5:00 PM – 9:00 PM</span>
              </div>
            </div>
          </div>

          {/* Phone & Email Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-clinical space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-teal-100 text-teal-700 rounded-2xl shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-base text-navy">Phone Numbers</h3>
                <div>
                  <p className="text-[11px] text-slate-400">Primary (Call / WhatsApp):</p>
                  <a href="tel:9903424407" className="font-heading font-extrabold text-teal-700 text-lg hover:underline">
                    9903424407
                  </a>
                </div>
                <div className="pt-2">
                  <p className="text-[11px] text-slate-400">Additional Lines:</p>
                  <div className="flex gap-3 text-xs text-slate-700 font-semibold">
                    <a href="tel:6297190906" className="hover:text-teal-700">6297190906</a>
                    <span>•</span>
                    <a href="tel:9732085852" className="hover:text-teal-700">9732085852</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center gap-3 text-xs sm:text-sm text-slate-600">
              <Mail className="w-5 h-5 text-teal-600 shrink-0" />
              <a href="mailto:mandalananyo@gmail.com" className="hover:text-teal-700 font-medium">
                mandalananyo@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Right: Interactive Message & Google Maps Embed View */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quick WhatsApp Inquiry Form */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-clinical space-y-6">
            <div className="space-y-1">
              <h3 className="font-heading font-bold text-xl text-navy flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-500" /> Send a Direct Message
              </h3>
              <p className="text-xs text-slate-500">
                Have a quick question about a dental symptom or treatment? Send a message directly to Dr. Mandal.
              </p>
            </div>

            {sent ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Message opened on WhatsApp. Dr. Mandal will respond shortly!</span>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Your Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <textarea
                  rows="3"
                  required
                  placeholder="How can Dr. Mandal assist you today?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />

                <button
                  type="submit"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-heading font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Send Direct WhatsApp Inquiry
                </button>
              </form>
            )}
          </div>

          {/* Location Landmark Map Embed Graphic */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-4">
            <h4 className="font-heading font-bold text-sm text-navy">Landmark Guidance</h4>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2">
              <p>
                <strong>Landmarks:</strong> Right opposite <strong>INOX Burdwan</strong>, beside <strong>WOW MOMO</strong>, and adjacent to the <strong>SBI ATM</strong>.
              </p>
              <p className="text-slate-500">
                Ample parking space available for cars and two-wheelers in the commercial complex.
              </p>
            </div>
            <a
              href="https://maps.app.goo.gl/DaxAQyaVuSHSXSck9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 hover:text-teal-800"
            >
              Get Turn-by-Turn GPS Directions <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
