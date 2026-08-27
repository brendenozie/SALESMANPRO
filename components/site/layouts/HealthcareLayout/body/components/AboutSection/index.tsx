"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { HeartIcon, ShieldCheckIcon, UsersIcon, AcademicCapIcon, StarIcon } from '@heroicons/react/24/solid';
import { useStoreContext } from "@/contexts/StoreContext";
import { ICoreValue } from "@/types/typings";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => `${src}?w=${width}&q=${quality || 75}`;

// --- Premium Animation Suite ---
const fadeInScaleUp = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1
    }
  }
};

const fallbackCoreValues: ICoreValue[] = [
  { id: "v1", title: "Patient First", description: "Your health and comfort are our primary focus.", icon: "HeartIcon" },
  { id: "v2", title: "Expert Team", description: "Board-certified professionals dedicated to quality.", icon: "ShieldCheckIcon" },
  { id: "v3", title: "Community", description: "Actively promoting public health and well-being.", icon: "UsersIcon" },
  { id: "v4", title: "Innovation", description: "Leveraging the latest medical technology.", icon: "AcademicCapIcon" },
];

const iconMap: { [key: string]: React.ElementType } = {
  HeartIcon: HeartIcon,
  ShieldCheckIcon: ShieldCheckIcon,
  UsersIcon: UsersIcon,
  AcademicCapIcon: AcademicCapIcon,
};

export default function AboutSection() {
  const { storeFormData } = useStoreContext();

  // Dynamic values with clean fallbacks
  const aboutImageUrl = storeFormData?.bannerUrl || "https://images.unsplash.com/photo-1631815588090-d4bfec5b1b89?q=80&w=1974&auto=format&fit=crop";
  const aboutText = storeFormData?.description || "Our mission is to provide compassionate, high-quality healthcare services to our community. We are dedicated to promoting wellness and restoring health with professionalism and empathy. Our team of skilled medical professionals works collaboratively to ensure every patient receives personalized care.";
  const primaryColor = storeFormData?.themeSettings?.primaryColor || "#0d9488"; // Healthcare Teal
  const coreValuesToRender = storeFormData?.CoreValues || fallbackCoreValues;

  return (
    <section id="about" className="relative py-24 lg:py-32 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      
      {/* Premium Ambient Light Backdrops */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none select-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-[120px] opacity-70" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/5 dark:bg-emerald-500/5 rounded-full blur-[100px] opacity-60" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center">
          
          {/* --- LEFT SIDE: Immersive Asymmetric Image Grid --- */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative lg:col-span-5 z-10"
          >
            {/* Interactive Hero Image Frame */}
            <div className="relative rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 p-3 shadow-[0_24px_70px_-15px_rgba(15,23,42,0.12)] border border-slate-100 dark:border-slate-800/80 group">
              <div className="relative rounded-[1.5rem] overflow-hidden aspect-[4/5] lg:aspect-[3/4] bg-slate-100 dark:bg-slate-800">
                <Image
                  src={aboutImageUrl}
                  alt="Our dedicated healthcare infrastructure"
                  loader={loader}
                  fill
                  priority
                  className="object-cover transition-transform duration-1000 ease-[0.16, 1, 0.3, 1] group-hover:scale-[1.04]"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-slate-950/5 to-transparent opacity-80" />
              </div>
            </div>

            {/* Floating Clinical Trust Verification Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
              className="absolute -bottom-6 -right-2 md:-right-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-5 rounded-2xl shadow-[0_20px_40px_-10px_rgba(15,23,42,0.15)] border border-white dark:border-slate-800 max-w-[260px] z-20"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className="flex -space-x-2.5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 overflow-hidden shadow-sm bg-slate-100">
                      <img src={`https://i.pravatar.cc/100?img=${i + 12}`} alt="Verified Practitioner" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((i) => <StarIcon key={i} className="w-3.5 h-3.5" />)}
                </div>
              </div>
              <p className="text-xs font-semibold leading-normal text-slate-800 dark:text-slate-100">
                "Exceptional standards, clinical accuracy, and deeply supportive professionals."
              </p>
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] uppercase tracking-wider font-bold text-slate-400">
                <span>Patient Trust Network</span>
                <span style={{ color: primaryColor }}>10k+ Strong</span>
              </div>
            </motion.div>

            {/* Abstract Tech Accent Lines */}
            <div className="absolute -top-6 -left-6 w-24 h-24 z-[-1] opacity-25 dark:opacity-40" style={{ backgroundImage: `radial-gradient(${primaryColor} 1.5px, transparent 1.5px)`, backgroundSize: '12px 12px' }}></div>
          </motion.div>

          {/* --- RIGHT SIDE: Copy & Interactive Bento Grid --- */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="flex flex-col justify-center lg:col-span-7 lg:pl-12"
          >
            {/* Header / Meta Segment */}
            <motion.div variants={fadeInScaleUp} className="mb-8">
              <span 
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 shadow-sm"
                style={{ color: primaryColor }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
                Clinical Mission
              </span>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-6">
                Dedicated to Advancing Your <span className="relative inline-block px-1">
                  <span className="relative z-10" style={{ color: primaryColor }}>Health</span>
                  <span className="absolute bottom-1 left-0 w-full h-2 rounded bg-teal-500/10 dark:bg-teal-500/20 -z-0"></span>
                </span> & Lasting Vitality.
              </h2>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {aboutText}
              </p>
            </motion.div>

            {/* Premium Micro-Bento Core Values Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {coreValuesToRender.map((value) => {
                const IconComponent = iconMap[value.icon as string] || AcademicCapIcon;
                
                return (
                  <motion.div 
                    key={value.id} 
                    variants={fadeInScaleUp}
                    whileHover={{ y: -4, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="group relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 hover:border-slate-300/80 dark:hover:border-slate-700 transition-colors shadow-sm hover:shadow-md duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Dynamic Theme Icon Frame */}
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 shadow-sm group-hover:shadow"
                        style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5 group-hover:text-slate-800 dark:group-hover:text-teal-400 transition-colors">
                        {value.title}
                      </h3>
                      
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        {value.description}
                      </p>
                    </div>

                    {/* Clean Corner Aesthetic Deco Line */}
                    <div 
                      className="absolute bottom-0 right-0 w-0 h-[3px] rounded-bl-full rounded-br-full transition-all duration-300 group-hover:w-12"
                      style={{ backgroundColor: primaryColor }}
                    />
                  </motion.div>
                );
              })}
            </div>
            
          </motion.div>

        </div>
      </div>
    </section>
  );
}