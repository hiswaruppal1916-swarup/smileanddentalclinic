import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquareQuote, ArrowRight, ShieldCheck, ExternalLink } from 'lucide-react';
import StarRating from './StarRating';
import { getHomepageFeaturedReviews, CLINIC_REVIEWS_SUMMARY, GOOGLE_MAPS_REVIEWS_URL } from '../data/reviews';

export default function HomepageReviews() {
  const reviews = getHomepageFeaturedReviews(6);

  return (
    <section className="py-12 sm:py-16 bg-slate-50 border-t border-slate-200/60 w-full" id="homepage-reviews">
      <div className="max-w-[1160px] w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider">
              <MessageSquareQuote className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>Patient Feedback</span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-navy">
              Trusted by Patients Across Burdwan
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Real experiences from patients treated by{' '}
              <strong className="text-teal-800 font-semibold">Dr. Ananyo Mandal</strong>. Unfiltered reviews from our verified Google Maps listing.
            </p>
          </div>

          {/* Google Rating Summary Badge */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
              <StarRating rating={5} size="w-4 h-4" />
              <div className="text-left border-l border-slate-200 pl-3">
                <span className="font-heading font-extrabold text-navy text-sm">5.0 / 5.0</span>
                <span className="text-[11px] text-slate-500 block">Google Reviews</span>
              </div>
            </div>

            <a
              href={GOOGLE_MAPS_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors shadow-sm"
              title="View clinic on Google Maps"
            >
              <ExternalLink className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>Google Maps</span>
            </a>
          </div>
        </div>

        {/* Reviews Cards Grid (Max 6 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-clinical hover:shadow-clinical-hover transition-all duration-300 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header: Avatar, Name, Stars & Date */}
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
                        <h3 className="font-heading font-bold text-sm text-navy truncate">
                          {review.name}
                        </h3>
                        {review.isLocalGuide && (
                          <span
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200 shrink-0"
                            title="Google Local Guide"
                          >
                            Guide
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{review.reviewerBadge}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <StarRating rating={review.rating} size="w-3.5 h-3.5" />
                    <span className="text-[10px] text-slate-400 block mt-0.5">{review.date}</span>
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line line-clamp-4 font-normal">
                  "{review.text}"
                </p>
              </div>

              {/* Footer: Category Tag & Verified Badge */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] gap-2">
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-800 font-medium border border-teal-100 truncate">
                  {review.category}
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> Verified Patient
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Read More Reviews Button */}
        <div className="text-center pt-2">
          <Link
            to="/reviews"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-heading font-bold text-white bg-teal-600 hover:bg-teal-700 active:scale-95 transition-all shadow-clinical hover:shadow-clinical-hover text-sm"
          >
            <span>Read More Reviews</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </Link>
        </div>
      </div>
    </section>
  );
}
