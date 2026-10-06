"use client";

import React from 'react';
import { 
  CheckCircleIcon, 
  ArrowRightIcon, 
  AcademicCapIcon, 
  UserGroupIcon, 
  LightBulbIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline'; // Consistent Hero Icons
import { motion } from 'framer-motion';
import Image from 'next/image';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => 
  `${src}?w=${width}&q=${quality || 75}`;

const IconMap = {
  CheckCircleIcon,
  AcademicCapIcon,
  UserGroupIcon,
  LightBulbIcon,
};

export default function SchoolSection({ storeFormData }: any) {
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#1e3a8a';
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#d4af37';

  const headline = storeFormData?.name || "Unlock Your Academic Excellence";
  const mainDescription = storeFormData?.description || "Empower your academic journey with innovative tools and personalized learning paths.";
  
  const CoreValuesFallback = [
    { title: 'Tailored learning.', icon: 'AcademicCapIcon' },
    { title: 'Engaging content.', icon: 'LightBulbIcon' },
    { title: 'Expert guidance.', icon: 'UserGroupIcon' },
    { title: 'Real-time analytics.', icon: 'CheckCircleIcon' },
  ];

  const coreValues = (storeFormData?.CoreValues?.length ? storeFormData.CoreValues : CoreValuesFallback).slice(0, 4);
  const imageUrl = storeFormData?.bannerUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2670&auto=format&fit=crop";

  return (
    <section className="relative py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* --- LEFT SIDE: THE CONTENT CANVAS --- */}
          <div className="w-full lg:w-1/2 relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="h-px w-8 bg-slate-200" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Our Philosophy</span>
              </div>

              <h2 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 mb-8 leading-tight">
                {headline}
              </h2>

              <p className="text-lg text-slate-500 font-light leading-relaxed mb-10 max-w-xl">
                {mainDescription}
              </p>

              {/* Minimalist Feature List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12 mb-12">
                {coreValues.map((value: any, idx: number) => {
                  const Icon = IconMap[value.icon as keyof typeof IconMap] || CheckCircleIcon;
                  return (
                    <div key={idx} className="flex items-start gap-4 group">
                      <div className="mt-1">
                        <Icon className="w-5 h-5 transition-colors group-hover:text-slate-900" style={{ color: primaryColor }} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight mb-1">{value.title}</h4>
                        <div className="h-0.5 w-0 group-hover:w-full bg-slate-100 transition-all duration-500" />
                      </div>
                    </div>
                  );
                })}
              </div>

              <motion.button
                whileHover={{ gap: '1.5rem' }}
                className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] text-white px-10 py-5 rounded-full shadow-2xl transition-all"
                style={{ backgroundColor: primaryColor }}
              >
                Enroll Now <ArrowRightIcon className="w-4 h-4" />
              </motion.button>
            </motion.div>
          </div>

          {/* --- RIGHT SIDE: THE LAYERED IMAGERY --- */}
          <div className="w-full lg:w-1/2 relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-[4/5] rounded-[0rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)]"
            >
              <Image decoding="async" 
                src={imageUrl} 
                alt="Campus life" 
                fill 
                className="object-cover transition-transform duration-1000 hover:scale-105"
              />
              {/* Elegant overlay for the bottom info */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
              
              {/* Floating Quote Badge */}
              <motion.div 
                initial={{ y: 40, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-8 left-8 right-8 bg-white/95 p-8 rounded-3xl shadow-2xl"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <SparklesIcon key={i} className="w-3 h-3 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 italic text-sm leading-relaxed mb-4 font-serif">
                  "The standard of teaching here is unparalleled. It's not just an education; it's a transformation of character."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-px w-4 bg-slate-300" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Dr. Helena Vance, Alumni</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Geometric Accent Decoration */}
            <div 
              className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[80px] opacity-20" 
              style={{ backgroundColor: secondaryColor }}
            />
          </div>

        </div>
      </div>
    </section>
  );
}