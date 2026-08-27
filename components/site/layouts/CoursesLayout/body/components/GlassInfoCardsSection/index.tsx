"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRightIcon, 
  AcademicCapIcon, 
  GlobeAltIcon, 
  UserGroupIcon,
  BeakerIcon 
} from '@heroicons/react/24/outline';
import Image from 'next/image';

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => 
  `${src}?w=${width}&q=${quality || 75}`;

export default function ProfessionalInfoCardsSection({ storeFormData }: any) {
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#1e3a8a';
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#d4af37';

  const cards = [
    { 
      title: 'Global Scholars', 
      description: 'A curriculum designed for future international leaders.', 
      icon: GlobeAltIcon, 
    },
    { 
      title: 'Academic Mastery', 
      description: 'World-class educators dedicated to every student’s potential.', 
      icon: AcademicCapIcon, 
    },
    { 
      title: 'STEM Innovation', 
      description: 'Advanced laboratories fostering scientific breakthrough.', 
      icon: BeakerIcon, 
    },
    { 
      title: 'Elite Athletics', 
      description: 'Building character through comprehensive sports programs.', 
      icon: UserGroupIcon, 
    },
  ];

  return (
    <section className="relative z-30 bg-white py-24 md:py-32 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Simple, Centered Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-4">
            The Academy Advantage
          </h2>
          <h3 className="text-3xl md:text-4xl font-serif text-slate-900 italic">
            Excellence in every endeavor.
          </h3>
        </div>

        {/* Clean, Uniform Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {cards.map((card, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group flex flex-col items-center text-center"
            >
              {/* Minimalist Icon Circle */}
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mb-8 border border-slate-100 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-slate-100 group-hover:-translate-y-1"
                style={{ background: 'linear-gradient(to bottom, #ffffff, #f8fafc)' }}
              >
                <card.icon className="w-6 h-6 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </div>

              <h4 className="text-lg font-bold text-slate-900 mb-3 tracking-tight">
                {card.title}
              </h4>
              
              <p className="text-sm text-slate-500 leading-relaxed mb-6 font-light">
                {card.description}
              </p>

              <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-300 group-hover:text-slate-900 transition-all">
                Learn More <ArrowRightIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}