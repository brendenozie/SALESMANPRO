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

  return (
    <section className="relative py-24 lg:py-40 bg-white overflow-hidden">
      {/* --- BACKGROUND ELEMENTS --- */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gray-50/50 -z-10" />
      <div className="absolute top-20 left-10 text-[10rem] font-serif font-black text-gray-50 opacity-[0.05] select-none pointer-events-none uppercase tracking-tighter">
        Academy
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          
          {/* LEFT: THE CONTENT COLUMN (Col Span 5) */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="h-[2px] w-12" style={{ backgroundColor: accentColor }} />
                <span className="text-[10px] font-black tracking-[0.4em] uppercase text-gray-400">
                  Institutional Profile
                </span>
              </div>

              <h2 className="text-5xl lg:text-6xl font-serif font-bold text-gray-900 leading-[1.05] mb-10 tracking-tighter">
                {headline.split(' ').slice(0, -1).join(' ')}{' '}
                <span className="italic font-light text-gray-400">
                  {headline.split(' ').slice(-1)}
                </span>
              </h2>

              <p className="text-xl text-gray-600 leading-relaxed mb-12 font-medium">
                {description}
              </p>

              {/* Professional Merit Bento Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                {coreValues.map((item: any, idx: number) => {
                  const Icon = IconMap[item.icon] || AcademicCapIcon;
                  return (
                    <motion.div 
                      key={idx} 
                      whileHover={{ y: -5 }}
                      className="p-6 bg-white border border-gray-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] flex flex-col gap-4"
                    >
                      <div className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-900">
                        <Icon className="w-5 h-5" style={{ color: primaryColor }} />
                      </div>
                      <h4 className="font-black text-gray-900 text-[11px] uppercase tracking-widest leading-tight">
                        {item.title}
                      </h4>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-10 py-5 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all"
                  style={{ backgroundColor: primaryColor }}
                >
                  Book Private Tour
                </motion.button>
                <button className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-3 group">
                  Institutional Prospectus
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: THE PRECISION VISUAL (Col Span 7) */}
          <div className="lg:col-span-7">
            <div className="relative grid grid-cols-12 grid-rows-12 h-[500px] lg:h-[700px]">
              
              {/* Main Architectural Image */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="col-start-1 col-end-10 row-start-1 row-end-11 relative overflow-hidden bg-gray-100 border-[12px] border-white shadow-2xl z-20"
              >
                <Image decoding="async" 
                  src={storeFormData.bannerUrl || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2040&auto=format&fit=crop"}
                  alt="Main School Visual"
                  fill
                  className="object-cover"
                />
              </motion.div>

              {/* Secondary Detail Image (Inset) */}
              <motion.div 
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="col-start-8 col-end-13 row-start-6 row-end-13 relative overflow-hidden border-[12px] border-white shadow-2xl z-30 bg-gray-200"
              >
                <Image decoding="async" 
                  src="https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80" 
                  alt="Classroom" 
                  fill 
                  className="object-cover" 
                />
              </motion.div>

              {/* Floating Trust Metric Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="absolute left-[-10%] bottom-10 z-40 bg-white p-8 shadow-2xl border border-gray-50 hidden xl:block max-w-[200px]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Certified Excellence</span>
                </div>
                <p className="text-3xl font-serif font-bold text-gray-900 tracking-tighter">100%</p>
                <p className="text-[10px] text-gray-500 font-medium mt-1 leading-relaxed">
                  Compliance with Global Pedagogy Standards for 2026.
                </p>
              </motion.div>

              {/* Decorative Geometric Accent */}
              <div className="absolute top-10 right-0 w-32 h-32 border-r-2 border-t-2 border-gray-100 -z-10" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default SchoolSection;