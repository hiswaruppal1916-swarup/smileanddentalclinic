import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Calendar,
  ArrowLeft,
  ExternalLink,
  MessageSquareQuote,
  CheckCircle2,
  Sparkles,
  Image as ImageIcon,
  X,
  Phone,
} from 'lucide-react';
import StarRating from '../components/StarRating';
import {
  getReviews,
  CLINIC_REVIEWS_SUMMARY,
  GOOGLE_MAPS_REVIEWS_URL,
} from '../data/reviews';

export default function Reviews() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeProofModal, setActiveProofModal] = useState(null);

  // SEO Document Title & Description
  useEffect(() => {
    const originalTitle = document.title;
    document.title =
      'Patient Reviews | Smile & Dental Clinic - Dr. Ananyo Mandal, Burdwan';

    let metaDesc = document.querySelector('meta[name="description"]');
    const originalDesc = metaDesc ? metaDesc.getAttribute('content') : '';
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Read authentic patient reviews for Dr. Ananyo Mandal at Smile & Dental Clinic, Burdwan. Verified testimonials on painless root canal treatments, zirconia crowns, and compassionate dental care.'
      );
    }

    return () => {
      document.title = originalTitle;
      if (metaDesc && originalDesc) {
        metaDesc.setAttribute('content', originalDesc);
      }
    };
  }, []);

  // Cap at maximum 20 reviews
  const allReviews = getReviews(20);

  // Filter reviews
  const filteredReviews = allReviews.filter((r) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'rct') {
      return (
        r.category.toLowerCase().includes('rct') ||
        r.category.toLowerCase().includes('root canal') ||
        r.text.toLowerCase().includes('rct') ||
        r.text.toLowerCase().includes('root canal')
      );
    }
    if (selectedCategory === 'caps') {
      return (
        r.category.toLowerCase().includes('cap') ||
        r.category.toLowerCase().includes('zircon') ||
        r.category.toLowerCase().includes('bridge') ||
        r.text.toLowerCase().includes('cap') ||
        r.text.toLowerCase().includes('bridge')
      );
    }
    if (selectedCategory === 'emergency') {
      return (
        r.category.toLowerCase().includes('emergency') ||
        r.text.toLowerCase().includes('emergency') ||
        r.text.toLowerCase().includes('pain')
      );
    }
    return true;
  });

  const categories = [
    { id: 'all', label: `All Reviews (${allReviews.length})` },
    { id: 'rct', label: 'Root Canal (RCT)' },
    { id: 'caps', label: 'Zirconia Caps & Bridges' },
    { id: 'emergency', label: 'Emergency & Pain Relief' },
  ];

  return (
    <div className="py-8 sm:py-12 lg:py-16 space-y-10 sm:space-y-14 w-full">
      {/* 1. HERO HEADER SECTION */}
      <section className="max-w-[1160px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb / Back Link */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-teal-700 hover:text-teal-800 transition-colors bg-teal-50 hover:bg-teal-100/70 px-3.5 py-2 rounded-xl border border-teal-100 w-fit"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Back to Homepage</span>
          </Link>
        </div>

        {/* Hero Content Card */}
        <div className="bg-gradient-to-br from-teal-50/70 via-white to-slate-50 border border-teal-100/90 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-clinical w-full">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-8 w-full">
            {/* Left Content */}
            <div className="flex-1 min-w-0 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider">
                <MessageSquareQuote className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>Authentic Patient Experiences</span>
              </div>

              <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-navy tracking-tight leading-tight">
                Patient Reviews
              </h1>

              <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
                Every smile has a story. Here are genuine reviews from patients treated by{' '}
                <strong className="text-navy font-semibold">Dr. Ananyo Mandal</strong> at{' '}
                <strong className="text-teal-800 font-semibold">Smile & Dental Clinic</strong> in Burdwan. We believe in transparent, compassionate, and painless dental care.
              </p>

              {/* Trust Features */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-xs text-slate-600 font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Verified Google Maps Reviews
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  100% Authentic Patient Submissions
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Open 7 Days a Week
                </span>
              </div>
            </div>

            {/* Right: Google Scorecard Box */}
            <div className="w-full lg:w-[320px] shrink-0 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
              <div className="space-y-1.5">
                <div className="font-heading font-extrabold text-4xl sm:text-5xl text-navy">
                  5.0
                </div>
                <div className="flex justify-center">
                  <StarRating rating={5} size="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-500 font-medium pt-1">
                  Based on verified Google Maps reviews
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
                <a
                  href={GOOGLE_MAPS_REVIEWS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-heading font-semibold text-xs transition-all shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Verify on Google Maps</span>
                </a>
                <Link
                  to="/book"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-heading font-semibold text-xs transition-all shadow-sm"
                >
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>Book Exact Appointment</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FILTER PILLS & REVIEWS DISPLAY */}
      <section className="max-w-[1160px] w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Category Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <p className="text-xs text-slate-500 shrink-0">
            Showing <strong className="text-navy">{filteredReviews.length}</strong> of{' '}
            <strong className="text-navy">{allReviews.length}</strong> verified reviews
          </p>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-clinical hover:shadow-clinical-hover transition-all duration-300 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-4">
                {/* Header: Reviewer Avatar, Name, Rating & Date */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center font-heading font-bold text-sm border shadow-xs shrink-0 ${review.avatarBg}`}
                      aria-hidden="true"
                    >
                      {review.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-heading font-bold text-sm sm:text-base text-navy truncate">
                          {review.name}
                        </h3>
                        {review.isLocalGuide && (
                          <span
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200 shrink-0"
                            title="Google Local Guide"
                          >
                            Local Guide
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{review.reviewerBadge}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <StarRating rating={review.rating} size="w-3.5 h-3.5" />
                    <span className="text-[11px] text-slate-400 block mt-0.5">{review.date}</span>
                  </div>
                </div>

                {/* Review Text Body */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
                  "{review.text}"
                </p>
              </div>

              {/* Bottom Card Meta: Category, Verified Badge & Screenshot Proof View */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 font-medium border border-teal-100 text-[11px]">
                    {review.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> Verified
                  </span>
                </div>

                {review.proofImage && (
                  <button
                    onClick={() => setActiveProofModal(review)}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-teal-700 font-medium transition-colors cursor-pointer shrink-0"
                    title="View original Google Maps review screenshot"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>View Proof</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. PROOF LIGHTBOX MODAL */}
      {activeProofModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setActiveProofModal(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-heading font-bold text-base text-navy">
                  Original Google Maps Screenshot Proof
                </h4>
                <p className="text-xs text-slate-500">
                  Review by <strong>{activeProofModal.name}</strong> • Smile & Dental Clinic
                </p>
              </div>
              <button
                onClick={() => setActiveProofModal(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                aria-label="Close proof view"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-auto flex-1 rounded-xl bg-slate-100 border border-slate-200 p-2 flex items-center justify-center">
              <img
                src={activeProofModal.proofImage}
                alt={`Google review screenshot of ${activeProofModal.name}`}
                className="max-h-[65vh] w-auto object-contain rounded-lg shadow-sm"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Original screenshot from Google Maps listing
              </span>
              <a
                href={GOOGLE_MAPS_REVIEWS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-700 font-bold hover:underline inline-flex items-center gap-1"
              >
                Open Google Maps <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 4. APPOINTMENT BOOKING CTA SECTION */}
      <section className="max-w-[1160px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-teal-800 via-teal-700 to-navy text-white p-8 sm:p-12 shadow-xl">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/30 text-teal-200 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 shrink-0" /> Painless, High-Precision Care
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl leading-tight">
              Experience the Same Gentle, High-Quality Dental Care
            </h2>
            <p className="text-sm sm:text-base text-teal-100 leading-relaxed">
              Join hundreds of happy patients in Burdwan who trust Dr. Ananyo Mandal for their dental health. Book your consultation with your preferred exact time today.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                to="/book"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-heading font-bold text-teal-900 bg-white hover:bg-teal-50 transition-all text-sm shadow-lg"
              >
                <Calendar className="w-4 h-4 text-teal-600 shrink-0" /> Book Exact Time Now
              </Link>
              <a
                href="tel:9903424407"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-heading font-semibold text-white bg-teal-800/80 hover:bg-teal-800 border border-teal-500/50 transition-all text-sm"
              >
                <Phone className="w-4 h-4 text-teal-300 shrink-0" /> Call: 9903424407
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
