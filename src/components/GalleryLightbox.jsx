import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function GalleryLightbox({
  isOpen,
  onClose,
  photos = [],
  currentIndex = 0,
  onNavigate,
  category = '',
}) {
  const currentPhoto = photos[currentIndex];

  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && photos.length > 1) {
        onNavigate((currentIndex - 1 + photos.length) % photos.length);
      } else if (e.key === 'ArrowRight' && photos.length > 1) {
        onNavigate((currentIndex + 1) % photos.length);
      }
    },
    [isOpen, onClose, onNavigate, currentIndex, photos.length]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !currentPhoto) return null;

  const isPatientCategory =
    category === 'patient' ||
    String(currentPhoto.category || '').toLowerCase().includes('patient');

  const captionText = !isPatientCategory
    ? currentPhoto.caption || currentPhoto.title || ''
    : '';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/95 backdrop-blur-md p-3 sm:p-6 animate-fadeIn"
      onClick={onClose}
    >
      {/* Top Bar with Counter and Close Button */}
      <div
        className="absolute top-4 inset-x-4 sm:inset-x-8 flex items-center justify-between text-white z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-slate-200">
          {currentIndex + 1} / {photos.length}
        </span>

        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-teal-400"
          aria-label="Close full view"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Previous Button */}
      {photos.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate((currentIndex - 1 + photos.length) % photos.length);
          }}
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 z-10 focus:outline-none focus:ring-2 focus:ring-teal-400"
          aria-label="Previous photo"
          title="Previous (Left Arrow)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Main Image Container */}
      <div
        className="relative max-w-5xl max-h-[85vh] flex flex-col items-center justify-center p-2"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentPhoto.image_url}
          alt={captionText || 'Smile & Dental Clinic Gallery Photograph'}
          className="max-h-[75vh] sm:max-h-[80vh] max-w-[92vw] sm:max-w-[85vw] object-contain rounded-2xl shadow-2xl border border-white/10"
        />

        {/* Caption only for non-patient photos and when a caption is actually present */}
        {captionText && !isPatientCategory && (
          <div className="mt-3.5 max-w-2xl px-5 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
            <p className="text-xs sm:text-sm font-medium text-slate-100 leading-relaxed">
              {captionText}
            </p>
          </div>
        )}
      </div>

      {/* Next Button */}
      {photos.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate((currentIndex + 1) % photos.length);
          }}
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 z-10 focus:outline-none focus:ring-2 focus:ring-teal-400"
          aria-label="Next photo"
          title="Next (Right Arrow)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
