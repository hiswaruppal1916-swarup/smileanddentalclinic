import React, { useState } from 'react';
import { Image, Sparkles, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Gallery() {
  const [filter, setFilter] = useState('all');

  const galleryItems = [
    {
      title: 'Digital Smile Makeover',
      category: 'treatments',
      image: '/assets/treatments/smile-design.jpg',
      desc: 'Facial aesthetic proportion planning and tooth shade restoration.',
    },
    {
      title: 'Painless Rotary Root Canal System',
      category: 'treatments',
      image: '/assets/treatments/root-canal-treatment.jpg',
      desc: 'Modern apex locators & rotary instrumentation.',
    },
    {
      title: 'Precision Zirconia & EMAX Crowns',
      category: 'treatments',
      image: '/assets/treatments/crowns.jpg',
      desc: 'Metal-free ceramic crowns for durable chewing strength.',
    },
    {
      title: 'Dental Implant Restorations',
      category: 'treatments',
      image: '/assets/treatments/implant.jpg',
      desc: 'Permanent titanium fixtures with natural ceramic crowns.',
    },
    {
      title: 'Minimally Invasive Laser Dentistry',
      category: 'treatments',
      image: '/assets/treatments/laser-surgery.jpg',
      desc: 'High-comfort diode laser procedures with minimal bleeding.',
    },
    {
      title: 'Clear Aligners & Orthodontic Braces',
      category: 'treatments',
      image: '/assets/treatments/orthodontics.jpg',
      desc: 'Straightening malaligned teeth and balancing the dental arch.',
    },
    {
      title: 'Porcelain Veneers & Laminates',
      category: 'treatments',
      image: '/assets/treatments/veneers.jpg',
      desc: 'Ultra-thin shells for radiant smile transformation.',
    },
    {
      title: 'Composite UV Ray Filling',
      category: 'treatments',
      image: '/assets/treatments/composite.jpg',
      desc: 'Tooth-colored aesthetic restorative dentistry.',
    },
  ];

  const filteredItems =
    filter === 'all' ? galleryItems : galleryItems.filter((i) => i.category === filter);

  return (
    <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider">
          <Image className="w-3.5 h-3.5 text-teal-600" /> Visual Showcase
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-navy">
          Clinical Gallery & Procedures
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Explore our modern clinical protocols, educational infographic treatment guides, and aesthetic smile restorations.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredItems.map((item, idx) => (
          <div
            key={idx}
            className="group bg-white rounded-2xl border border-slate-200/80 shadow-clinical hover:shadow-clinical-hover transition-all duration-300 overflow-hidden flex flex-col justify-between"
          >
            <div className="aspect-square overflow-hidden bg-slate-100 relative">
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-4 space-y-1">
              <h3 className="font-heading font-bold text-sm text-navy group-hover:text-teal-700 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-8 bg-teal-50/60 rounded-3xl border border-teal-100 text-center space-y-4 max-w-xl mx-auto">
        <h3 className="font-heading font-bold text-lg text-teal-900">
          Ready to Consult with Dr. Ananyo Mandal?
        </h3>
        <p className="text-xs text-teal-800">
          Schedule your appointment now with your exact preferred time slot.
        </p>
        <Link
          to="/book"
          className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-clinical transition-all"
        >
          <Calendar className="w-4 h-4" /> Book Appointment
        </Link>
      </div>
    </div>
  );
}
