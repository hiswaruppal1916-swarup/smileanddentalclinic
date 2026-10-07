import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, ShieldCheck, HeartHandshake, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Team() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeam() {
      const { data } = await supabase
        .from('team_members')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (data) setTeamMembers(data);
      setLoading(false);
    }
    loadTeam();
  }, []);

  return (
    <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider">
          <Users className="w-3.5 h-3.5 text-teal-600" /> Clinical Team
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-navy">
          Our Dental Healthcare Team
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Led by Dr. Ananyo Mandal, our dedicated clinical support team and dental hygienists maintain strict sterilisation standards and compassionate patient assistance.
        </p>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-clinical hover:shadow-clinical-hover transition-all duration-300 space-y-5 text-center flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="relative w-36 h-36 mx-auto rounded-full overflow-hidden border-4 border-teal-50 shadow-md">
                <img
                  src={member.photo_url || '/assets/dr-ananyo-mandal.jpg'}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-xl text-navy">{member.name}</h3>
                <p className="text-xs font-bold text-teal-700">{member.qualification}</p>
                <p className="text-xs text-slate-500 font-medium">{member.role}</p>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed px-2">
                {member.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                to="/book"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl font-bold text-xs transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-teal-600" /> Book Consultation
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Clinical Protocol Statement */}
      <div className="max-w-3xl mx-auto bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200/80 text-center space-y-3">
        <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center mx-auto">
          <HeartHandshake className="w-6 h-6" />
        </div>
        <h3 className="font-heading font-bold text-lg text-navy">
          Dedicated to Hospital-Grade Sterilization
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl mx-auto">
          Our nursing and operatory personnel enforce Class-B autoclave sterilization protocols for every handpiece, instrument, and chair surface between patient visits.
        </p>
      </div>
    </div>
  );
}
