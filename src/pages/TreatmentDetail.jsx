import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft, CheckCircle2, ShieldCheck, Clock, Phone, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function TreatmentDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [treatment, setTreatment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      const { data, error } = await supabase
        .from('treatments')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!error && data) {
        setTreatment(data);
        document.title = `${data.name_en} (${data.name_bn}) | Smile & Dental Clinic Burdwan`;
      }
      setLoading(false);
    }
    fetchDetail();
  }, [slug]);

  if (loading) {
    return <div className="py-24 text-center text-slate-400">Loading procedure information...</div>;
  }

  if (!treatment) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-xl font-bold text-navy">Treatment Not Found</h2>
        <Link to="/treatments" className="text-teal-600 underline text-sm">
          Return to All Treatments
        </Link>
      </div>
    );
  }

  return (
    <article className="py-10 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Back button */}
      <Link
        to="/treatments"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-teal-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Treatments
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Graphic Poster */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-3 rounded-3xl border border-slate-200/80 shadow-clinical overflow-hidden">
            <img
              src={treatment.image_url}
              alt={`${treatment.name_en} - ${treatment.name_bn}`}
              className="w-full aspect-square object-cover rounded-2xl"
            />
          </div>

          {/* Quick Doctor Consultation Box */}
          <div className="p-4 bg-teal-50/70 border border-teal-200/60 rounded-2xl space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-700" />
              <h4 className="font-heading font-bold text-sm text-teal-900">Expert Consultation</h4>
            </div>
            <p className="text-xs text-teal-800 leading-relaxed">
              Every procedure is personally planned and executed by <strong>Dr. Ananyo Mandal</strong>, MDS in Conservative Dentistry & Endodontics.
            </p>
          </div>
        </div>

        {/* Right: Detailed Content */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-1">
            <div className="inline-block px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2">
              Dental Procedure
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-navy">
              {treatment.name_en}
            </h1>
            <p className="text-base sm:text-lg font-bold text-teal-700">{treatment.name_bn}</p>
          </div>

          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
            {treatment.full_desc || treatment.short_desc}
          </p>

          {/* Key Advantages / Features */}
          {treatment.features && treatment.features.length > 0 && (
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <h3 className="font-heading font-bold text-sm text-navy flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" /> Key Clinical Advantages
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {treatment.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clinic Hours Info */}
          <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-600">
            <Clock className="w-5 h-5 text-teal-600 shrink-0" />
            <div>
              <p className="font-bold text-navy">Open 7 Days a Week</p>
              <p>Morning 10:30 AM – 2:00 PM • Evening 5:00 PM – 9:00 PM</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <Link
              to={`/book?treatment=${encodeURIComponent(treatment.name_en)}`}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-heading font-bold text-sm shadow-clinical transition-all active:scale-95"
            >
              <Calendar className="w-4 h-4" /> Book for {treatment.name_en}
            </Link>

            <a
              href="tel:9903424407"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-200 text-navy hover:bg-slate-50 rounded-xl font-heading font-semibold text-sm transition-all shadow-sm"
            >
              <Phone className="w-4 h-4 text-teal-600" /> Call for Inquiries
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
