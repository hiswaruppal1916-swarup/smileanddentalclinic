import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Smartphone,
  Laptop,
  CheckCircle2,
  Save,
  X,
  Sparkles,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function DoctorSettings() {
  const { isDoctor } = useAuth();
  const navigate = useNavigate();

  const [treatments, setTreatments] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTreatment, setEditingTreatment] = useState(null);
  const [isNewTreatment, setIsNewTreatment] = useState(false);

  useEffect(() => {
    if (!isDoctor) {
      navigate('/doctor/login');
    }
  }, [isDoctor, navigate]);

  const loadData = async () => {
    try {
      const { data: treatData } = await supabase
        .from('treatments')
        .select('*')
        .order('sort_order', { ascending: true });

      const { data: devData } = await supabase
        .from('notification_devices')
        .select('*')
        .eq('role', 'doctor')
        .order('last_seen_at', { ascending: false });

      if (treatData) setTreatments(treatData);
      if (devData) setDevices(devData);
    } catch (e) {
      console.error('Settings load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleTreatment = async (id, currentStatus) => {
    await supabase.from('treatments').update({ is_active: !currentStatus }).eq('id', id);
    setTreatments((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_active: !currentStatus } : t))
    );
  };

  const handleSaveTreatment = async (e) => {
    e.preventDefault();
    if (!editingTreatment.name_en || !editingTreatment.name_bn) return;

    try {
      if (isNewTreatment) {
        const slug = editingTreatment.name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const { data, error } = await supabase
          .from('treatments')
          .insert({
            ...editingTreatment,
            slug,
            image_url: editingTreatment.image_url || '/assets/treatments/root-canal-treatment.jpg',
            sort_order: treatments.length + 1,
            is_active: true,
          })
          .select()
          .single();

        if (error) throw error;
        setTreatments((prev) => [...prev, data]);
      } else {
        const { error } = await supabase
          .from('treatments')
          .update({
            name_en: editingTreatment.name_en,
            name_bn: editingTreatment.name_bn,
            short_desc: editingTreatment.short_desc,
            full_desc: editingTreatment.full_desc,
            image_url: editingTreatment.image_url,
          })
          .eq('id', editingTreatment.id);

        if (error) throw error;
        setTreatments((prev) =>
          prev.map((t) => (t.id === editingTreatment.id ? editingTreatment : t))
        );
      }
      setEditingTreatment(null);
      setIsNewTreatment(false);
    } catch (err) {
      alert('Save failed: ' + err.message);
    }
  };

  return (
    <div className="py-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/doctor/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-teal-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="font-heading font-extrabold text-2xl text-navy">
          Doctor Settings & Catalog
        </h1>
      </div>

      {/* 1. TREATMENTS MANAGEMENT */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-clinical space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="font-heading font-bold text-lg text-navy">Manage Clinic Treatments</h2>
            <p className="text-xs text-slate-500">
              Edit English/Bengali names, descriptions, or add new dental procedures.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingTreatment({
                name_en: '',
                name_bn: '',
                short_desc: '',
                full_desc: '',
                image_url: '/assets/treatments/root-canal-treatment.jpg',
              });
              setIsNewTreatment(true);
            }}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add New Treatment
          </button>
        </div>

        {/* Treatments List */}
        <div className="divide-y divide-slate-100">
          {treatments.map((t) => (
            <div key={t.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={t.image_url}
                  alt={t.name_en}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <h4 className="font-heading font-bold text-sm text-navy">{t.name_en}</h4>
                  <p className="text-xs font-semibold text-teal-700">{t.name_bn}</p>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{t.short_desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => handleToggleTreatment(t.id, t.is_active)}
                  className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    t.is_active
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}
                  title={t.is_active ? 'Visible on website' : 'Hidden from website'}
                >
                  {t.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => {
                    setEditingTreatment(t);
                    setIsNewTreatment(false);
                  }}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs"
                  title="Edit Treatment"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. REGISTERED DOCTOR DEVICES (MULTI-DEVICE MONITOR) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-clinical space-y-4">
        <div>
          <h2 className="font-heading font-bold text-lg text-navy flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-teal-600" /> Active Doctor Notification Devices
          </h2>
          <p className="text-xs text-slate-500">
            Every registered active device receives real-time FCM push notifications when patients book appointments.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          {devices.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">No other devices registered yet.</p>
          ) : (
            devices.map((dev) => (
              <div
                key={dev.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-navy flex items-center gap-1.5">
                    {dev.platform === 'mobile_pwa' ? (
                      <Smartphone className="w-4 h-4 text-teal-600" />
                    ) : (
                      <Laptop className="w-4 h-4 text-teal-600" />
                    )}
                    {dev.device_name || 'Browser'}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      dev.is_active ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  ></span>
                </div>
                <p className="font-mono text-[10px] text-slate-400 truncate">
                  Token: {dev.fcm_token.slice(0, 18)}...
                </p>
                <p className="text-[11px] text-slate-500">
                  Last Active: {new Date(dev.last_seen_at || dev.updated_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* EDIT / CREATE TREATMENT MODAL */}
      {editingTreatment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-heading font-extrabold text-lg text-navy">
                {isNewTreatment ? 'Add New Treatment' : 'Edit Treatment'}
              </h3>
              <button onClick={() => setEditingTreatment(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTreatment} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-navy block mb-1">English Name</label>
                <input
                  type="text"
                  required
                  value={editingTreatment.name_en}
                  onChange={(e) => setEditingTreatment({ ...editingTreatment, name_en: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-navy block mb-1">Bengali Name</label>
                <input
                  type="text"
                  required
                  value={editingTreatment.name_bn}
                  onChange={(e) => setEditingTreatment({ ...editingTreatment, name_bn: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-navy block mb-1">Short Description</label>
                <textarea
                  rows="2"
                  required
                  value={editingTreatment.short_desc}
                  onChange={(e) =>
                    setEditingTreatment({ ...editingTreatment, short_desc: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-navy block mb-1">Image URL</label>
                <input
                  type="text"
                  value={editingTreatment.image_url}
                  onChange={(e) =>
                    setEditingTreatment({ ...editingTreatment, image_url: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingTreatment(null)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-sm transition-all"
                >
                  Save Treatment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
