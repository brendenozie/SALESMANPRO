'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  PlayIcon, 
  UserGroupIcon, 
  BookOpenIcon, 
  AcademicCapIcon, 
  TrophyIcon,
  SparklesIcon,
  ArrowUpRightIcon
} from '@heroicons/react/24/outline'; // Consistency with Hero Icons

const getStatIcon = (label: string) => {
  const low = label.toLowerCase();
  if (low.includes("student")) return UserGroupIcon;
  if (low.includes("course")) return BookOpenIcon;
  if (low.includes("tutor") || low.includes("expert")) return AcademicCapIcon;
  return TrophyIcon;
};

export default function MoriahAboutSection({ storeFormData }: any) {
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#1e40af';
  
  const aboutHeadline = storeFormData?.name || "Moriah Academy";
  const aboutDescription = storeFormData?.description || "Empower your academic journey with innovative tools and personalized learning paths.";
  const videoThumbnail = storeFormData?.heroSlides?.[0]?.imageUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f";
  
  const stats = storeFormData?.stats || [
    { label: "Students", value: "5k+" },
    { label: "Specialized Labs", value: "12" },
    { label: "Expert Faculty", value: "85" },
  ];

  return (
    <section className="relative py-32 bg-white overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-2/3 bg-blue-50/30 rounded-full blur-[120px] -z-10" />
      
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-20 items-center">
          
          {/* --- Left: The Narrative (5 Columns) --- */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full mb-8">
                <SparklesIcon className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Our Story</span>
              </div>

              <h2 className="text-5xl md:text-6xl font-light text-slate-900 leading-[1.1] tracking-tight mb-8">
                A tradition of <br />
                <span className="font-semibold italic">excellence</span> at {aboutHeadline}.
              </h2>

              <p className="text-lg text-slate-500 leading-relaxed mb-12 font-normal">
                {aboutDescription}
              </p>

              {/* Stats in a minimalist glass row */}
              <div className="grid grid-cols-3 gap-8 mb-12 border-t border-slate-100 pt-12">
                {stats.map((stat: any, i: number) => {
                  const Icon = getStatIcon(stat.label);
                  return (
                    <div key={i} className="flex flex-col gap-2">
                      <span className="text-2xl font-bold text-slate-900 tracking-tighter">{stat.value}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                    </div>
                  );
                })}
              </div>

              <button className="group flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-slate-900">
                Explore Our Campus
                <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                  <ArrowUpRightIcon className="w-4 h-4" />
                </div>
              </button>
            </motion.div>
          </div>

          {/* --- Right: The Visual Centerpiece (7 Columns) --- */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* The "Cinematic" Video Frame */}
              <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border-[8px] border-white group">
                <Image
                  src={videoThumbnail || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f"}
                    loader={({src})=>src}
                  alt="Campus Life"
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/30 transition-colors duration-500 flex items-center justify-center">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-20 h-20 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-2xl transition-all"
                  >
                    <PlayIcon className="w-8 h-8 text-slate-900 ml-1" />
                  </motion.button>
                </div>
              </div>

              {/* Floating Decorative Glass Tablet */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="absolute -bottom-10 -left-10 hidden md:block"
              >
                <div className="bg-white/70 backdrop-blur-2xl p-8 rounded-[2rem] border border-white shadow-2xl shadow-blue-900/5 max-w-[240px]">
                  <TrophyIcon className="w-8 h-8 text-blue-600 mb-4" />
                  <p className="text-sm font-bold text-slate-900 mb-1">Globally Recognized</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                    Awarded "Innovation of the Year" for our digital learning integration.
                  </p>
                </div>
              </motion.div>

              {/* Design Detail: Orbiting Ring */}
              <div className="absolute -top-10 -right-10 w-40 h-40 border border-slate-100 rounded-full -z-10 animate-pulse" />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}