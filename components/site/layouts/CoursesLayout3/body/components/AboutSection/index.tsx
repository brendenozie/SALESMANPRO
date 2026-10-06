"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  PlayIcon, 
  UserGroupIcon, 
  AcademicCapIcon, 
  TrophyIcon, 
  BookOpenIcon, 
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/solid';
import Image from 'next/image';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

const getStatIcon = (label: string) => {
  const normalizedLabel = label.toLowerCase();
  if (normalizedLabel.includes("student")) return UserGroupIcon;
  if (normalizedLabel.includes("course")) return BookOpenIcon;
  if (normalizedLabel.includes("tutor")) return AcademicCapIcon;
  if (normalizedLabel.includes("award")) return TrophyIcon;
  return SparklesIcon;
};

export default function AboutSection({ storeFormData }: any) {
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#1e3a8a';
  
  const aboutHeadline = storeFormData?.name ? `The Smarter Way to Learn with ${storeFormData.name}` : "The Smarter Way to Learn";
  const aboutDescription = storeFormData?.description || "Empower your academic journey with innovative tools and personalized learning paths. Our platform helps you master complex subjects with ease.";
  const aboutVideoThumbnail = storeFormData?.heroSlides?.[0]?.imageUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop";
  const aboutStats = storeFormData?.stats || [
    { label: "Students", value: "5,000+" },
    { label: "Programs", value: "150+" },
    { label: "Educators", value: "50+" },
    { label: "Awards", value: "60+" },
  ];

  return (
    <section className="relative py-24 lg:py-40 bg-white overflow-hidden">
      {/* --- DESIGNER ACCENTS --- */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/2 right-0 w-1/4 h-px bg-gray-100" />
        <div className="absolute top-0 right-[10%] w-px h-full bg-gray-50" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          {/* LEFT: THE CONTENT (Col Span 5) */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-8">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">Our Impact</span>
                <div className="h-px w-8 bg-gray-200" />
              </div>

              <h2 className="text-4xl lg:text-6xl font-serif font-bold text-gray-900 leading-[1.1] mb-8 tracking-tighter">
                {aboutHeadline.split(' ').slice(0, -2).join(' ')}{' '}
                <span className="italic font-light text-gray-400">
                  {aboutHeadline.split(' ').slice(-2).join(' ')}
                </span>
              </h2>

              <p className="text-lg text-gray-500 leading-relaxed mb-12 font-medium">
                {aboutDescription}
              </p>

              {/* Stats Grid: Clean & Institutional */}
              <div className="grid grid-cols-2 gap-y-10 gap-x-8 mb-12">
                {aboutStats.slice(0, 4).map((stat: any, idx: number) => {
                  const Icon = getStatIcon(stat.label);
                  return (
                    <div key={idx} className="group">
                      <div className="flex items-center gap-4 mb-3">
                        <Icon className="w-5 h-5 text-gray-300 group-hover:text-gray-900 transition-colors" style={{ color: idx === 0 ? primaryColor : undefined }} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{stat.label}</span>
                      </div>
                      <p className="text-3xl font-serif font-bold text-gray-900 tracking-tighter">{stat.value}</p>
                    </div>
                  );
                })}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group flex items-center gap-6 text-[11px] font-black uppercase tracking-[0.3em] text-gray-900"
              >
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white transition-all group-hover:shadow-xl"
                  style={{ backgroundColor: primaryColor }}
                >
                  <ArrowRightIcon className="w-5 h-5" />
                </div>
                Learn More About Us
              </motion.button>
            </motion.div>
          </div>

          {/* RIGHT: THE CINEMATIC FRAME (Col Span 7) */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Main Image with Architectural Border */}
              <div className="relative bg-white p-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-gray-100">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image decoding="async"
                    src={aboutVideoThumbnail}
                    alt="About Vision"
                    fill
                    className="object-cover transition-transform duration-1000 hover:scale-105"
                  />
                  
                  {/* Play Button: Refined Institutional Style */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/10 backdrop-blur-[2px] hover:backdrop-blur-none transition-all cursor-pointer">
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className="w-24 h-24 rounded-full bg-white/90 flex items-center justify-center shadow-2xl backdrop-blur-md border border-white"
                    >
                      <PlayIcon className="w-6 h-6 ml-1" style={{ color: primaryColor }} />
                    </motion.div>
                  </div>
                </div>

                {/* Vertical Label */}
                <div className="absolute -right-4 top-1/2 -rotate-90 origin-right translate-x-full hidden xl:block">
                  <span className="text-[9px] font-black text-gray-200 uppercase tracking-[1em] whitespace-nowrap">
                    Multimedia Presentation • 2026
                  </span>
                </div>
              </div>

              {/* Decorative Geometric Block */}
              <div 
                className="absolute -bottom-10 -left-10 w-40 h-40 -z-10 opacity-10"
                style={{ backgroundColor: primaryColor }}
              />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}