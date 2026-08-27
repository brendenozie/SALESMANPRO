'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';

const services = [
  {
    title: 'Styling Consultation',
    subtitle: 'Face Shape Analysis',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80',
    features: ['Virtual Try-On Assist', 'Frame Color Pairing', 'Tone Matching', 'Lifestyle Fitting'],
    cta: 'Book Stylist'
  },
  {
    title: 'Precision Eye Test',
    subtitle: 'Clinical Excellence',
    image: 'https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?auto=format&fit=crop&w=800&q=80',
    features: ['Prescription Review', 'Digital Eye Mapping', 'Lens Coating Demo', 'Health Screening'],
    cta: 'Schedule Exam'
  },
  {
    title: 'VIP Wholesale',
    subtitle: 'Business Solutions',
    image: 'https://images.unsplash.com/photo-1491336477066-31156b5e4f35?auto=format&fit=crop&w=800&q=80',
    features: ['Corporate Benefits', 'Bulk Customization', 'Logistics Support', 'Partnership Tiers'],
    cta: 'Inquire Now'
  }
];

export default function AppointmentSection() {
  const darkTeal = '#004743';
  const primaryGold = '#F3A852';

  return (
    <section className="py-32 bg-zinc-50 dark:bg-zinc-950">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
          <div className="max-w-xl">
            <h4 className="text-[#F3A852] text-[10px] font-black uppercase tracking-[0.4em] mb-4">Concierge Services</h4>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.85]" style={{ color: darkTeal }}>
              Elevate Your <br /> <span className="text-zinc-300 dark:text-zinc-800 italic">Perspective.</span>
            </h2>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium max-w-xs text-sm leading-relaxed">
            From clinical precision to high-fashion styling, our experts are here to craft your perfect look.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
          {services.map((service, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.8 }}
              className="group flex flex-col bg-white dark:bg-zinc-900 rounded-[2.5rem] p-4 border border-zinc-200 dark:border-zinc-800 hover:shadow-[0_40px_80px_-15px_rgba(0,71,67,0.15)] transition-all duration-500"
            >
              {/* Image Container with Reveal Effect */}
              <div className="relative aspect-[4/5] mb-8 overflow-hidden rounded-[2rem]">
                <Image 
                  src={service.image} 
                  alt={service.title} 
                  fill 
                  className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                  loader={({ src }) => src} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Floating Corner Label */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-sm">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-900">{service.subtitle}</span>
                </div>
              </div>

              {/* Text Content */}
              <div className="px-4 pb-4 flex flex-col flex-grow">
                <h3 className="text-2xl font-black uppercase tracking-tight mb-6 leading-none" style={{ color: darkTeal }}>
                  {service.title}
                </h3>
                
                <ul className="space-y-3 mb-10">
                  {service.features.map((feature, fIdx) => (
                    <li key={fIdx} className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F3A852]" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Modern Button Component */}
                <button 
                  className="mt-auto group/btn relative w-full overflow-hidden rounded-2xl py-5 transition-all bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                >
                  <span className="relative z-10">{service.cta}</span>
                  <ArrowUpRightIcon className="w-4 h-4 relative z-10 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                  <div className="absolute inset-0 bg-[#F3A852] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}