import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Sparkles, Search, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Treatments() {
  const [treatments, setTreatments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTreatments() {
      const { data, error } = await supabase
        .from('treatments')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (!error && data) setTreatments(data);
      setLoading(false);
    }
    fetchTreatments();
  }, []);

  const filtered = treatments.filter(
    (t) =>
      t.name_en.toLowerCase().includes(search.toLowerCase()) ||
      t.name_bn.includes(search) ||
      t.short_desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Complete Clinical Catalog
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-navy">
          Dental & Aesthetic Procedures
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Comprehensive dental solutions supervised by Dr. Ananyo Mandal, MDS. Explore our specialized procedures with bilingual details and schedule with your exact preferred time.
        </p>

        {/* Search Bar */}
        <div className="max-w-md mx-auto pt-4 relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search treatments (e.g. Root Canal, ক্যাপ, Laser)..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
          />
        </div>
      </div>

      {/* Grid of all 12 treatments */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading dental treatments...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="group bg-white rounded-2xl border border-slate-200/80 shadow-clinical hover:shadow-clinical-hover transition-all duration-300 overflow-hidden flex flex-col"
            >
              <div className="relative aspect-square overflow-hidden bg-slate-100">
                <img
                  src={t.image_url || `/assets/treatments/${t.slug}.jpg`}
                  alt={t.name_en}
                  onError={(e) => {
                    e.currentTarget.src = `/assets/treatments/${t.slug}.jpg`;
                  }}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-navy/85 backdrop-blur-md text-white text-[11px] font-bold">
                  {t.name_bn}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h2 className="font-heading font-bold text-xl text-navy group-hover:text-teal-700 transition-colors">
                    {t.name_en}
                  </h2>
                  <p className="text-xs font-semibold text-teal-700 mt-0.5">{t.name_bn}</p>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                    {t.short_desc}
                  </p>
                </div>

                {t.features && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    {t.features.slice(0, 3).map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    to={`/treatments/${t.slug}`}
                    className="text-xs font-bold text-slate-600 hover:text-teal-700 transition-colors flex items-center gap-1"
                  >
                    Learn More <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to={`/book?treatment=${encodeURIComponent(t.name_en)}`}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" /> Book
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
