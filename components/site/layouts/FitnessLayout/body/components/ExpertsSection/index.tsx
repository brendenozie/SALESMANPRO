"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  AcademicCapIcon,
  ArrowRightIcon,
  StarIcon,
} from "@heroicons/react/24/solid";
import { useStoreContext } from "@/contexts/StoreContext";

const loader = ({ src }: { src: string }) => src;

// Framer Motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

type Props = {
  educators?: any[];
};

export default function EducatorsSection({ educators = [] }: Props) {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || "#f97316";

  // Demo fallback to ensure the section looks stunning during design phase
  const data = educators.length > 0 ? educators : [
    { id: '1', name: 'Dominic Vane', specialty: 'Elite Performance', bio: 'Former Olympic conditioning coach specializing in high-threshold metabolic training.', certifications: [1,2,3,4] },
    { id: '2', name: 'Sarah Dracos', specialty: 'Mobility & Flow', bio: 'Expert in functional biomechanics and neurological movement patterns.', certifications: [1,2] },
    { id: '3', name: 'Marcus Thorne', specialty: 'Strength Systems', bio: 'Master of progressive overload and tactical strength periodization.', certifications: [1,2,3] },
  ];

  return (
    <section id="trainers" className="py-24 sm:py-32 bg-neutral-50 dark:bg-neutral-950 transition-colors duration-500 relative overflow-hidden">
      {/* Subtle Structural Noise Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-15 pointer-events-none mix-blend-overlay" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="space-y-3">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="font-black tracking-[0.3em] uppercase text-xs"
              style={{ color: primaryColor }}
            >
              The Faculty
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-5xl sm:text-6xl lg:text-8xl font-black text-neutral-900 dark:text-white italic tracking-tighter uppercase leading-[0.85]"
            >
              Master <br /> <span className="text-neutral-300 dark:text-neutral-800 transition-colors">Architects</span>
            </motion.h2>
          </div>
          <p className="max-w-xs text-neutral-500 dark:text-neutral-400 font-medium text-sm leading-relaxed uppercase transition-colors">
            Learn from the architects of human potential. Our trainers are world-renowned domain specialists.
          </p>
        </div>

        {/* Educators Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
        >
          {data.map((edu, index) => (
            <motion.div
              key={edu.id}
              variants={itemVariants}
              className="group relative flex flex-col justify-between h-full bg-white dark:bg-neutral-900/20 border border-neutral-200/60 dark:border-neutral-900/60 rounded-[2.5rem] p-4 hover:shadow-xl transition-all duration-500"
            >
              <div>
                {/* Image Wrap Card */}
                <div className="relative h-[420px] sm:h-[480px] w-full rounded-[2rem] overflow-hidden bg-neutral-200 dark:bg-neutral-900 mb-6 border border-neutral-100 dark:border-neutral-800/50 shadow-inner">
                  <Image
                    src={edu.photoUrl || edu.profilePicture || `https://images.unsplash.com/photo-${index === 0 ? '1567013127542-490d757e51fc' : index === 1 ? '1548690312-e3b507d17a4d' : '1534438327276-14e5300c3a48'}?q=80&w=2000&auto=format&fit=crop`}
                    alt={edu.user?.name || edu.name}
                    fill
                    className="object-cover scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                    loader={loader}
                  />
                  
                  {/* Adaptive Cinematic Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent opacity-80 dark:opacity-75" />
                  
                  {/* Floating Performance Tag */}
                  <div className="absolute top-5 left-5">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-950/70 backdrop-blur-md border border-white/10 rounded-full shadow-sm">
                      <StarIcon className="w-3 h-3" style={{ color: primaryColor }} />
                      <span className="text-[9px] font-black text-white uppercase tracking-[0.15em]">Top Tier</span>
                    </div>
                  </div>

                  {/* Clean Visual Call-To-Action Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-95 group-hover:scale-100 z-10 pointer-events-none">
                    <button 
                      className="px-8 py-4 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl transform transition-transform active:scale-95"
                      style={{ backgroundColor: primaryColor }}
                    >
                      View Profile
                    </button>
                  </div>
                </div>

                {/* Typography Block */}
                <div className="px-3 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1.5 transition-colors">
                        {edu.user?.name || edu.name}
                      </h3>
                      <p className="text-[11px] font-black uppercase tracking-[0.25em]" style={{ color: primaryColor }}>
                        {edu.specialty}
                      </p>
                    </div>
                    {edu.certifications?.length > 0 && (
                      <div className="flex items-center gap-1 text-neutral-400 dark:text-neutral-600 shrink-0 transition-colors">
                        <AcademicCapIcon className="h-5 w-5 opacity-80" />
                        <span className="text-xs font-bold tracking-tighter">x{edu.certifications.length}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium leading-relaxed line-clamp-2 italic transition-colors">
                    &ldquo;{edu.bio}&rdquo;
                  </p>
                </div>
              </div>

              {/* Functional Card Link Button */}
              <div className="px-3 pt-5 pb-2">
                <button 
                  className="flex items-center gap-2.5 font-bold uppercase tracking-wider text-[11px] transition-all duration-300 group-hover:opacity-80 text-neutral-800 dark:text-neutral-200"
                >
                  <span>Contact Specialist</span> 
                  <ArrowRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" style={{ color: primaryColor }} />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Dynamic Footer Link Block */}
        <motion.div
          className="mt-24 pt-12 border-t border-neutral-200/60 dark:border-neutral-900/60 flex flex-col items-center gap-6 text-center transition-colors"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-neutral-400 dark:text-neutral-500 text-[10px] sm:text-xs font-bold uppercase tracking-[0.4em] transition-colors">
            Join the high performance faculty
          </p>
          <a
            href="/join-our-team"
            className="group flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-neutral-900 dark:text-white transition-colors"
          >
            <span className="text-2xl sm:text-4xl font-black uppercase italic tracking-tighter group-hover:opacity-70 transition-opacity">
              Apply for Residency
            </span>
            <div 
              className="w-12 h-12 rounded-full border border-neutral-300 dark:border-neutral-800 flex items-center justify-center transition-all group-hover:scale-105"
              style={{ ['--hover-border' as any]: primaryColor }}
            >
              <ArrowRightIcon className="w-4 h-4 text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white" />
            </div>
          </a>
        </motion.div>
      </div>
    </section>
  );
}