"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  AcademicCapIcon, 
  UserGroupIcon, 
  StarIcon,
  CheckBadgeIcon,
  ArrowRightIcon,
  PlayIcon
} from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';
import Image from 'next/image';

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default function JuniorPrimaryHero({storeFormData}: { storeFormData: any }) {
  // const { storeFormData } = useStoreContext();
  
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#1e40af';
  const activeSlide = storeFormData?.heroSlides?.[0];

  // Professional school-focused fallback content
  const headline = activeSlide?.headline || "Building Foundations for a Lifetime of Excellence.";
  const subline = activeSlide?.subline || "A nurturing environment where curiosity meets world-class curriculum. We prepare your child for the global stage with values-based primary education.";

  return (
    <div className="relative bg-white font-sans overflow-hidden">
      
      {/* --- TOP BRAND BAR (Subtle Trust Signal) --- */}
      <div className="bg-slate-50 border-b border-slate-100 py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <CheckBadgeIcon className="w-4 h-4 text-blue-600" />
              Ministry of Education Accredited
            </span>
            <span className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <ShieldCheckIcon className="w-4 h-4 text-green-600" />
              Secure 24/7 Monitored Campus
            </span>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-3 h-3 text-amber-400" />)}
            <span className="text-[10px] font-bold text-slate-400 ml-2">Top Rated Junior School 2026</span>
          </div>
        </div>
      </div>

      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* --- CONTENT: THE PROFESSIONAL PROMISE --- */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div 
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6"
                style={{ backgroundColor: `${primaryColor}10` }}
              >
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: primaryColor }}>
                  Admissions Open for 2026 Academic Year
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl xl:text-7xl font-serif font-bold text-slate-900 leading-[1.1] mb-8">
                {headline}
              </h1>

              <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-10 border-l-4 pl-6" style={{ borderColor: primaryColor }}>
                {subline}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 rounded-xl text-white font-bold text-lg shadow-lg flex items-center justify-center gap-3"
                  style={{ backgroundColor: primaryColor }}
                >
                  Book a Campus Tour
                  <ArrowRightIcon className="w-5 h-5" />
                </motion.button>
                
                <button className="px-8 py-4 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-bold text-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-3">
                  <PlayIcon className="w-5 h-5 text-slate-400" />
                  See Our Classrooms
                </button>
              </div>

              {/* Trust Indicators for Parents */}
              <div className="mt-12 grid grid-cols-3 gap-4 border-t border-slate-100 pt-10">
                <div>
                  <p className="text-2xl font-bold text-slate-900">12:1</p>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Teacher Ratio</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">STEM+</p>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Curriculum</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">100%</p>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Safe Environment</p>
                </div>
              </div>
            </motion.div>

            {/* --- VISUAL: THE SAFE & HAPPY LEARNER --- */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
            >
              {/* Decorative Elements */}
              <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ backgroundColor: primaryColor }} />
              
              <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white">
                <Image
                  src={activeSlide?.imageUrl || "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80"}
                  alt="Happy Junior Student"
                  width={600}
                  height={700}
                  className="object-cover aspect-[4/5]"
                  loader={customLoader}
                  priority
                />
                
                {/* Floating "Quality" Badge */}
                <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-xl flex items-center gap-5 border border-slate-100">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-blue-50">
                    <AcademicCapIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Certified Excellence</h4>
                    <p className="text-xs text-slate-500">Recognized for outstanding primary pedagogy and child development.</p>
                  </div>
                </div>
              </div>

              {/* Parent Testimonial Snippet */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute -left-12 top-20 hidden xl:block bg-white p-4 rounded-2xl shadow-xl border border-slate-100 max-w-[200px]"
              >
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-3 h-3 text-amber-400" />)}
                </div>
                <p className="text-[11px] italic text-slate-600">"The best decision we made for our daughter's foundation."</p>
                <p className="text-[10px] font-bold mt-2 text-slate-900">— Sarah M., Parent</p>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Background Subtle Shapes */}
      <div className="absolute top-0 left-0 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-blue-50 rounded-full blur-3xl -z-10" />
    </div>
  );
}