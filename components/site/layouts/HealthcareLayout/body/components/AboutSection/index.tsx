"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { HeartIcon, ShieldCheckIcon, UsersIcon, AcademicCapIcon, StarIcon } from '@heroicons/react/24/solid';
import { useStoreContext } from "@/contexts/StoreContext";
import { ICoreValue } from "@/types/typings";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => `${src}?w=${width}&q=${quality || 75}`;

// --- Animation Variants ---
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const cardHover = {
    rest: { scale: 1, y: 0 },
    hover: { 
        scale: 1.02, 
        y: -5,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        transition: { type: "spring", stiffness: 300 } 
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

  // Data extraction with fallbacks
  const aboutImageUrl = storeFormData?.bannerUrl || "https://images.unsplash.com/photo-1631815588090-d4bfec5b1b89?q=80&w=1974&auto=format&fit=crop";
  const aboutText = storeFormData?.description || "Our mission is to provide compassionate, high-quality healthcare services to our community. We are dedicated to promoting wellness and restoring health with professionalism and empathy. Our team of skilled medical professionals works collaboratively to ensure every patient receives personalized care.";
  const primaryColor = storeFormData?.themeSettings?.primaryColor || "#0d9488"; // Teal
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || "#0f766e";
  const coreValuesToRender = storeFormData?.CoreValues || fallbackCoreValues;

  return (
    <section id="about" className="relative py-24 lg:py-32 overflow-hidden bg-white dark:bg-gray-950">
      
      {/* Decorative Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gray-100 dark:bg-gray-900 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 opacity-50" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gray-50 dark:bg-gray-900 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4 opacity-50" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* --- LEFT: Image Composition --- */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Main Image */}
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl aspect-[4/5] lg:aspect-[3/4] group">
              <Image
                src={aboutImageUrl}
                alt="Our dedicated healthcare team"
                loader={loader}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Subtle Gradient Overlay on Image */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>

            {/* Floating "Trust" Card */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-8 -right-4 md:-right-12 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 max-w-xs z-20"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="flex -space-x-2">
                        {[1,2,3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white dark:border-gray-800 overflow-hidden">
                                <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                    <div className="flex text-yellow-400">
                        {[1,2,3,4,5].map(i => <StarIcon key={i} className="w-4 h-4" />)}
                    </div>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                    "Exceptional care and support from the entire team."
                </p>
                <p className="text-xs text-gray-500 mt-1 font-semibold">Trusted by 10k+ Patients</p>
            </motion.div>

            {/* Decorative Pattern Dot Grid behind image */}
            <div className="absolute -top-8 -left-8 w-32 h-32 z-[-1] opacity-20" style={{ backgroundImage: `radial-gradient(${primaryColor} 2px, transparent 2px)`, backgroundSize: '16px 16px' }}></div>
          </motion.div>


          {/* --- RIGHT: Text & Values --- */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="flex flex-col justify-center"
          >
            {/* Header */}
            <motion.div variants={fadeInUp}>
                <span 
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-opacity-10 mb-6"
                    style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                    Who We Are
                </span>
                
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-[1.1] mb-6">
                    We are Dedicated to Your <span className="relative whitespace-nowrap">
                        <span className="relative z-10">Health</span>
                        <span className="absolute bottom-2 left-0 w-full h-3 -z-0 opacity-30" style={{ backgroundColor: primaryColor }}></span>
                    </span> & Wellbeing.
                </h2>

                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-10">
                    {aboutText}
                </p>
            </motion.div>

            {/* Core Values Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {coreValuesToRender.map((value) => {
                    const IconComponent = iconMap[value.icon as string] || AcademicCapIcon;
                    
                    return (
                        <motion.div 
                            key={value.id} 
                            variants={fadeInUp}
                            whileHover="hover"
                            initial="rest"
                            animate="rest"
                            className="relative p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 transition-colors duration-300 group"
                        >
                            <motion.div 
                                variants={cardHover}
                                className="h-full flex flex-col"
                            >
                                <div 
                                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300 group-hover:bg-white group-hover:shadow-md"
                                    style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                                >
                                    <IconComponent className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-teal-600 transition-colors">
                                    {value.title}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-snug">
                                    {value.description}
                                </p>
                            </motion.div>
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