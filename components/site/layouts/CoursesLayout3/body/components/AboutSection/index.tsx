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
} from '@heroicons/react/24/solid'; // Using Solid Hero Icons
import Image from 'next/image';
import clsx from 'clsx';

// --- Utility Functions ---
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = "https://placehold.co/1200x800/CCCCCC/333333?text=Image+Error";
};

const getStatIcon = (label: string) => {
  const normalizedLabel = label.toLowerCase();
  if (normalizedLabel.includes("student") || normalizedLabel.includes("enrolled")) return UserGroupIcon;
  if (normalizedLabel.includes("course") || normalizedLabel.includes("offered")) return BookOpenIcon;
  if (normalizedLabel.includes("tutor") || normalizedLabel.includes("expert")) return AcademicCapIcon;
  if (normalizedLabel.includes("award") || normalizedLabel.includes("countrywide")) return TrophyIcon;
  return SparklesIcon;
};

// --- Custom Stat Component (Floating Badge) ---
const StatBadge = ({ stat, primaryColor, delay }: { stat: any, primaryColor: string, delay: number }) => {
  const Icon = getStatIcon(stat.label);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 100 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="flex items-center p-4 rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-xl border border-gray-100 dark:border-gray-700 min-w-[180px]"
    >
      <div 
        className="p-2.5 rounded-xl mr-4 flex-shrink-0" 
        style={{ backgroundColor: `${primaryColor}15` }}
      >
        <Icon className="w-6 h-6" style={{ color: primaryColor }} />
      </div>
      <div>
        <p className="text-xl font-black text-gray-900 dark:text-white leading-none mb-1">{stat.value}</p>
        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{stat.label}</p>
      </div>
    </motion.div>
  );
};

export default function AboutSection({ storeFormData }: any) {
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121';
  const accentColor = storeFormData?.themeSettings?.secondaryColor || '#FFC107';

  const aboutHeadline = storeFormData?.name ? `The Smarter Way to Learn with ${storeFormData.name}` : "The Smarter Way to Learn";
  const aboutDescription = storeFormData?.description || "Empower your academic journey with innovative tools and personalized learning paths. Our platform helps you master complex subjects, ace exams, and unlock your full potential with ease and efficiency.";
  const aboutVideoThumbnail = storeFormData?.heroSlides?.[0]?.imageUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop";
  const aboutVideoLink = storeFormData?.heroSlides?.[0]?.videoLink || "#";
  const aboutStats = storeFormData?.stats || [
    { label: "Students", value: "5,000+" },
    { label: "Courses", value: "150+" },
    { label: "Expert Tutors", value: "50+" },
    { label: "Awards", value: "60+" },
  ];

  return (
    <section className="relative py-24 px-6 lg:px-8 bg-white dark:bg-gray-950 overflow-hidden">
      {/* Abstract Background Accents */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gray-50/50 dark:bg-gray-900/20 -skew-x-12 translate-x-1/4 z-0" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          
          {/* Visual Side */}
          <div className="lg:col-span-7 relative">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="relative rounded-[2.5rem] overflow-hidden shadow-2xl z-10"
            >
              <div className="aspect-[16/10] relative group cursor-pointer" onClick={() => window.open(aboutVideoLink, '_blank')}>
                <Image
                  src={aboutVideoThumbnail || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop"}
                  alt="About Us"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  loader={loader}
                  onError={handleImageError}
                />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-20 h-20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30"
                    style={{ backgroundColor: `${primaryColor}cc` }}
                  >
                    <PlayIcon className="w-8 h-8 text-white ml-1" />
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Floating Stats - Overlapping the image slightly */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[90%] lg:w-full flex flex-wrap justify-center gap-4 z-20">
              {aboutStats.slice(0, 4).map((stat: any, idx: number) => (
                <StatBadge 
                  key={idx} 
                  stat={stat} 
                  primaryColor={primaryColor} 
                  delay={0.2 + (idx * 0.1)} 
                />
              ))}
            </div>
          </div>

          {/* Text Side */}
          <div className="lg:col-span-5 pt-12 lg:pt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span 
                className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              >
                {storeFormData?.tagline || "Our Evolution"}
              </span>
              
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-6 tracking-tight">
                {aboutHeadline.split(' ').map((word, i) => (
                  <span key={i} className={clsx(i % 3 === 0 && i !== 0 ? "block" : "")}>
                    {word}{" "}
                  </span>
                ))}
              </h2>

              <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed mb-10">
                {aboutDescription}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.a
                  href="/about"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all"
                  style={{ backgroundColor: primaryColor }}
                >
                  Learn Our Story
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </motion.a>
                
                <button className="px-8 py-4 rounded-xl font-bold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Contact Us
                </button>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
      
      {/* Bottom Spacer for Floating Stats */}
      <div className="h-16" />
    </section>
  );
}