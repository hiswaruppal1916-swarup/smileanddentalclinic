import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  UploadCloud,
  Trash2,
  Image as ImageIcon,
  Building2,
  Smile,
  Users,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  RefreshCw,
  ShieldAlert,
  Eye,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const TABS = [
  {
    id: 'clinic',
    label: 'Clinic Photos',
    icon: Building2,
    hasCaption: true,
    captionLabel: 'Photo Title / Caption (Optional)',
    captionPlaceholder: 'e.g. Modern Dental Operatory 1, Laser Sterilization Unit...',
    helpText: 'This title will be displayed below the photo on the public Clinic Photos section.',
  },
  {
    id: 'patient',
    label: 'Patient Photos',
    icon: Smile,
    hasCaption: false, // Strict requirement: No title/caption input for patient photos
    helpText: 'Patient photos are published without any titles, names, or captions for complete privacy.',
  },
  {
    id: 'team_work',
    label: 'Clinic Team Work',
    icon: Users,
    hasCaption: true,
    captionLabel: 'Photo Title / Caption (Optional)',
    captionPlaceholder: 'e.g. Dr. Ananyo Mandal performing Laser Surgery with Team...',
    helpText: 'Optional: Enter a caption, or leave blank to display the photo without text.',
  },
];

export default function DoctorGallery() {
  const { isDoctor } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('clinic');
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [captionText, setCaptionText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  // Protect route
  useEffect(() => {
    if (!isDoctor) {
      navigate('/doctor/login');
    }
  }, [isDoctor, navigate]);

  // Load photos from Supabase
  const loadGalleryPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setPhotos(data);
    } catch (err) {
      console.error('Failed to load gallery photos:', err);
      setStatusMessage({
        type: 'error',
        text: 'Failed to fetch gallery photos: ' + err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGalleryPhotos();
  }, []);

  // Category matching helpers
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

  const currentCategoryPhotos = photos.filter((p) => {
    if (activeTab === 'clinic') return isClinic(p.category);
    if (activeTab === 'patient') return isPatient(p.category);
    if (activeTab === 'team_work') return isTeam(p.category);
    return false;
  });

  // Handle local file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate mime type
    const validTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/avif',
    ];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setStatusMessage({
        type: 'error',
        text: 'Invalid file type. Please select a valid JPG, PNG, WebP, GIF, or AVIF image.',
      });
      return;
    }

    // Validate file size (10 MB max)
    if (file.size > 10 * 1024 * 1024) {
      setStatusMessage({
        type: 'error',
        text: 'File size exceeds 10MB. Please select an optimized smaller image.',
      });
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setStatusMessage(null);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setCaptionText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Upload to Supabase Storage & Insert into gallery table
  const handleSavePhoto = async (e) => {
    e.preventDefault();
    if (isUploading) return;
    if (!selectedFile) {
      setStatusMessage({ type: 'error', text: 'Please select an image file to upload.' });
      return;
    }

    setIsUploading(true);
    setStatusMessage(null);

    let uploadedStoragePath = null;

    try {
      // 1. Sanitize filename and create storage path
      const fileExt = selectedFile.name.split('.').pop().toLowerCase();
      const cleanName = selectedFile.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9]/g, '_')
        .slice(0, 30);
      const filePath = `${activeTab}/${Date.now()}_${cleanName}.${fileExt}`;

      // 2. Upload file to Supabase Storage bucket 'gallery'
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error('Supabase Storage upload error: ' + uploadError.message);
      }

      uploadedStoragePath = filePath;

      // 3. Get Public URL
      const { data: urlData } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);

      const publicUrl = urlData?.publicUrl;
      if (!publicUrl) {
        throw new Error('Failed to retrieve public image URL from Supabase Storage.');
      }

      // 4. Determine caption (Strict rule: Patient photos NEVER have captions)
      const finalCaption =
        activeTab === 'patient' ? null : (captionText.trim() || null);

      // 5. Insert record into database
      const { data: insertedRecord, error: dbError } = await supabase
        .from('gallery')
        .insert({
          category: activeTab,
          image_url: publicUrl,
          storage_path: uploadedStoragePath,
          title: finalCaption,
          caption: finalCaption,
          sort_order: photos.length + 1,
        })
        .select()
        .single();

      if (dbError) {
        // Rollback uploaded file if DB insert fails
        await supabase.storage.from('gallery').remove([uploadedStoragePath]);
        throw new Error('Database record error: ' + dbError.message);
      }

      // Immediate UI update - affect ONLY this category count; preserve other categories
      setPhotos((prev) => [insertedRecord, ...prev.filter((p) => p.id !== insertedRecord.id)]);
      clearSelection();
      setStatusMessage({
        type: 'success',
        text: 'Photograph successfully uploaded and published to the gallery!',
      });
    } catch (err) {
      console.error('Gallery upload error:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'An error occurred during upload. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Delete Photo from Supabase Table and Storage
  const handleDeletePhoto = async (photo) => {
    if (deletingId) return;
    const confirmDelete = window.confirm(
      'Are you sure you want to permanently delete this photograph from the gallery?'
    );
    if (!confirmDelete) return;

    setDeletingId(photo.id);
    setStatusMessage(null);

    try {
      // 1. Delete from Supabase Database
      const { error: dbError } = await supabase
        .from('gallery')
        .delete()
        .eq('id', photo.id);

      if (dbError) {
        throw new Error('Failed to remove database record: ' + dbError.message);
      }

      // 2. Delete from Supabase Storage if storage_path is recorded and not a static asset
      if (
        photo.storage_path &&
        !photo.storage_path.startsWith('/assets/') &&
        !photo.storage_path.startsWith('http')
      ) {
        const { error: storageError } = await supabase.storage
          .from('gallery')
          .remove([photo.storage_path]);

        if (storageError) {
          console.warn('Storage removal note:', storageError.message);
        }
      }

      // 3. Update local state - only decrement affected category count; preserve all other categories
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      setStatusMessage({
        type: 'success',
        text: 'Photograph deleted successfully.',
      });
    } catch (err) {
      console.error('Delete photo error:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to delete photo.',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const currentTabConfig = TABS.find((t) => t.id === activeTab) || TABS[0];

  return (
    <div className="py-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/doctor/settings"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:text-teal-700 hover:border-teal-300 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Settings
          </Link>
          <Link
            to="/doctor/dashboard"
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Dashboard
          </Link>
          <span className="text-slate-300">•</span>
          <Link
            to="/doctor/team"
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Team
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/gallery"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold hover:bg-teal-100 transition-all"
            title="Open public gallery in new tab"
          >
            <Eye className="w-3.5 h-3.5" /> View Public Gallery <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Main Title Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-clinical">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold uppercase tracking-wider mb-2">
              <ImageIcon className="w-3.5 h-3.5 text-teal-600" /> Gallery Manager
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-navy">
              Dynamic Gallery Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Upload, preview, categorize, and delete clinic, patient, and team photographs in real-time.
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-100/80 p-1.5 rounded-2xl">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const count = photos.filter((p) => {
              if (tab.id === 'clinic') return isClinic(p.category);
              if (tab.id === 'patient') return isPatient(p.category);
              if (tab.id === 'team_work') return isTeam(p.category);
              return false;
            }).length;

            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  clearSelection();
                  setStatusMessage(null);
                }}
                className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  isActive
                    ? 'bg-white text-navy shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-navy hover:bg-white/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications / Alerts */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 animate-fadeIn ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="p-1 hover:bg-black/5 rounded-lg text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Category Specific Notice for Patient Photos */}
      {activeTab === 'patient' && (
        <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Patient Privacy & Consent Mandate</p>
            <p className="text-amber-800/90 leading-relaxed">
              Ensure verified patient consent is on file before uploading photographs. In compliance with
              clinical privacy protocols, patient photographs are strictly displayed <strong>without names, captions, or descriptions</strong> on both the public website and lightbox views.
            </p>
          </div>
        </div>
      )}

      {/* Upload Box for Current Category */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-clinical space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="font-heading font-bold text-lg text-navy">
              Upload New Photo — {currentTabConfig.label}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{currentTabConfig.helpText}</p>
          </div>
        </div>

        <form onSubmit={handleSavePhoto} className="space-y-5">
          {/* File Selector & Drag/Drop Area */}
          {!previewUrl ? (
            <label
              htmlFor="gallery-file-upload"
              className="border-2 border-dashed border-slate-200 hover:border-teal-500 bg-slate-50/60 hover:bg-teal-50/30 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all group"
            >
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-teal-600 shadow-sm border border-slate-200 transition-colors">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="mt-3 text-xs font-bold text-navy group-hover:text-teal-700">
                Click to browse or drop an image file
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Supports JPG, PNG, WebP, GIF, AVIF (Max 10MB)
              </p>
              <input
                id="gallery-file-upload"
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          ) : (
            /* Preview Container */
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-5">
              <div className="w-36 h-28 relative rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0 shadow-sm">
                <img
                  src={previewUrl}
                  alt="Upload preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-1 text-center sm:text-left">
                <p className="text-xs font-bold text-navy truncate max-w-sm">
                  {selectedFile?.name}
                </p>
                <p className="text-[11px] text-slate-500">
                  Size: {(selectedFile.size / 1024).toFixed(1)} KB • Type: {selectedFile.type}
                </p>
                <p className="text-[11px] text-teal-700 font-semibold">
                  Assigned Category: {currentTabConfig.label}
                </p>
              </div>
              <button
                type="button"
                onClick={clearSelection}
                disabled={isUploading}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold border border-slate-200 transition-all flex items-center gap-1 shrink-0"
              >
                <X className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
          )}

          {/* Optional Caption Field (Only for Clinic Photos and Team Work) */}
          {currentTabConfig.hasCaption && (
            <div className="space-y-1.5">
              <label className="font-bold text-navy block text-xs">
                {currentTabConfig.captionLabel}
              </label>
              <input
                type="text"
                value={captionText}
                onChange={(e) => setCaptionText(e.target.value)}
                placeholder={currentTabConfig.captionPlaceholder}
                disabled={isUploading}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-navy placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
              />
              <p className="text-[11px] text-slate-400">
                Leave blank if no caption is needed. It will not render an empty caption area.
              </p>
            </div>
          )}

          {/* Submit / Upload Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!selectedFile || isUploading}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
                !selectedFile || isUploading
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700 text-white active:scale-95'
              }`}
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Uploading to Supabase...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Save & Publish to {currentTabConfig.label}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Photos List for the Active Tab */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-clinical space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="font-heading font-bold text-lg text-navy">
              Published {currentTabConfig.label}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage existing photos in this category. Deleting a photo permanently removes it from the public website and storage.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 rounded-xl text-slate-600">
            {currentCategoryPhotos.length} {currentCategoryPhotos.length === 1 ? 'Photo' : 'Photos'}
          </span>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
            <p className="text-xs">Loading photos...</p>
          </div>
        ) : currentCategoryPhotos.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
              <ImageIcon className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-navy">No photos in {currentTabConfig.label}</p>
            <p className="text-[11px] text-slate-400">
              Use the upload box above to add your first photo to this section.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {currentCategoryPhotos.map((photo) => {
              const caption = photo.caption || photo.title;
              const isDeleting = deletingId === photo.id;

              return (
                <div
                  key={photo.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden group">
                    <img
                      src={photo.image_url}
                      alt={caption || 'Gallery photo'}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-navy/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <a
                        href={photo.image_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-white/90 text-navy hover:bg-white text-xs font-bold shadow-md"
                        title="View Full Resolution"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Patient Photos show a privacy badge */}
                      {activeTab === 'patient' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                          <Smile className="w-3 h-3 text-teal-600" /> Patient Photo (No Caption)
                        </span>
                      ) : caption ? (
                        <p className="text-xs font-semibold text-navy leading-snug line-clamp-2">
                          {caption}
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">No caption provided</p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        {photo.created_at
                          ? new Date(photo.created_at).toLocaleDateString()
                          : 'Recently added'}
                      </span>

                      <button
                        onClick={() => handleDeletePhoto(photo)}
                        disabled={isDeleting}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-50"
                        title="Delete photo"
                      >
                        {isDeleting ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
