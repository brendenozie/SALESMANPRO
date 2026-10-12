"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRightIcon, 
  PlayIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  ChartBarIcon
} from "@heroicons/react/24/solid";
import { useStoreContext } from '@/contexts/StoreContext';
import { useEditor } from '@/contexts/EditorContext';
import { EditableElement } from '@/components/site/EditableElement';
import Image from 'next/image';

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

export default function ProfessionalHero({ storeFormData: propStoreFormData }: { storeFormData?: any }) {
  const contextStore = useStoreContext();
  const storeFormData = propStoreFormData || contextStore?.storeFormData;
  const { isEditorMode } = useEditor();

  const slides = (storeFormData?.heroSlides && storeFormData.heroSlides.length > 0)
    ? storeFormData.heroSlides
    : [
        {
          imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop",
          headline: "Drive Success Through Strategic Learning.",
          subline: "Empowering organizations and professionals with industry-validated curriculum and measurable learning outcomes.",
          ctaText: "Explore Curriculum"
        }
      ];

  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const activeHeroSlide = slides[selectedSlideIndex] || slides[0];
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121';

  return (
    <section className="relative min-h-[85vh] flex items-center bg-white overflow-hidden pt-20">
      {/* Editor mode slide selector toolbar */}
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

      {/* Structural Background Layout */}
      <div className="absolute inset-0 z-0 flex">
        <div className="w-full lg:w-1/2 bg-gray-50" /> {/* Subtle split background */}
        <div className="hidden lg:block w-1/2 relative">
          <EditableElement targetId="courses2.home.hero.imageUrl" fieldType="image" label="Hero Media Background">
            <Image decoding="async"
              src={activeHeroSlide?.imageUrl || "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"}
              alt="Professional Environment"
              fill
              className="object-cover"
              priority
            />
          </EditableElement>
          {/* Professional Overlay */}
          <div className="absolute inset-0 bg-gray-900/10 pointer-events-none" />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Content Column */}
          <motion.div 
            className="lg:col-span-6 py-12"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            {/* Status Badge */}
            <motion.div variants={fadeUp} className="flex items-center gap-2 mb-6">
              <span 
                className="w-2 h-2 rounded-full animate-pulse" 
                style={{ backgroundColor: primaryColor }} 
              />
              <EditableElement targetId="courses2.home.hero.tagline" fieldType="text" label="Hero Tagline">
                <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500">
                  {storeFormData?.tagline || "Professional Excellence"}
                </span>
              </EditableElement>
            </motion.div>

            {/* Corporate Typography */}
            <motion.div variants={fadeUp}>
              <EditableElement targetId="courses2.home.hero.headline" fieldType="text" label="Hero Headline">
                <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-8">
                  {activeHeroSlide?.headline || "Drive Success Through Strategic Learning."}
                </h1>
              </EditableElement>
            </motion.div>

            <motion.div variants={fadeUp}>
              <EditableElement targetId="courses2.home.hero.subline" fieldType="textarea" label="Hero Subline">
                <p 
                  className="text-lg text-gray-600 leading-relaxed max-w-lg mb-10 border-l-2 pl-6"
                  style={{ borderColor: `${primaryColor}40` }}
                >
                  {activeHeroSlide?.subline || "Empowering organizations and professionals with industry-validated curriculum and measurable learning outcomes."}
                </p>
              </EditableElement>
            </motion.div>

            {/* Action Group */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-6">
              <EditableElement targetId="courses2.home.hero.ctaText" fieldType="text" label="CTA Button Text">
                <button
                  type="button"
                  className="group flex items-center gap-3 px-8 py-4 rounded-none font-bold text-sm uppercase tracking-widest text-white transition-all hover:brightness-110 active:scale-95"
                  style={{ backgroundColor: primaryColor }}
                  onClick={() => { if (typeof window !== 'undefined') window.location.href = activeHeroSlide?.ctaLink || '#'; }}
                >
                  <span>{activeHeroSlide?.ctaText || "Explore Curriculum"}</span>
                  <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </EditableElement>

              {activeHeroSlide?.videoLink && (
                <button 
                  type="button"
                  className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-900 hover:text-gray-600 transition-colors"
                  onClick={() => { if (typeof window !== 'undefined') window.open(activeHeroSlide?.videoLink || '', '_blank'); }}
                >
                  <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center">
                    <PlayIcon className="w-3 h-3 text-gray-900" />
                  </div>
                  Overview
                </button>
              )}
            </motion.div>

            {/* Trust Signals */}
            <motion.div 
              variants={fadeUp}
              className="mt-16 grid grid-cols-3 gap-4"
            >
              <div className="space-y-2">
                <CheckBadgeIcon className="w-5 h-5 text-gray-400" />
                <p className="text-[10px] font-black uppercase text-gray-400">Certified</p>
                <p className="text-sm font-bold text-gray-900">Accredited Programs</p>
              </div>
              <div className="space-y-2">
                <ShieldCheckIcon className="w-5 h-5 text-gray-400" />
                <p className="text-[10px] font-black uppercase text-gray-400">Security</p>
                <p className="text-sm font-bold text-gray-900">Safe Enrollment</p>
              </div>
              <div className="space-y-2">
                <ChartBarIcon className="w-5 h-5 text-gray-400" />
                <p className="text-[10px] font-black uppercase text-gray-400">Outcomes</p>
                <p className="text-sm font-bold text-gray-900">Career Growth</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: High-Impact Image Card (Mobile only, or inset for desktop) */}
          <div className="lg:col-span-6 lg:hidden">
            <div className="relative aspect-video rounded-none overflow-hidden shadow-2xl">
              <EditableElement targetId="courses2.home.hero.imageUrl" fieldType="image" label="Hero Media Mobile">
                <Image decoding="async"
                  src={activeHeroSlide?.productImageUrl || activeHeroSlide?.imageUrl || "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"}
                  alt="Product"
                  fill
                  className="object-cover"
                />
              </EditableElement>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}