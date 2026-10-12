"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRightIcon, CalendarDaysIcon, StarIcon } from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext'; // Pulled from your context design ecosystem
import { EditableElement } from '@/contexts/EditableContentContext';

// Mocking the image loader
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

interface DoctorsSectionProps {
  doctors: Array<{ id: string; name: string; username: string; subtitle: string; imageUrl: string; specializations?: string[] }>;
  storeSlug: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  },
};

export default function DoctorsSection({ doctors, storeSlug }: DoctorsSectionProps) {
  const router = useRouter();
  const { storeFormData } = useStoreContext();

  // Dynamically resolve branding colors to prevent UI fragmentation
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0d9488';

  return (
    <section id="doctors" className="relative py-24 lg:py-36 bg-white dark:bg-slate-950 overflow-hidden">
      
      {/* ARCHITECTURAL AMBIENT LIGHT CHANNELS */}
      <div className="absolute top-0 left-0 -translate-y-24 w-[500px] h-[500px] bg-slate-100/50 dark:bg-slate-900/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 translate-x-24 w-[400px] h-[400px] bg-teal-500/[0.02] dark:bg-teal-500/[0.01] rounded-full blur-[130px] pointer-events-none" />

      {/* CORE IDENTITY MATRIX BACKGROUND */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.25] dark:opacity-[0.1] mix-blend-overlay pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.3) 1px, transparent 0)', 
          backgroundSize: '32px 32px' 
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* --- EXECUTIVE HEADER ARCHITECTURE --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <EditableElement
              targetId="healthcare.home.doctors.badge"
              componentKey="DoctorsSection"
              elementKey="badge"
              label="Doctors Badge"
              defaultValue="World-Class Care"
              inline
            >
              {(val) => (
                <span 
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-widest uppercase mb-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm"
                  style={{ color: primaryColor }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: primaryColor }} />
                  {val || "World-Class Care"}
                </span>
              )}
            </EditableElement>

            <EditableElement
              targetId="healthcare.home.doctors.title"
              componentKey="DoctorsSection"
              elementKey="title"
              label="Doctors Title"
              defaultValue="Meet Our Clinical Specialists"
            >
              {(val) => (
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
                  {val || (
                    <>
                      Meet Our Clinical <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400">Specialists</span>
                    </>
                  )}
                </h2>
              )}
            </EditableElement>

            <EditableElement
              targetId="healthcare.home.doctors.description"
              componentKey="DoctorsSection"
              elementKey="description"
              label="Doctors Description"
              defaultValue="Highly certified experts utilizing progressive modalities to drive exceptional, personalized diagnostics."
            >
              {(val) => (
                <p className="mt-4 text-base sm:text-lg font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                  {val || "Highly certified experts utilizing progressive modalities to drive exceptional, personalized diagnostics."}
                </p>
              )}
            </EditableElement>
          </div>

          {/* Desktop Glass Action Pivot */}
          <button
            onClick={() => router.push(`/${storeSlug}/doctors`)}
            className="hidden md:inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-950 font-bold text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 shadow-[0_4px_20px_rgba(15,23,42,0.01)] hover:shadow-lg transition-all duration-300"
          >
            <EditableElement
              targetId="healthcare.home.doctors.viewAllText"
              componentKey="DoctorsSection"
              elementKey="viewAllText"
              label="View All Doctors Text"
              defaultValue="View All Doctors"
              inline
            >
              {(val) => <span>{val || "View All Doctors"}</span>}
            </EditableElement>
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>

        {/* --- PREMIUM SPECIALISTS MATRIX GRID --- */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
        >
          {doctors.map((doc, idx) => (
            <motion.div
              key={doc.id}
              variants={cardVariants}
              whileHover={{ y: -6 }}
              className="group relative h-[450px] rounded-[2.5rem] overflow-hidden cursor-pointer bg-slate-50 dark:bg-slate-900 shadow-[0_4px_25px_rgba(15,23,42,0.01)] border border-slate-200/60 dark:border-slate-800/60 hover:shadow-[0_24px_48px_rgba(15,23,42,0.06)] dark:hover:shadow-[0_24px_48px_rgba(0,0,0,0.3)] transition-all duration-500"
              onClick={() => router.push(`/${storeSlug}/doctor/${doc.id}`)}
            >
              {/* Image Architecture Layer */}
              <div className="absolute inset-0 w-full h-full">
                <EditableElement
                  targetId={`healthcare.home.doctors.doctor${idx}.imageUrl`}
                  componentKey="DoctorsSection"
                  elementKey={`doctor${idx}_imageUrl`}
                  label={`Doctor ${idx + 1} Image`}
                  type="image"
                  defaultValue={doc.imageUrl || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop"}
                  className="w-full h-full"
                >
                  {(val) => (
                    <Image decoding="async"
                      src={val || doc.imageUrl || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop"}
                      alt={`Dr. ${doc.name}`}
                      fill
                      className="object-cover object-center grayscale-[15%] group-hover:grayscale-0 transform transition-transform duration-700 ease-[0.16, 1, 0.3, 1] group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  )}
                </EditableElement>
                
                {/* Hyper-tuned Multi-stop Linear Mask */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none" />
              </div>

              {/* Status Indicator (Organic Glass Badge) */}
              <div className="absolute top-5 right-5 flex items-center gap-1.5 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border border-white/20 dark:border-slate-800/40 px-3 py-1.5 rounded-xl z-10 shadow-sm">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-900 dark:text-slate-100">On Duty</span>
              </div>

              {/* Textual & Interactive Control Layer */}
              <div className="absolute inset-0 p-6 lg:p-8 flex flex-col justify-end z-20">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-[0.16, 1, 0.3, 1]">
                  
                  {/* Specialty Tagline */}
                  <EditableElement
                    targetId={`healthcare.home.doctors.doctor${idx}.specialization`}
                    componentKey="DoctorsSection"
                    elementKey={`doctor${idx}_specialization`}
                    label={`Doctor ${idx + 1} Specialization`}
                    defaultValue={doc.specializations?.[0] || "Specialist"}
                    inline
                  >
                    {(val) => (
                      <span 
                        className="inline-block text-[11px] font-black uppercase tracking-widest mb-1.5"
                        style={{ color: primaryColor }}
                      >
                        {val || doc.specializations?.[0] || "Specialist"}
                      </span>
                    )}
                  </EditableElement>
                  
                  {/* Structured Name Typography */}
                  <EditableElement
                    targetId={`healthcare.home.doctors.doctor${idx}.name`}
                    componentKey="DoctorsSection"
                    elementKey={`doctor${idx}_name`}
                    label={`Doctor ${idx + 1} Name`}
                    defaultValue={doc.name}
                  >
                    {(val) => {
                      const fullName = typeof val === 'string' ? val : doc.name;
                      const nameParts = fullName.split(' ');
                      return (
                        <h3 className="text-2xl font-black text-white leading-tight mb-2">
                          Dr. {nameParts[0]} 
                          <span className="block text-base font-medium text-slate-300 mt-0.5">{nameParts.slice(1).join(' ')}</span>
                        </h3>
                      );
                    }}
                  </EditableElement>
                  
                  {/* Pure Clean Metrics row */}
                  <div className="flex items-center gap-1.5 opacity-90 mb-4">
                    <StarIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs text-slate-300 font-bold">4.9</span>
                    <span className="text-xs text-slate-400 font-medium">(140+ Appts)</span>
                  </div>

                  {/* Progressive Micro-Interactions: Action Shutter Trigger */}
                  <div className="h-0 overflow-hidden group-hover:h-[52px] group-hover:mt-2 transition-all duration-500 ease-[0.16, 1, 0.3, 1] opacity-0 group-hover:opacity-100">
                    <button 
                      className="w-full py-3.5 font-bold rounded-2xl flex items-center justify-center gap-2 text-white shadow-md active:scale-[0.98] transition-all"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <CalendarDaysIcon className="w-4 h-4" />
                      <EditableElement
                        targetId={`healthcare.home.doctors.doctor${idx}.ctaText`}
                        componentKey="DoctorsSection"
                        elementKey={`doctor${idx}_ctaText`}
                        label={`Doctor ${idx + 1} CTA`}
                        defaultValue="Secure Booking"
                        inline
                      >
                        {(val) => <span className="text-sm">{val || "Secure Booking"}</span>}
                      </EditableElement>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile Alternate Action Base */}
        <div className="mt-14 text-center md:hidden">
          <button 
            onClick={() => router.push(`/${storeSlug}/doctors`)}
            className="w-full inline-flex items-center justify-center py-4 rounded-2xl font-bold text-white shadow-lg transition-transform active:scale-[0.98]" 
            style={{ backgroundColor: primaryColor }}
          >
            <span>View All Doctors</span>
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </section>
  );
}