"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

interface MedicalServicesSectionProps {
  services: Array<{ id: string; name: string; imageUrl: string; slug: string; description?: string }>;
  storeSlug: string;
}

const DEFAULT_PRIMARY_COLOR = '#0d9488'; 

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
  }
};

export default function MedicalServicesSection({ services, storeSlug }: MedicalServicesSectionProps) {
  const router = useRouter();
  const { storeFormData } = useStoreContext();

  const primaryColor = storeFormData?.themeSettings?.primaryColor || DEFAULT_PRIMARY_COLOR;

  return (
    <section id="services" className="relative py-24 lg:py-36 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      
      {/* AMBIENT GLOW DECORATIONS */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-teal-500/5 dark:bg-teal-500/[0.02] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-12 left-10 w-[300px] h-[300px] bg-sky-500/5 dark:bg-sky-500/[0.01] rounded-full blur-[100px] pointer-events-none" />

      {/* BACKGROUND GEOMETRIC TEXTURE */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.4] dark:opacity-[0.15] mix-blend-overlay pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(203 213 225 / 0.4) 1px, transparent 0)', 
          backgroundSize: '32px 32px' 
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* HEADER BLOCK ARCHITECTURE */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span 
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm"
              style={{ color: primaryColor }}
            >
              <SparklesIcon className="w-3.5 h-3.5 animate-pulse" />
              Our Specializations
            </span>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-6">
              World-Class <span className="relative inline-block">
                <span className="relative z-10">Medical Expertise</span>
                <span 
                  className="absolute bottom-2 left-0 w-full h-[6px] rounded-full opacity-20 -z-10"
                  style={{ backgroundColor: primaryColor }}
                />
              </span>
            </h2>
            
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
              Combining advanced data insights, top-tier clinical machinery, and deeply compassionate environments to look after your overall wellness profile.
            </p>
          </motion.div>
        </div>

        {/* HIGH-END INTERACTIVE SERVICES GRID */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
        >
          {services.map((svc) => (
            <motion.div
              key={svc.id}
              variants={cardVariants}
              whileHover={{ y: -8 }}
              className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-[0_4px_20px_rgba(15,23,42,0.01)] border border-slate-200/50 dark:border-slate-800/60 hover:shadow-[0_20px_40px_rgba(15,23,42,0.06)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all duration-500 cursor-pointer"
              onClick={() => router.push(`/${storeSlug}/service/${svc.slug}`)}
            >
              {/* IMAGE ASSET CONTROLLER */}
              <div className="relative h-56 w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
                <Image
                  src={svc.imageUrl || "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?q=80&w=2091&auto=format&fit=crop"}
                  alt={svc.name}
                  loader={customLoader}
                  fill
                  className="object-cover transition-transform duration-700 ease-[0.16, 1, 0.3, 1] group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                {/* PREMIUM MICRO BADGE INDICATOR */}
                <div className="absolute top-4 right-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-2.5 rounded-xl shadow-sm border border-white/20 dark:border-slate-800/50 transition-transform duration-500 group-hover:scale-105">
                  <div 
                    className="w-4 h-4 rounded-full border-2 flex items-center justify-center opacity-80"
                    style={{ borderColor: primaryColor }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                  </div>
                </div>
              </div>

              {/* CARD DETAILS CONTAINER */}
              <div className="flex-1 p-6 lg:p-7 flex flex-col relative">
                
                {/* AMBIENT SPRING ACCENT LINE */}
                <div 
                  className="h-1 rounded-full mb-5 transition-all duration-500 ease-[0.16, 1, 0.3, 1] w-8 group-hover:w-16" 
                  style={{ backgroundColor: primaryColor }}
                />

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight transition-colors duration-300 group-hover:text-slate-800 dark:group-hover:text-slate-100">
                  {svc.name}
                </h3>

                {svc.description && (
                  <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium leading-relaxed mb-6 line-clamp-2">
                    {svc.description}
                  </p>
                )}

                {/* CALL-TO-ACTION ELEMENT */}
                <div className="mt-auto pt-2 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group/btn">
                  <span className="tracking-tight transition-all duration-300 group-hover:text-slate-950 dark:group-hover:text-white">
                    Explore Treatment Details
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/50 flex items-center justify-center group-hover:bg-slate-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-slate-900 transition-all duration-300">
                    <ArrowRightIcon className="w-3.5 h-3.5 transform group-hover:-rotate-45 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* FULL CATALOGUE REDIRECT SYSTEM */}
        <div className="mt-20 text-center">
          <motion.button
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(`/${storeSlug}/all-services`)}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-base font-bold rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.05)] hover:shadow-[0_10px_30px_rgba(15,23,42,0.1)] transition-all duration-300 border border-transparent dark:border-slate-200"
          >
            View Full Service Menu
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </motion.button>
        </div>

      </div>
    </section>
  );
}