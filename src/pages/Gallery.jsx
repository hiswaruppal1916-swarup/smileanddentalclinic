import React, { useState, useEffect } from 'react';
import {
  Image,
  Calendar,
  Building2,
  Smile,
  Users,
  ZoomIn,
  RefreshCw,
  LayoutGrid,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import GalleryLightbox from '../components/GalleryLightbox';

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all' | 'clinic' | 'patient' | 'team_work'

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPhotos, setLightboxPhotos] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxCategory, setLightboxCategory] = useState('');

  // Fetch photos from Supabase
  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPhotos(data);
      }
    } catch (err) {
      console.error('Failed to load gallery photos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();

    // Supabase Realtime Subscription
    const channel = supabase
      .channel('public_gallery_live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'gallery' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPhotos((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setPhotos((prev) =>
              prev.map((p) => (p.id === payload.new.id ? payload.new : p))
            );
          } else if (payload.eventType === 'DELETE') {
            setPhotos((prev) => prev.filter((p) => p.id === payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Category Filtering Helpers
  const isClinic = (cat) => {
    if (!cat) return false;
    const s = String(cat).toLowerCase().trim().replace(/[\s_-]+/g, '');
    return s === 'clinic' || s === 'clinicphotos';
  };

  const isPatient = (cat) => {
    if (!cat) return false;
    const s = String(cat).toLowerCase().trim().replace(/[\s_-]+/g, '');
    return s === 'patient' || s === 'patientphotos';
  };

  const isTeam = (cat) => {
    if (!cat) return false;
    const s = String(cat).toLowerCase().trim().replace(/[\s_-]+/g, '');
    return s === 'teamwork' || s === 'clinicteamwork' || s === 'team';
  };

  const clinicPhotos = photos.filter((p) => isClinic(p.category));
  const patientPhotos = photos.filter((p) => isPatient(p.category));
  const teamPhotos = photos.filter((p) => isTeam(p.category));

  const openLightbox = (sectionPhotos, index, category) => {
    setLightboxPhotos(sectionPhotos);
    setLightboxIndex(index);
    setLightboxCategory(category);
    setLightboxOpen(true);
  };

  const filterButtons = [
    {
      id: 'all',
      label: 'All Photos',
      icon: LayoutGrid,
      count: photos.length,
    },
    {
      id: 'clinic',
      label: 'Clinic Photos',
      icon: Building2,
      count: clinicPhotos.length,
    },
    {
      id: 'patient',
      label: 'Patient Photos',
      icon: Smile,
      count: patientPhotos.length,
    },
    {
      id: 'team_work',
      label: 'Clinic Team Work',
      icon: Users,
      count: teamPhotos.length,
    },
  ];

  const showClinic = selectedFilter === 'all' || selectedFilter === 'clinic';
  const showPatient = selectedFilter === 'all' || selectedFilter === 'patient';
  const showTeam = selectedFilter === 'all' || selectedFilter === 'team_work';

  return (
    <div className="py-10 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider">
          <Image className="w-3.5 h-3.5 text-teal-600" /> Visual Showcase
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-navy">
          Clinical Gallery & Smile Journeys
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Explore our sterile dental operatories, authentic patient smile transformations, and our
          dedicated clinical team serving Sonarpur with advanced dental care.
        </p>
      </div>

      {/* Category Filter Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-3xl mx-auto">
        {filterButtons.map((btn) => {
          const Icon = btn.icon;
          const isActive = selectedFilter === btn.id;

          return (
            <button
              key={btn.id}
              onClick={() => setSelectedFilter(btn.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 border shadow-xs active:scale-95 touch-manipulation ${
                isActive
                  ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/25 ring-2 ring-teal-500/30'
                  : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-navy border-slate-200/90'
              }`}
              aria-pressed={isActive}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-teal-600'}`} />
              <span>{btn.label}</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-semibold transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {btn.count}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading clinical gallery...</p>
        </div>
      ) : (
        <div className="space-y-16 sm:space-y-24">
          {/* =========================================================================
              SECTION 1: CLINIC PHOTOS
              ========================================================================= */}
          {showClinic && (
            <section id="clinic-photos" className="space-y-6 scroll-mt-24 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200/80 pb-4">
                <div>
                  <div className="inline-flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
                    <Building2 className="w-4 h-4" /> Section 1
                  </div>
                  <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-navy">
                    Clinic Photos
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Our modern dental operatories, sterilization units, and patient lounges.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-400 self-start sm:self-end">
                  {clinicPhotos.length} {clinicPhotos.length === 1 ? 'Photograph' : 'Photographs'}
                </span>
              </div>

              {clinicPhotos.length === 0 ? (
                <div className="p-10 sm:p-14 bg-white rounded-3xl border border-slate-200/80 text-center space-y-3 shadow-sm">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading font-bold text-base text-navy">
                    No Clinic Photographs Published Yet
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Photographs of our clinic facilities and operatories will be showcased here shortly.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {clinicPhotos.map((photo, idx) => {
                    const caption = photo.caption || photo.title;
                    return (
                      <div
                        key={photo.id || idx}
                        onClick={() => openLightbox(clinicPhotos, idx, 'clinic')}
                        className="group bg-white rounded-2xl border border-slate-200/80 shadow-clinical hover:shadow-clinical-hover transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer"
                        title={caption || 'Click to view full image'}
                      >
                        <div className="aspect-[4/3] overflow-hidden bg-slate-100 relative">
                          <img
                            src={photo.image_url}
                            alt={caption || 'Clinic Photograph'}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-navy/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="p-2.5 rounded-full bg-white/90 text-navy shadow-md">
                              <ZoomIn className="w-4 h-4" />
                            </span>
                          </div>
                        </div>

                        {/* Display caption below image only if provided */}
                        {caption && (
                          <div className="p-3.5 bg-white border-t border-slate-100">
                            <p className="text-xs font-semibold text-navy leading-snug line-clamp-2">
                              {caption}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* =========================================================================
              SECTION 2: PATIENT PHOTOS
              ========================================================================= */}
          {showPatient && (
            <section id="patient-photos" className="space-y-6 scroll-mt-24 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200/80 pb-4">
                <div>
                  <div className="inline-flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
                    <Smile className="w-4 h-4" /> Section 2
                  </div>
                  <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-navy">
                    Patient Photos
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Smile transformations and clinical restorations. Displayed with verified patient consent.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-400 self-start sm:self-end">
                  {patientPhotos.length} {patientPhotos.length === 1 ? 'Photograph' : 'Photographs'}
                </span>
              </div>

              {patientPhotos.length === 0 ? (
                <div className="p-10 sm:p-14 bg-white rounded-3xl border border-slate-200/80 text-center space-y-3 shadow-sm">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                    <Smile className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading font-bold text-base text-navy">
                    No Patient Photographs Published Yet
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Patient smile journeys will be updated here as clinical cases are documented.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {patientPhotos.map((photo, idx) => (
                    <div
                      key={photo.id || idx}
                      onClick={() => openLightbox(patientPhotos, idx, 'patient')}
                      className="group bg-white rounded-2xl border border-slate-200/80 shadow-clinical hover:shadow-clinical-hover transition-all duration-300 overflow-hidden cursor-pointer"
                      title="Click to view full image"
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-slate-100 relative">
                        <img
                          src={photo.image_url}
                          alt="Smile & Dental Clinic Patient Photograph"
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-navy/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="p-2.5 rounded-full bg-white/90 text-navy shadow-md">
                            <ZoomIn className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                      {/* STRICT PRIVACY RULE: No captions, names, or descriptions below patient photos */}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* =========================================================================
              SECTION 3: CLINIC TEAM WORK
              ========================================================================= */}
          {showTeam && (
            <section id="clinic-team-work" className="space-y-6 scroll-mt-24 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200/80 pb-4">
                <div>
                  <div className="inline-flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
                    <Users className="w-4 h-4" /> Section 3
                  </div>
                  <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-navy">
                    Clinic Team Work
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Dr. Ananyo Mandal and our clinical staff collaborating during treatment procedures.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-400 self-start sm:self-end">
                  {teamPhotos.length} {teamPhotos.length === 1 ? 'Photograph' : 'Photographs'}
                </span>
              </div>

              {teamPhotos.length === 0 ? (
                <div className="p-10 sm:p-14 bg-white rounded-3xl border border-slate-200/80 text-center space-y-3 shadow-sm">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading font-bold text-base text-navy">
                    No Team Work Photographs Published Yet
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Photographs of our doctor and staff at work will be published here shortly.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {teamPhotos.map((photo, idx) => {
                    const caption = photo.caption || photo.title;
                    return (
                      <div
                        key={photo.id || idx}
                        onClick={() => openLightbox(teamPhotos, idx, 'team_work')}
                        className="group bg-white rounded-2xl border border-slate-200/80 shadow-clinical hover:shadow-clinical-hover transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer"
                        title={caption || 'Click to view full image'}
                      >
                        <div className="aspect-[4/3] overflow-hidden bg-slate-100 relative">
                          <img
                            src={photo.image_url}
                            alt={caption || 'Clinic Team Photograph'}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-navy/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="p-2.5 rounded-full bg-white/90 text-navy shadow-md">
                              <ZoomIn className="w-4 h-4" />
                            </span>
                          </div>
                        </div>

                        {/* Display caption below image only if provided */}
                        {caption && (
                          <div className="p-3.5 bg-white border-t border-slate-100">
                            <p className="text-xs font-semibold text-navy leading-snug line-clamp-2">
                              {caption}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      <GalleryLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        photos={lightboxPhotos}
        currentIndex={lightboxIndex}
        onNavigate={(newIdx) => setLightboxIndex(newIdx)}
        category={lightboxCategory}
      />

      {/* Appointment CTA */}
      <div className="p-8 sm:p-10 bg-gradient-to-br from-teal-50/80 to-white rounded-3xl border border-teal-100 text-center space-y-4 max-w-xl mx-auto shadow-sm">
        <h3 className="font-heading font-extrabold text-lg sm:text-xl text-teal-950">
          Ready to Consult with Dr. Ananyo Mandal?
        </h3>
        <p className="text-xs sm:text-sm text-teal-800/90 leading-relaxed">
          Schedule your personal dental consultation with your preferred time slot at Smile & Dental Clinic.
        </p>
        <div>
          <Link
            to="/book"
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-clinical transition-all active:scale-95"
          >
            <Calendar className="w-4 h-4" /> Book Appointment
          </Link>
        </div>
      </div>
    </div>
  );
}
