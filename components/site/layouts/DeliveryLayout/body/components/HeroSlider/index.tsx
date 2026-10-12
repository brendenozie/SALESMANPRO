'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { ArrowRightIcon, ArrowLeftIcon, ArchiveBoxIcon, PlayIcon,  } from "@heroicons/react/24/outline";
import Image from 'next/image';
import { HeroSlide } from '@/types/typings';
import { useEditableContent, EditableElement } from '@/contexts/EditableContentContext';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const autoAdvanceDelay = 6000;

const defaultDeliverySlides: HeroSlide[] = [
  {
    badgeText: 'Logistics & Transportation',
    headline: 'Fast & Reliable\nDelivery Services',
    subline: 'Global supply chain solutions tailored for modern commerce and express logistics.',
    ctaText: 'Dispatch Order',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200',
  },
  {
    badgeText: 'Express Air & Freight',
    headline: 'Next-Day Delivery\nAcross Continents',
    subline: 'Precision-timed transport operations with end-to-end tracking and dedicated fleet support.',
    ctaText: 'Track Shipment',
    imageUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=1200',
  },
];

export interface HeroSliderProps {
  heroSlides: HeroSlide[] | null;
  themeSettings: any;
}

export default function HeroSlider({ heroSlides, themeSettings }: HeroSliderProps) {
  const { isEditorMode } = useEditableContent();

  // 1. Data Handling & Fallbacks
  const slides = useMemo(() => {
    if (heroSlides && heroSlides.length > 0) return heroSlides;
    if (isEditorMode) return defaultDeliverySlides;
    return [];
  }, [heroSlides, isEditorMode]);

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const primary = themeSettings?.primaryColor || '#f7941d';

  // 2. Navigation Logic
  const resetTimer = useCallback(() => {
    clearTimeout(timeoutRef.current);
    if (isEditorMode) return;
    if (slides.length > 1) {
      timeoutRef.current = setTimeout(() => {
        setDirection(1);
        setCurrent((prev) => (prev + 1) % slides.length);
      }, autoAdvanceDelay);
    }
  }, [slides.length, isEditorMode]);

  useEffect(() => {
    resetTimer();
    return () => clearTimeout(timeoutRef.current);
  }, [current, resetTimer]);


  const goTo = (idx: number, dir = 0) => {
    if (slides.length <= 1) return;
    clearTimeout(timeoutRef.current);
    setDirection(dir);
    setCurrent(idx);
  };

  const prevSlide = () => goTo((current - 1 + slides.length) % slides.length, -1);
  const nextSlide = () => goTo((current + 1) % slides.length, 1);

  // 3. Animation Variants
  const fadeUp = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
  };

  if (slides.length === 0) return null;

  const currentSlide = slides[current];

  return (
    <section id="home" className="relative min-h-[90vh] md:min-h-screen w-full flex items-center overflow-hidden bg-[#111]">
      {/* Slide Switcher Toolbar in Builder Mode */}
      {isEditorMode && slides.length > 1 && (
        <div className="absolute top-20 right-6 z-50 flex items-center gap-2 bg-black/85 backdrop-blur-md px-3 py-2 rounded-lg border border-amber-500/50 text-white text-xs">
          <span className="text-amber-400 font-bold uppercase tracking-wider mr-1">Edit Slide:</span>
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goTo(idx)}
              className={`px-2.5 py-1 rounded font-bold transition-all ${
                current === idx
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              #{idx + 1}
            </button>
          ))}
        </div>
      )}

      {/* BACKGROUND IMAGE WITH SLIDE ANIMATION */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={`bg-${current}`}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1.05 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-black/50 z-10 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent z-10 pointer-events-none" />
          <EditableElement
            targetId={`home.hero.slides.${current}.imageUrl`}
            field="imageUrl"
            label={`Slide #${current + 1} Background Image`}
            type="image"
            defaultContent={currentSlide.imageUrl || '/fallback-logistics.jpg'}
            className="w-full h-full block"
          >
            <Image decoding="async"
              src={currentSlide.imageUrl || '/fallback-logistics.jpg'}
              alt="Logistics Background"
              fill
              priority
              className="object-cover object-right lg:object-center"
            />
          </EditableElement>
        </motion.div>
      </AnimatePresence>

      <div className="container mx-auto px-6 lg:px-12 relative z-20">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div 
            key={`content-${current}`}
            className="max-w-5xl space-y-6 md:space-y-8"
          >
            {/* SUBHEADER / BADGE */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 text-white"
            >
              <div className="p-2 bg-[#f7941d] rounded-sm">
                <ArchiveBoxIcon className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-[#f7941d]">
                <EditableElement
                  targetId={`home.hero.slides.${current}.badgeText`}
                  field="badgeText"
                  label={`Slide #${current + 1} Badge`}
                  type="text"
                  defaultContent={currentSlide.badgeText || "Logistics & Transportation"}
                >
                  {currentSlide.badgeText || "Logistics & Transportation"}
                </EditableElement>
              </span>
            </motion.div>

            {/* MAIN HEADING - Dynamic with Highlight logic */}
            <motion.h1 
              variants={fadeUp}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-[12vw] md:text-[7rem] lg:text-[9rem] font-black text-white leading-[0.85] tracking-tighter uppercase"
            >
              <EditableElement
                targetId={`home.hero.slides.${current}.headline`}
                field="headline"
                label={`Slide #${current + 1} Headline`}
                type="text"
                defaultContent={currentSlide.headline}
              >
                {currentSlide.headline?.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line.includes('$') ? (
                      <>
                        <span className="text-transparent stroke-white" style={{ WebkitTextStroke: '1.5px white' }}>
                          {line.split('$')[1]}
                        </span>
                      </>
                    ) : (
                      line
                    )}
                    <br />
                  </React.Fragment>
                ))}
              </EditableElement>
            </motion.h1>

            {/* DESCRIPTION */}
            <motion.p 
              variants={fadeUp}
              initial="initial"
              animate="animate"
              className="text-gray-200 text-base md:text-xl max-w-xl leading-relaxed font-light border-l-2 border-[#f7941d] pl-6"
            >
              <EditableElement
                targetId={`home.hero.slides.${current}.subline`}
                field="subline"
                label={`Slide #${current + 1} Subline`}
                type="text"
                defaultContent={currentSlide.subline}
              >
                {currentSlide.subline}
              </EditableElement>
            </motion.p>

            {/* ACTIONS */}
            <motion.div 
              variants={fadeUp}
              initial="initial"
              animate="animate"
              className="flex flex-col sm:flex-row items-start sm:items-center gap-6 md:gap-10 pt-4"
            >
              <button
                onClick={() => document.getElementById("contact us")?.scrollIntoView({ behavior: "smooth" })}
                className="relative group overflow-hidden h-16 px-10 bg-[#f7941d] text-white font-black text-sm uppercase transition-all transform hover:scale-105 skew-x-[-12deg]"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                <span className="skew-x-[12deg] flex items-center gap-3">
                  <EditableElement
                    targetId={`home.hero.slides.${current}.ctaText`}
                    field="ctaText"
                    label={`Slide #${current + 1} Button`}
                    type="text"
                    defaultContent={currentSlide.ctaText}
                  >
                    <span>{currentSlide.ctaText}</span>
                  </EditableElement>
                  <ArrowRightIcon className="h-4 w-4" />
                </span>
              </button>
              
              {currentSlide.videoLink && (
                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="h-16 w-16 rounded-full border border-white/30 flex items-center justify-center text-white relative">
                    <PlayIcon className="h-6 w-6 fill-white ml-1" />
                    <div className="absolute inset-0 rounded-full border border-white/50 animate-ping opacity-20" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-xs uppercase tracking-widest">Watch</span>
                    <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Showcase</span>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>


      {/* NAVIGATION CONTROLS */}
      {slides.length > 1 && (
        <div className="absolute bottom-10 right-10 md:right-20 flex flex-col md:flex-row items-end md:items-center gap-8 z-30">
          <div className="flex items-center gap-4 text-white font-black text-2xl tracking-tighter">
            <span className="text-[#f7941d]">0{current + 1}</span>
            <div className="w-12 h-[1px] bg-white/30" />
            <span className="text-white/40 text-sm italic">0{slides.length}</span>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={prevSlide}
              className="h-14 w-14 border border-white/20 text-white flex items-center justify-center hover:bg-[#f7941d] transition-all rounded-sm"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <button 
              onClick={nextSlide}
              className="h-14 w-14 bg-[#f7941d] text-white flex items-center justify-center hover:bg-white hover:text-black transition-all rounded-sm"
            >
              <ArrowRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* VERTICAL DECORATION */}
      <div className="absolute left-6 bottom-12 hidden lg:flex flex-col gap-6 text-white/50 z-30">
        <span className="vertical-text tracking-widest text-[10px] font-bold uppercase mb-4">Imevo Logistics</span>
        <div className="w-[1px] h-12 bg-white/20 mx-auto" />
      </div>

      <style jsx>{`
        .vertical-text {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
        }
      `}</style>
    </section>
  );
}