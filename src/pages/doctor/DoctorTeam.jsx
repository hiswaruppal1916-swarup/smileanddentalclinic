import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Plus,
  Edit2,
  Trash2,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  RefreshCw,
  Eye,
  ShieldCheck,
  UserCheck,
  Image as ImageIcon,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function DoctorTeam() {
  const { session, isDoctor } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null); // null when adding
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Status & Operation States
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  // Protect route
  useEffect(() => {
    if (!session && !isDoctor) {
      navigate('/doctor/login');
    }
  }, [session, isDoctor, navigate]);

  // Load Team Members from Supabase
  const loadTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) {
        setMembers(data);
      }
    } catch (err) {
      console.error('Failed to load team members:', err);
      setStatusMessage({
        type: 'error',
        text: 'Failed to fetch team members: ' + err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeamMembers();
  }, []);

  // Handle local file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValidationError('');

    // Validate MIME type
    const validTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/avif',
    ];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setValidationError('Invalid file format. Please upload JPG, PNG, WebP, GIF, or AVIF.');
      return;
    }

    // Validate file size (10 MB max)
    if (file.size > 10 * 1024 * 1024) {
      setValidationError('File size exceeds 10MB limit. Please upload an optimized smaller image.');
      return;
    }

    setSelectedFile(file);
    if (previewUrl && !editingMember?.photo_url?.startsWith(previewUrl)) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Reset form
  const resetForm = () => {
    setFullName('');
    setRole('');
    setSelectedFile(null);
    if (previewUrl && (!editingMember || previewUrl !== editingMember.photo_url)) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setEditingMember(null);
    setIsFormOpen(false);
    setValidationError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Initiate Edit
  const handleStartEdit = (member) => {
    setEditingMember(member);
    setFullName(member.name || '');
    setRole(member.role || '');
    setSelectedFile(null);
    setPreviewUrl(member.photo_url || null);
    setIsFormOpen(true);
    setValidationError('');
    setStatusMessage(null);
    // Smooth scroll to form
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  // Save (Add or Update) Team Member
  const handleSaveMember = async (e) => {
    e.preventDefault();
    setValidationError('');
    setStatusMessage(null);

    const trimmedName = fullName.trim();
    const trimmedRole = role.trim();

    // 1. Validation
    if (!trimmedName) {
      setValidationError('Full Name is required.');
      return;
    }

    if (!trimmedRole) {
      setValidationError('Job Title / Role is required.');
      return;
    }

    if (!editingMember && !selectedFile) {
      setValidationError('Profile Photo is required for a new team member.');
      return;
    }

    setIsSaving(true);
    let uploadedStoragePath = null;
    let finalPhotoUrl = editingMember ? editingMember.photo_url : null;

    try {
      // 2. Upload photo to Supabase Storage if a new file was chosen
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop().toLowerCase();
        const cleanName = trimmedName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_')
          .slice(0, 25);
        const filePath = `team/${Date.now()}_${cleanName}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(filePath, selectedFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw new Error('Photo storage upload error: ' + uploadError.message);
        }

        uploadedStoragePath = filePath;

        const { data: urlData } = supabase.storage
          .from('gallery')
          .getPublicUrl(filePath);

        if (!urlData?.publicUrl) {
          throw new Error('Failed to retrieve public image URL from Supabase Storage.');
        }

        finalPhotoUrl = urlData.publicUrl;
      }

      // 3. Database Operation
      if (editingMember) {
        // UPDATE existing member
        const updates = {
          name: trimmedName,
          role: trimmedRole,
          photo_url: finalPhotoUrl,
        };

        if (uploadedStoragePath) {
          updates.storage_path = uploadedStoragePath;
        }

        const { data: updatedRecord, error: dbError } = await supabase
          .from('team_members')
          .update(updates)
          .eq('id', editingMember.id)
          .select()
          .single();

        if (dbError) {
          if (uploadedStoragePath) {
            await supabase.storage.from('gallery').remove([uploadedStoragePath]);
          }
          throw new Error('Database update error: ' + dbError.message);
        }

        // Clean up old storage image if safely replaced (and not an existing static asset)
        if (
          uploadedStoragePath &&
          editingMember.storage_path &&
          !editingMember.storage_path.startsWith('/assets/') &&
          editingMember.storage_path !== uploadedStoragePath
        ) {
          await supabase.storage.from('gallery').remove([editingMember.storage_path]);
        }

        // Update local state
        setMembers((prev) =>
          prev.map((m) => (m.id === editingMember.id ? updatedRecord : m))
        );

        setStatusMessage({
          type: 'success',
          text: `Team member "${trimmedName}" updated successfully.`,
        });
      } else {
        // INSERT new member
        const { data: insertedRecord, error: dbError } = await supabase
          .from('team_members')
          .insert({
            name: trimmedName,
            role: trimmedRole,
            photo_url: finalPhotoUrl,
            storage_path: uploadedStoragePath,
            sort_order: members.length + 1,
            is_active: true,
            is_head: false,
          })
          .select()
          .single();

        if (dbError) {
          if (uploadedStoragePath) {
            await supabase.storage.from('gallery').remove([uploadedStoragePath]);
          }
          throw new Error('Database insert error: ' + dbError.message);
        }

        // Update local state
        setMembers((prev) => [...prev, insertedRecord]);

        setStatusMessage({
          type: 'success',
          text: `New team member "${trimmedName}" added successfully and published to Team page.`,
        });
      }

      resetForm();
    } catch (err) {
      console.error('Save team member error:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'An unexpected error occurred while saving the team member.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Member safely
  const handleDeleteMember = async (member) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete team member "${member.name}" (${member.role})?`
    );
    if (!confirmDelete) return;

    setDeletingId(member.id);
    setStatusMessage(null);

    try {
      // 1. Delete record from Supabase table
      const { error: dbError } = await supabase
        .from('team_members')
        .delete()
        .eq('id', member.id);

      if (dbError) {
        throw new Error('Failed to delete member record: ' + dbError.message);
      }

      // 2. Remove storage image ONLY if it is an uploaded file in Supabase Storage and not a shared static asset
      if (
        member.storage_path &&
        !member.storage_path.startsWith('/assets/') &&
        !member.storage_path.startsWith('http')
      ) {
        const { error: storageError } = await supabase.storage
          .from('gallery')
          .remove([member.storage_path]);

        if (storageError) {
          console.warn('Storage removal note:', storageError.message);
        }
      }

      // 3. Update local state
      setMembers((prev) => prev.filter((m) => m.id !== member.id));

      if (editingMember?.id === member.id) {
        resetForm();
      }

      setStatusMessage({
        type: 'success',
        text: `Team member "${member.name}" was successfully removed.`,
      });
    } catch (err) {
      console.error('Delete member error:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to delete team member.',
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="py-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/doctor/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:text-teal-700 hover:border-teal-300 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <Link
            to="/doctor/settings"
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Settings
          </Link>
          <span className="text-slate-300">•</span>
          <Link
            to="/doctor/gallery"
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Gallery
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/team"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold hover:bg-teal-100 transition-all shadow-sm"
            title="Open public team page in new tab"
          >
            <Eye className="w-3.5 h-3.5" /> View Public Team Page <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Main Title Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-clinical">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold uppercase tracking-wider mb-2">
              <Users className="w-3.5 h-3.5 text-teal-600" /> Team Management
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-navy">
              Clinic Team & Staff Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Add, update, or remove clinic healthcare staff and coordinators shown on the public Team page.
            </p>
          </div>

          {!isFormOpen && (
            <button
              onClick={() => {
                resetForm();
                setIsFormOpen(true);
              }}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" /> Add New Team Member
            </button>
          )}
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

      {/* Add / Edit Member Form Modal / Accordion */}
      {isFormOpen && (
        <div className="bg-white rounded-3xl border border-teal-200/80 p-6 sm:p-8 shadow-clinical space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="font-heading font-bold text-lg text-navy">
                {editingMember ? `Edit Team Member — ${editingMember.name}` : 'Add New Team Member'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {editingMember
                  ? 'Update the member’s name, role, or profile photograph.'
                  : 'Enter the team member’s full name, role, and upload their official profile photo.'}
              </p>
            </div>
            <button
              onClick={resetForm}
              className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
              title="Close form"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {validationError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <form onSubmit={handleSaveMember} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Field 1: Full Name */}
              <div className="space-y-1.5">
                <label className="font-bold text-navy block text-xs">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Mayra Yasmin"
                  disabled={isSaving}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-navy placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium"
                />
              </div>

              {/* Field 2: Job Title / Role */}
              <div className="space-y-1.5">
                <label className="font-bold text-navy block text-xs">
                  Job Title / Clinic Role <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Head Incharge of Clinic, Dental Assistant, Cashier..."
                  disabled={isSaving}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-navy placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            {/* Field 3: Profile Photo */}
            <div className="space-y-2">
              <label className="font-bold text-navy block text-xs">
                Profile Photo {editingMember ? '(Leave unchanged to keep current photo)' : <span className="text-rose-500">*</span>}
              </label>

              {!previewUrl ? (
                <label
                  htmlFor="team-photo-upload"
                  className="border-2 border-dashed border-slate-200 hover:border-teal-500 bg-slate-50/60 hover:bg-teal-50/30 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all group"
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-teal-600 shadow-sm border border-slate-200 transition-colors">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="mt-2 text-xs font-bold text-navy group-hover:text-teal-700">
                    Click to browse or drop profile photograph
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Supports JPG, PNG, WebP, GIF, AVIF (Max 10MB)
                  </p>
                  <input
                    id="team-photo-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-24 h-28 relative rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0 shadow-sm">
                    <img
                      src={previewUrl}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1 text-center sm:text-left">
                    <p className="text-xs font-bold text-navy truncate max-w-sm">
                      {selectedFile ? selectedFile.name : editingMember?.name + ' (Current Photo)'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {selectedFile
                        ? `Size: ${(selectedFile.size / 1024).toFixed(1)} KB • Type: ${selectedFile.type}`
                        : 'Active public image photo URL'}
                    </p>
                    <label
                      htmlFor="team-photo-replace"
                      className="inline-block mt-1 text-[11px] font-bold text-teal-700 hover:text-teal-800 cursor-pointer underline underline-offset-2"
                    >
                      Change / Replace Photo
                      <input
                        id="team-photo-replace"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(editingMember?.photo_url || null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold border border-slate-200 transition-all flex items-center gap-1 shrink-0"
                    >
                      <X className="w-3.5 h-3.5" /> Revert
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={resetForm}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
                  isSaving
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-teal-600 hover:bg-teal-700 text-white active:scale-95'
                }`}
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving to Clinic Database...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editingMember ? 'Save Changes' : 'Add Team Member'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Team Members List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-clinical space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="font-heading font-bold text-lg text-navy">
              Current Team Members ({members.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              These members are published live on the public website Team page.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 rounded-xl text-slate-600">
            {members.length} {members.length === 1 ? 'Member' : 'Members'}
          </span>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
            <p className="text-xs">Loading team members...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-navy">No team members found</p>
            <p className="text-[11px] text-slate-400">
              Click &quot;Add New Team Member&quot; to publish your first team member.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {members.map((member) => {
              const isDeleting = deletingId === member.id;
              const isCurrentlyEditing = editingMember?.id === member.id;

              return (
                <div
                  key={member.id}
                  className={`bg-white rounded-2xl border p-4 shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
                    isCurrentlyEditing
                      ? 'border-teal-500 ring-2 ring-teal-200'
                      : 'border-slate-200/90'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Member Photo Thumbnail */}
                    <div className="w-16 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      <img
                        src={member.photo_url || '/assets/logo.jpg'}
                        alt={member.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Member Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-heading font-bold text-sm text-navy truncate">
                          {member.name}
                        </h3>
                        {member.is_head && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-teal-100 text-teal-800 text-[10px] font-bold rounded-md">
                            <ShieldCheck className="w-3 h-3 text-teal-600" /> Head
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-teal-700 line-clamp-1">
                        {member.role}
                      </p>
                      {member.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {member.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-slate-400" /> Clinic Staff
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Edit Action */}
                      <button
                        onClick={() => handleStartEdit(member)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 text-xs font-bold transition-all flex items-center gap-1"
                        title="Edit member details"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-teal-600" />
                        <span>Edit</span>
                      </button>

                      {/* Delete Action */}
                      <button
                        onClick={() => handleDeleteMember(member)}
                        disabled={isDeleting}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-50"
                        title="Delete member"
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
