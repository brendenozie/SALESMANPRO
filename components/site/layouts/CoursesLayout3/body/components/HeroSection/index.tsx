"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  AcademicCapIcon, 
  StarIcon, 
  CheckBadgeIcon, 
  ArrowRightIcon, 
  PlayIcon, 
  GlobeAltIcon 
} from '@heroicons/react/24/solid'; 
import Image from 'next/image';
import { useStoreContext } from '@/contexts/StoreContext';
import { useEditor } from '@/contexts/EditorContext';
import { EditableElement } from '@/components/site/EditableElement';

// --- Animations: Faster, Bright Reveal ---
const fadeUpReveal = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.5, 
      ease: [0.33, 1, 0.68, 1] 
    } 
  }
};

const maskReveal = {
  hidden: { scaleY: 1, originY: 0 },
  visible: { 
    scaleY: 0, 
    transition: { 
      duration: 0.8, 
      ease: [0.19, 1, 0.22, 1],
      delay: 0.1 
    } 
  }
};

export default function BrightProfessionalHero({ storeFormData: propStoreFormData }: { storeFormData?: any }) {
  const contextStore = useStoreContext();
  const storeFormData = propStoreFormData || contextStore?.storeFormData;
  const { isEditorMode } = useEditor();

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#1e40af';
  const secondaryAccent = '#14b8a6'; 

  const slides = (storeFormData?.heroSlides && storeFormData.heroSlides.length > 0)
    ? storeFormData.heroSlides
    : [
        {
          headline: "Building Foundations for a Lifetime of Excellence.",
          subline: "A nurturing environment where curiosity meets world-class curriculum. We prepare your child for the global stage with values-based primary education.",
          imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80",
          ctaText: "Initiate Enrollment"
        }
      ];

  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const activeSlide = slides[selectedSlideIndex] || slides[0];

  const headline = activeSlide?.headline || "Building Foundations for a Lifetime of Excellence.";
  const subline = activeSlide?.subline || "A nurturing environment where curiosity meets world-class curriculum. We prepare your child for the global stage with values-based primary education.";

  return (
    <div className="relative bg-white font-sans overflow-hidden">
      {/* Editor mode toolbar */}
      {isEditorMode && slides.length > 1 && (
        <div className="absolute top-4 left-6 z-50 flex items-center gap-2 bg-black/80 text-white px-3 py-1.5 rounded-full text-xs shadow-lg backdrop-blur-md">
          <span className="font-semibold text-gray-300">Edit Slide:</span>
          {slides.map((_: any, idx: number) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedSlideIndex(idx)}
              className={`px-2 py-0.5 rounded text-xs transition-colors ${
                selectedSlideIndex === idx
                  ? 'bg-white text-black font-bold shadow'
                  : 'bg-white/20 text-white hover:bg-white/40'
              }`}
            >
              Slide #{idx + 1}
            </button>
          ))}
        </div>
      )}

      <section className="relative pt-8 pb-24 lg:pt-8 lg:pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* --- LEFT: CONTENT (Takes up 7 columns on desktop) --- */}
            <div className="lg:col-span-7">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              >
                <motion.div variants={fadeUpReveal} className="inline-flex items-center gap-3 mb-8 border-l-2 pl-4" style={{ borderColor: `${primaryColor}40` }}>
                  <EditableElement targetId="courses3.home.hero.cycleBadge" fieldType="text" label="Hero Status Badge">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
                      Admission Cycle Active
                    </span>
                  </EditableElement>
                </motion.div>

                <motion.div variants={fadeUpReveal}>
                  <EditableElement targetId="courses3.home.hero.headline" fieldType="text" label="Hero Headline">
                    <h1 className="text-5xl md:text-7xl xl:text-8xl font-serif font-bold text-gray-900 leading-[1.0] mb-8 tracking-tighter">
                      {headline}
                    </h1>
                  </EditableElement>
                </motion.div>

                <motion.div variants={fadeUpReveal}>
                  <EditableElement targetId="courses3.home.hero.subline" fieldType="textarea" label="Hero Subline">
                    <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-10 max-w-xl font-medium">
                      {subline}
                    </p>
                  </EditableElement>
                </motion.div>

                <motion.div variants={fadeUpReveal} className="flex flex-wrap gap-5 mb-16">
                  <EditableElement targetId="courses3.home.hero.ctaText" fieldType="text" label="Hero CTA Button">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      className="px-10 py-5 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl transition-all"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {activeSlide?.ctaText || "Initiate Enrollment"}
                    </motion.button>
                  </EditableElement>
                  
                  <button type="button" className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 group">
                    <div className="w-12 h-12 border border-gray-200 bg-white flex items-center justify-center transition-all group-hover:border-gray-900">
                      <PlayIcon className="w-4 h-4" />
                    </div>
                    Experience Campus
                  </button>
                </motion.div>

                {/* Technical Metric Grid */}
                <motion.div variants={fadeUpReveal} className="grid grid-cols-3 gap-6 pt-10 border-t border-gray-100">
                  {[
                    { val: "12:1", label: "Student Ratio" },
                    { val: "IB/STEM", label: "Curriculum" },
                    { val: "100%", label: "Security Rate" }
                  ].map((stat, i) => (
                    <div key={i} className="bg-gray-50/50 border border-gray-100 p-5">
                      <p className="text-2xl font-black tracking-tighter" style={{ color: primaryColor }}>{stat.val}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            </div>

            {/* --- RIGHT: IMAGE (Takes up 5 columns on desktop) --- */}
            <div className="lg:col-span-5 relative">
              <motion.div 
                className="relative z-10"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {/* Main Image Frame */}
                <div className="relative bg-white p-3 shadow-[20px_20px_60px_-15px_rgba(0,0,0,0.07)] border border-gray-100">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <EditableElement targetId="courses3.home.hero.imageUrl" fieldType="image" label="Hero Main Image">
                      <Image decoding="async"
                        src={activeSlide?.imageUrl || "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80"}
                        alt="Student Excellence"
                        fill
                        className="object-cover"
                        priority
                      />
                    </EditableElement>
                    
                    {/* Instant Brightening Mask */}
                    <motion.div 
                      variants={maskReveal}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      className="absolute inset-0 bg-white z-10 pointer-events-none"
                    />

                    {/* Integrated Detail Card */}
                    <div className="absolute bottom-4 left-4 right-4 p-5 bg-white/95 backdrop-blur-sm border border-gray-100 shadow-lg z-20">
                      <div className="flex items-center gap-3 mb-2">
                        <AcademicCapIcon className="w-4 h-4" style={{ color: secondaryAccent }} />
                        <EditableElement targetId="courses3.home.hero.pedagogyTitle" fieldType="text" label="Pedagogy Badge">
                          <span className="text-[9px] font-black uppercase tracking-widest text-gray-900">Verified Pedagogy</span>
                        </EditableElement>
                      </div>
                      <EditableElement targetId="courses3.home.hero.pedagogyText" fieldType="textarea" label="Pedagogy Description">
                        <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                          Recognized globally for excellence in child development and primary education.
                        </p>
                      </EditableElement>
                    </div>
                  </div>
                </div>

                {/* Institutional Vertical Text */}
                <div className="absolute -right-12 top-1/2 -rotate-90 origin-right hidden xl:block">
                  <span className="text-[10px] font-black text-gray-200 uppercase tracking-[0.8em] whitespace-nowrap">
                    Institutional Excellence • Est. 2026
                  </span>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}