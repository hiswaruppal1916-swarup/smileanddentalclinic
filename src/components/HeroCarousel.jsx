import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Heart,
  Clock,
} from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    type: 'portrait',
    image: '/assets/hero/slide-1-portrait.jpg',
    badge: 'Compassionate Dental Care',
    badgeIcon: Heart,
    headline: 'Your Smile, Our Priority',
    subheadline: 'Gentle, painless dental treatments designed to keep you and your family smiling with lasting confidence.',
    ctaText: 'Book Preferred Time',
    ctaLink: '/book',
    alt: 'Smiling plush companions at Smile and Dental Clinic - You smile, I smile',
  },
  {
    id: 2,
    type: 'portrait',
    image: '/assets/hero/slide-2-portrait.jpg',
    badge: 'Oral Wellness & Prevention',
    badgeIcon: ShieldCheck,
    headline: 'Restore Your Confident Smile',
    subheadline: 'Better teeth, better health! Expert guidance on brushing, flossing, and lifelong preventive oral care.',
    ctaText: 'Book Preferred Time',
    ctaLink: '/book',
    alt: 'Preventive dental care guide - Better Teeth Better Health, Floss Like Boss',
  },
  {
    id: 3,
    type: 'landscape',
    image: '/assets/hero/slide-3-landscape.jpg',
    badge: 'Specialist Cosmetic Surgery',
    badgeIcon: Sparkles,
    headline: 'Advanced Dental Care',
    subheadline: 'Dr. Ananyo Mandal, MDS (WBUHS, Cal) • Opp. INOX, Big Bazar, Burdwan',
    ctaText: 'Book Preferred Time',
    ctaLink: '/book',
    alt: 'Dr. Ananyo Mandal Cosmetic Dental Surgeon banner with state-of-the-art clinic and happy smiles',
  },
  {
    id: 4,
    type: 'landscape',
    image: '/assets/hero/slide-4-landscape.jpg',
    badge: 'We Love Our Patients',
    badgeIcon: Heart,
    headline: 'Book Your Dental Appointment',
    subheadline: 'Teeth have limited repair ability — protect your natural teeth with regular checkups in Burdwan.',
    ctaText: 'Book Preferred Time',
    ctaLink: '/book',
    alt: 'Smile & Dental Clinic patient care banner - Teeth protection and checkups',
  },
];

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Touch gesture state
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const isSwipingRef = useRef(false);

  // Check user preference for reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e) => setPrefersReducedMotion(e.matches);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', listener);
    } else {
      mediaQuery.addListener(listener);
    }
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', listener);
      } else {
        mediaQuery.removeListener(listener);
      }
    };
  }, []);

  const goToSlide = useCallback((index) => {
    setCurrentIndex((index + SLIDES.length) % SLIDES.length);
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  }, []);

  // Autoplay rotation every 4.5 seconds
  useEffect(() => {
    if (isPaused || prefersReducedMotion) return;

    const timer = setInterval(() => {
      goToNext();
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused, prefersReducedMotion, goToNext]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      goToPrev();
    } else if (e.key === 'ArrowRight') {
      goToNext();
    }
  };

  // Touch events for mobile swiping
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    isSwipingRef.current = true;
    setIsPaused(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwipingRef.current) return;
    const currentY = e.touches[0].clientY;
    const deltaY = Math.abs(currentY - touchStartYRef.current);
    const deltaX = Math.abs(e.touches[0].clientX - touchStartXRef.current);

    // If scrolling vertically, let the page scroll normally
    if (deltaY > deltaX && deltaY > 20) {
      isSwipingRef.current = false;
    }
  };

  const handleTouchEnd = (e) => {
    if (!isSwipingRef.current) {
      setIsPaused(false);
      return;
    }
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartXRef.current;

    // Minimum swipe threshold: 45px
    if (deltaX > 45) {
      goToPrev();
    } else if (deltaX < -45) {
      goToNext();
    }

    isSwipingRef.current = false;
    setIsPaused(false);
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Smile & Dental Clinic Highlights"
      className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-2"
    >
      <div
        className="relative group rounded-2xl sm:rounded-3xl overflow-hidden shadow-clinical hover:shadow-clinical-hover border border-slate-200/90 bg-slate-900 transition-all duration-300 outline-none"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* CAROUSEL FIXED CONTAINER HEIGHT */}
        {/* Height is rigidly controlled across all breakpoints to ensure zero layout shift */}
        <div className="relative w-full h-[300px] xs:h-[330px] sm:h-[380px] md:h-[420px] lg:h-[460px] overflow-hidden">
          {/* SLIDER TRACK */}
          <div
            className="flex w-full h-full"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
              transition: prefersReducedMotion
                ? 'none'
                : 'transform 500ms cubic-bezier(0.25, 1, 0.5, 1)',
            }}
          >
            {SLIDES.map((slide, idx) => {
              const BadgeIcon = slide.badgeIcon;
              const isPriority = idx === 0;

              return (
                <div
                  key={slide.id}
                  className="w-full h-full flex-shrink-0 relative overflow-hidden select-none"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Slide ${idx + 1} of ${SLIDES.length}: ${slide.headline}`}
                  aria-hidden={currentIndex !== idx}
                >
                  {/* AMBIENT SOFT BLURRED BACKGROUND (Unified across portrait & landscape) */}
                  <img
                    src={slide.image}
                    alt=""
                    aria-hidden="true"
                    loading={isPriority ? 'eager' : 'lazy'}
                    className="absolute inset-0 w-full h-full object-cover scale-110 filter blur-2xl opacity-40 brightness-75 -z-10"
                  />
                  {/* Subtle clinic color overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-navy/85 via-navy/60 to-teal-950/80 -z-10" />

                  {/* SLIDE FOREGROUND CONTENT */}
                  {slide.type === 'portrait' ? (
                    /* PORTRAIT SLIDES (Slide 1 & Slide 2) */
                    <div className="relative z-10 w-full h-full flex flex-col md:flex-row items-center justify-between px-4 sm:px-8 md:px-12 py-4 sm:py-6 gap-3 md:gap-8">
                      {/* Left: Text & CTA */}
                      <div className="flex-1 flex flex-col justify-center text-center md:text-left space-y-2 sm:space-y-3 md:space-y-4 max-w-xl">
                        {/* Pill badge */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs sm:text-sm font-semibold backdrop-blur-md border border-teal-400/30 w-fit mx-auto md:mx-0">
                          <BadgeIcon className="w-3.5 h-3.5 text-teal-300 shrink-0" />
                          <span>{slide.badge}</span>
                        </div>

                        {/* Slide Title */}
                        <h2 className="font-heading font-extrabold text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white tracking-tight leading-snug drop-shadow-sm">
                          {slide.headline}
                        </h2>

                        {/* Description (desktop & tablet, concise on mobile) */}
                        <p className="text-xs sm:text-sm md:text-base text-slate-200 line-clamp-2 md:line-clamp-3 leading-relaxed drop-shadow-sm max-w-md mx-auto md:mx-0">
                          {slide.subheadline}
                        </p>

                        {/* CTA Button */}
                        <div className="pt-1 sm:pt-2 flex items-center justify-center md:justify-start gap-3">
                          <Link
                            to={slide.ctaLink}
                            className="inline-flex items-center justify-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-xl font-heading font-bold text-white bg-teal-600 hover:bg-teal-500 active:scale-95 transition-all shadow-lg hover:shadow-teal-500/30 text-xs sm:text-sm md:text-base"
                          >
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-teal-200" />
                            <span>{slide.ctaText}</span>
                            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-200" />
                          </Link>
                          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-teal-200 font-medium">
                            <Clock className="w-3.5 h-3.5 text-emerald-400" /> Open 7 Days
                          </span>
                        </div>
                      </div>

                      {/* Right: Contained Portrait Image (100% aspect ratio preserved, zero distortion) */}
                      <div className="flex-shrink-0 flex items-center justify-center h-[130px] xs:h-[150px] sm:h-[220px] md:h-[300px] lg:h-[350px] w-auto">
                        <div className="relative h-full rounded-xl sm:rounded-2xl overflow-hidden border-2 border-white/25 shadow-2xl bg-black/20 p-1 backdrop-blur-sm">
                          <img
                            src={slide.image}
                            alt={slide.alt}
                            loading={isPriority ? 'eager' : 'lazy'}
                            className="h-full w-auto object-contain rounded-lg sm:rounded-xl drop-shadow-md"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* LANDSCAPE SLIDES (Slide 3 & Slide 4) */
                    <div className="relative z-10 w-full h-full flex items-center justify-center p-2 sm:p-4">
                      {/* Contained Landscape Graphic - Sharp & Uncropped */}
                      <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl border border-white/15 bg-black/10">
                        <img
                          src={slide.image}
                          alt={slide.alt}
                          loading={isPriority ? 'eager' : 'lazy'}
                          className="w-full h-full object-contain drop-shadow-xl"
                        />

                        {/* Top subtle badge overlay */}
                        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20">
                          <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-navy/80 text-teal-300 text-[10px] sm:text-xs font-semibold backdrop-blur-md border border-teal-500/30 shadow-md">
                            <BadgeIcon className="w-3 h-3 text-teal-300 shrink-0" />
                            <span>{slide.badge}</span>
                          </div>
                        </div>

                        {/* Bottom Floating Book Now CTA Bar */}
                        <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-20 flex items-center gap-2">
                          <Link
                            to={slide.ctaLink}
                            className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-heading font-bold text-white bg-teal-600 hover:bg-teal-500 active:scale-95 transition-all shadow-xl hover:shadow-teal-500/40 text-xs sm:text-sm md:text-base border border-teal-400/30"
                          >
                            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-200" />
                            <span>{slide.ctaText}</span>
                            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-200" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* PREVIOUS ARROW BUTTON (Flipkart-style frosted circular button) */}
          <button
            type="button"
            onClick={goToPrev}
            aria-label="Previous slide"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-navy flex items-center justify-center shadow-clinical hover:shadow-floating transition-all duration-200 hover:scale-105 active:scale-90 border border-slate-200/80 backdrop-blur-sm"
          >
            <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 text-slate-800" />
          </button>

          {/* NEXT ARROW BUTTON (Flipkart-style frosted circular button) */}
          <button
            type="button"
            onClick={goToNext}
            aria-label="Next slide"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-navy flex items-center justify-center shadow-clinical hover:shadow-floating transition-all duration-200 hover:scale-105 active:scale-90 border border-slate-200/80 backdrop-blur-sm"
          >
            <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 text-slate-800" />
          </button>

          {/* PAGINATION DOTS (Flipkart style with expanding active pill) */}
          <div
            className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-navy/60 backdrop-blur-md border border-white/10"
            role="tablist"
            aria-label="Carousel pagination"
          >
            {SLIDES.map((slide, index) => {
              const isActive = currentIndex === index;
              return (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Go to slide ${index + 1}: ${slide.headline}`}
                  onClick={() => goToSlide(index)}
                  className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 focus:outline-none ${
                    isActive
                      ? 'w-6 sm:w-8 bg-teal-400 shadow-sm shadow-teal-400/50'
                      : 'w-2 sm:w-2.5 bg-white/50 hover:bg-white/80'
                  }`}
                />
              );
            })}
          </div>

          {/* SLIDE INDEX COUNTER BADGE (Top-right corner, subtle) */}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-4 z-20 hidden xs:inline-flex items-center px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-md border border-white/10 text-[10px] sm:text-xs font-semibold text-slate-300 tracking-wider">
            {currentIndex + 1} / {SLIDES.length}
          </div>
        </div>
      </div>
    </section>
  );
}
