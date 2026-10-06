"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  PlayIcon,
  AcademicCapIcon, 
  UserGroupIcon, 
  TrophyIcon, 
  BookOpenIcon, 
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'; // Using Heroicons as requested
import Image from 'next/image';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => 
  `${src}?w=${width}&q=${quality || 75}`;

const getStatIcon = (label: string) => {
  const normalizedLabel = label.toLowerCase();
  if (normalizedLabel.includes("student")) return UserGroupIcon;
  if (normalizedLabel.includes("course")) return BookOpenIcon;
  if (normalizedLabel.includes("tutor") || normalizedLabel.includes("expert")) return AcademicCapIcon;
  if (normalizedLabel.includes("award")) return TrophyIcon;
  return SparklesIcon;
};

export default function AboutSection({ storeFormData }: any) {
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#1e3a8a';
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#d4af37';

  const aboutHeadline = storeFormData?.name || "The Smarter Way to Learn";
  const aboutDescription = storeFormData?.description || "Empower your academic journey with innovative tools and personalized learning paths.";
  const aboutVideoThumbnail = storeFormData?.heroSlides?.[0]?.imageUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2670&auto=format&fit=crop";
  const aboutStats = storeFormData?.stats || [
    { label: "Students Enrolled", value: "5,000+" },
    { label: "Courses Offered", value: "150+" },
    { label: "Expert Tutors", value: "50+" },
    { label: "Countrywide Awards", value: "60+" },
  ];

  return (
    <section className="relative py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* --- TOP: THE HEADER & STATS GRID --- */}
        <div className="grid lg:grid-cols-12 gap-16 mb-24 items-end">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-slate-200" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                Our Heritage
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 leading-[1.1] mb-8">
              A legacy of <span className="italic font-light" style={{ color: primaryColor }}>excellence</span>, <br />
              built for the future.
            </h2>
            <p className="text-lg text-slate-500 font-light leading-relaxed max-w-xl">
              {aboutDescription}
            </p>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-8 border-l border-slate-100 pl-12">
            {aboutStats.map((stat: any, idx: number) => {
              const Icon = getStatIcon(stat.label);
              return (
                <div key={idx} className="group">
                  <Icon className="w-5 h-5 text-slate-300 mb-4 group-hover:text-slate-900 transition-colors" />
                  <div className="text-3xl font-serif font-bold text-slate-900 mb-1">{stat.value}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- BOTTOM: THE CINEMATIC VIDEO CANVAS --- */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative group cursor-pointer"
        >
          <div className="relative aspect-[21/9] rounded-[3rem] overflow-hidden shadow-2xl">
            <Image decoding="async" 
              src={aboutVideoThumbnail}
              alt="Campus Culture"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-colors" />

            {/* Centered Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Ripple Effect Circles */}
                <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-white scale-150" />
                <div className="absolute inset-0 rounded-full animate-ping opacity-10 bg-white scale-[2]" />
                
                <button 
                  className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl transition-transform duration-500 group-hover:scale-110"
                >
                  <PlayIcon className="w-8 h-8 text-slate-900 fill-slate-900 translate-x-0.5" />
                </button>
              </div>
            </div>

            {/* Bottom Caption */}
            <div className="absolute bottom-10 left-10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center bg-black/40">
                <span className="text-[10px] font-bold text-white">4K</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-white">Watch Our Story</span>
            </div>
          </div>

          {/* Floating Action Hint */}
          <div className="absolute -bottom-6 right-20">
            <motion.a
              href="/about"
              whileHover={{ x: 10 }}
              className="bg-slate-900 text-white px-10 py-6 rounded-full flex items-center gap-4 shadow-2xl"
            >
              <span className="text-[11px] font-black uppercase tracking-widest">Discover Our Mission</span>
              <ArrowRightIcon className="w-4 h-4 text-white" />
            </motion.a>
          </div>
        </motion.div>
      </div>

      {/* Background Decoration */}
      <div 
        className="absolute bottom-0 left-0 w-64 h-64 blur-[120px] opacity-10 rounded-full"
        style={{ backgroundColor: secondaryColor }}
      />
    </section>
  );
}