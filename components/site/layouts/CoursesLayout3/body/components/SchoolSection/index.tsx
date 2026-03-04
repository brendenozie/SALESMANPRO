"use client";

import React from 'react';
import { 
  CheckBadgeIcon, 
  ArrowRightIcon, 
  AcademicCapIcon, 
  UserGroupIcon, 
  SparklesIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import Image from 'next/image';

const SchoolSection = ({ storeFormData }: any) => {
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#1e3a8a'; 
  const accentColor = storeFormData?.themeSettings?.secondaryColor || '#d4af37'; 

  const headline = storeFormData?.name || "A Foundation Built on Excellence";
  const description = storeFormData?.description || "Providing a world-class junior primary education where character development meets academic rigor. We prepare your child for the global stage.";

  const IconMap: any = {
    AcademicCapIcon: AcademicCapIcon,
    LightBulbIcon: SparklesIcon,
    UserGroupIcon: UserGroupIcon,
    CheckCircleIcon: ShieldCheckIcon,
  };

  const coreValues = storeFormData?.CoreValues?.slice(0, 4) || [];

  const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
    return `${src}?w=${width}&q=${quality || 75}`;
  };
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2040&auto=format&fit=crop";
  };

  return (
    <section className="relative py-24 lg:py-32 px-6 bg-[#F8F9FA] overflow-hidden">
      {/* Decorative Brand Watermark */}
      <div className="absolute top-10 left-10 text-[8rem] lg:text-[12rem] font-serif font-black opacity-[0.03] select-none pointer-events-none uppercase tracking-tighter">
        Academy
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
          
          {/* LEFT: THE CONTENT COLUMN */}
          <div className="w-full lg:w-5/12 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                <span className="h-px w-8 bg-slate-300" />
                <span className="text-[10px] lg:text-xs font-bold tracking-[0.3em] uppercase text-slate-500">
                  Est. 2026 • Premier Junior Education
                </span>
              </div>

              <h2 className="text-4xl lg:text-6xl font-serif font-bold text-slate-900 leading-[1.1] mb-8">
                {headline.split(' ').slice(0, -1).join(' ')}{' '}
                <span className="relative inline-block">
                  {headline.split(' ').slice(-1)}
                  <svg className="absolute -bottom-2 left-0 w-full h-2" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke={accentColor} strokeWidth="6" fill="none" />
                  </svg>
                </span>
              </h2>

              <p className="text-lg lg:text-xl text-slate-600 leading-relaxed mb-10">
                {description}
              </p>

              {/* Professional Merit Grid */}
              <div className="grid sm:grid-cols-2 gap-4 mb-10 text-left">
                {coreValues.map((item: any, idx: number) => {
                  const Icon = IconMap[item.icon] || AcademicCapIcon;
                  return (
                    <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-sm border border-slate-100 group hover:border-slate-200 transition-all">
                      <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-white transition-colors">
                        <Icon className="w-5 h-5" style={{ color: primaryColor }} />
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs lg:text-sm leading-tight">{item.title}</h4>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-8 py-4 rounded-full text-white font-bold text-base shadow-lg flex items-center justify-center gap-3 transition-all"
                  style={{ backgroundColor: primaryColor }}
                >
                  Schedule a Private Tour
                  <ArrowRightIcon className="w-5 h-5" />
                </motion.button>
                <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white border border-slate-200 text-slate-700 font-bold text-base hover:bg-slate-50 transition-colors">
                  View Prospectus
                </button>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: THE VISUAL COLUMN - Fixed Alignment & Constraints */}
          <div className="w-full lg:w-7/12 flex items-center justify-center relative min-h-[500px] lg:min-h-[600px]">
            
            <div className="relative w-full max-w-[500px] aspect-square lg:aspect-[4/5]">
              
              {/* Main Center Image - Constrained within parent */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl z-20 border-[10px] border-white"
              >
                <Image 
                  src={storeFormData.bannerUrl || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2040&auto=format&fit=crop"}
                  alt="Main School Visual"
                  fill
                  className="object-cover"
                  loader={customLoader}
                  onError={handleImageError}
                />
              </motion.div>

              {/* Top-Left Accent - Anchored to the main box */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute -top-6 -left-6 lg:-top-12 lg:-left-12 w-32 h-32 lg:w-48 lg:h-48 rounded-2xl overflow-hidden shadow-xl z-30 border-4 border-white -rotate-6 hidden sm:block"
              >
                <Image src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80" alt="Student" fill className="object-cover" loader={customLoader} onError={handleImageError} />
              </motion.div>

              {/* Bottom-Right Accent - Anchored to the main box */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-6 -right-6 lg:-bottom-10 lg:-right-10 w-40 h-32 lg:w-56 lg:h-44 rounded-2xl overflow-hidden shadow-xl z-30 border-4 border-white rotate-3 hidden sm:block"
              >
                <Image src="https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80" alt="Classroom" fill className="object-cover" loader={customLoader} onError={handleImageError} />
              </motion.div>

              {/* Trust Badge - Positioned relative to the main image corner */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -right-4 top-10 lg:right-[-20%] lg:top-1/4 z-40 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg flex items-center gap-3 border border-slate-100"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md" style={{ backgroundColor: accentColor }}>
                  <CheckBadgeIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">Accredited</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Excellence</p>
                </div>
              </motion.div>

              {/* Background Glow */}
              <div 
                className="absolute inset-0 rounded-full blur-[80px] lg:blur-[120px] opacity-20 -z-10 scale-110" 
                style={{ backgroundColor: primaryColor }}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default SchoolSection;