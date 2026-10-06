'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { HeroSlide } from '@/types/typings';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  PauseIcon, 
  PlayIcon 
} from '@heroicons/react/24/solid';

import Image from 'next/image';
import Link from 'next/link';
import { useEditableContent, EditableElement } from '@/contexts/EditableContentContext';

const defaultSlides: HeroSlide[] = [
  {
    id: '1', companyId: '', type: null, order: 0, iconKey: null,
    videoLink: null, price: null, endsAt: null, productImageUrl: null,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    headline: 'STEP INTO NEXT-LEVEL COMFORT',
    subline: 'SNEAKERS',
    badgeText: 'Ergonomic. Lightweight. Built for daily motion.',
    ctaText: 'Discover Collection', ctaLink: '#collection',
    backgroundColor: '#FFF1F2', textColor: '#111827',
    stats: null
  },
  {
    id: '2', companyId: '', type: null, order: 0, iconKey: null,
    videoLink: null, price: null, endsAt: null, productImageUrl: null,
    imageUrl: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=600&q=80',
    headline: 'UNLEASH YOUR PERSONAL BEST',
    subline: 'PERFORMANCE',
    badgeText: 'Engineered for speed and explosive endurance.',
    ctaText: 'Shop Performance', ctaLink: '#performance',
    backgroundColor: '#F0F9FF', textColor: '#111827',
    stats: null
  },
  {
    id: '3', companyId: '', type: null, order: 0, iconKey: null,
    videoLink: null, price: null, endsAt: null, productImageUrl: null,
    imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80',
    headline: 'STYLE THAT KEEPS PACE DAILY',
    subline: 'LIFESTYLE',
    badgeText: 'Classic design silhouettes meets modern sustainability.',
    ctaText: 'View Lifestyle', ctaLink: '#lifestyle',
    backgroundColor: '#F0FDF4', textColor: '#111827',
    stats: null
  }
];

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? '100%' : '-100%' }),
  center: { opacity: 1, x: 0, transition: { x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.3 } } },
  exit: (dir: number) => ({ opacity: 0, x: dir < 0 ? '100%' : '-100%', transition: { opacity: { duration: 0.25 } } })
};

export default function HeroSlider({ heroSlides }: { heroSlides?: HeroSlide[] }) {
  const { buildUrl } = useEditableContent();
  const slides = (heroSlides?.length ? heroSlides : defaultSlides).map((s, i) => ({
    ...s,
    imageUrl: s.productImageUrl || s.imageUrl || defaultSlides[i % defaultSlides.length].imageUrl,
  })) as HeroSlide[];

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isPausedByUser, setIsPausedByUser] = useState(false);
  
  const isAutoplayActive = !isHovering && !isPausedByUser;
  const timeoutRef = useRef<number | null>(null);
  const autoDelay = 6000;

  const goToSlide = useCallback((index: number, newDirection: number) => {
    setDirection(newDirection);
    setCurrent(index);
  }, []);

  const nextSlide = useCallback(() => {
    goToSlide((current + 1) % slides.length, 1);
  }, [current, slides.length, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((current - 1 + slides.length) % slides.length, -1);
  }, [current, slides.length, goToSlide]);

  useEffect(() => {
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    if (isAutoplayActive) {
      timeoutRef.current = window.setTimeout(nextSlide, autoDelay);
    }
    return () => { if (timeoutRef.current !== null) clearTimeout(timeoutRef.current); };
  }, [current, isAutoplayActive, nextSlide]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const swipeThreshold = 40;
    if (info.offset.x < -swipeThreshold) nextSlide();
    else if (info.offset.x > swipeThreshold) prevSlide();
  };

  return (
    <section
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="relative w-full px-0 sm:px-6 lg:px-8 py-0 sm:py-6 bg-slate-50 dark:bg-zinc-950 transition-colors duration-300"
    >
      {/* FIX: Restored explicit heights so absolute children don't collapse. 
        Mobile is h-[650px] to easily fit navbar overflow + text + image.
      */}
      <div className="max-w-7xl mx-auto relative h-[650px] sm:h-[500px] lg:h-[580px] overflow-hidden sm:rounded-[2.5rem]">
        
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{ 
              backgroundColor: slides[current].backgroundColor, 
              color: slides[current].textColor 
            }}
            className="absolute inset-0 px-6 py-12 sm:p-12 lg:p-16 flex flex-col justify-center lg:grid lg:grid-cols-12 lg:items-center gap-8 cursor-grab active:cursor-grabbing select-none overflow-hidden"
          >
            {/* DYNAMIC WATERMARK GRAPHIC LAYER */}
            <div className="absolute inset-0 flex items-center justify-center text-[22vw] font-black opacity-[0.03] dark:opacity-[0.05] uppercase select-none pointer-events-none tracking-tighter italic">
              {slides[current].subline}
            </div>

            {/* TYPOGRAPHY DESCRIPTION MATRIX (Order 1) */}
            <div className="w-full lg:col-span-6 flex flex-col justify-center items-center lg:items-start text-center lg:text-left order-1 z-10 space-y-4 lg:space-y-6 pt-10 sm:pt-0">
              <div>
                <EditableElement
                  targetId={`home.hero-slider.slides.${current}.subline`}
                  componentKey="HeroSlider"
                  elementKey="subline"
                  label="Eyebrow / Subline"
                  defaultValue={slides[current].subline}
                  inline
                >
                  {(val) => (
                    <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-black/5 dark:bg-white/10 text-red-600 dark:text-red-500 mb-2 sm:mb-3">
                      {val}
                    </span>
                  )}
                </EditableElement>

                <EditableElement
                  targetId={`home.hero-slider.slides.${current}.headline`}
                  componentKey="HeroSlider"
                  elementKey="headline"
                  label="Headline"
                  defaultValue={slides[current].headline}
                >
                  {(val) => (
                    <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black leading-[1.1] tracking-tight italic uppercase max-w-xl">
                      {val}
                    </h2>
                  )}
                </EditableElement>
              </div>
              
              <EditableElement
                targetId={`home.hero-slider.slides.${current}.badgeText`}
                componentKey="HeroSlider"
                elementKey="badgeText"
                label="Slide Subtitle / Badge"
                type="textarea"
                defaultValue={slides[current].badgeText}
              >
                {(val) => (
                  <p className="text-xs sm:text-sm lg:text-base opacity-75 font-medium max-w-sm sm:max-w-md">
                    {val}
                  </p>
                )}
              </EditableElement>

              <div className="pt-2 w-full sm:w-auto">
                <Link
                  href={
                    slides[current].ctaLink?.startsWith("#") || slides[current].ctaLink?.startsWith("http")
                      ? (slides[current].ctaLink || "#")
                      : buildUrl(slides[current].ctaLink || "/products")
                  }
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black text-xs uppercase tracking-widest rounded-xl sm:rounded-full shadow-lg shadow-black/10 hover:bg-zinc-800 dark:hover:bg-zinc-100 active:scale-95 transition-all duration-200"
                >
                  <EditableElement
                    targetId={`home.hero-slider.slides.${current}.ctaText`}
                    componentKey="HeroSlider"
                    elementKey="ctaText"
                    label="CTA Button Text"
                    defaultValue={slides[current].ctaText}
                    inline
                  >
                    {(val) => <span>{val}</span>}
                  </EditableElement>
                  <ChevronRightIcon className="h-4 w-4 stroke-[2.5]" />
                </Link>
              </div>
            </div>

            {/* MAIN SHOE VISUAL PLATFORM (Order 2) */}
            {/* FIX: Ensure flex-1 min-h gives the image block guaranteed space */}
            <div className="w-full lg:col-span-6 flex items-center justify-center relative order-2 flex-1 min-h-[220px] sm:min-h-0 sm:h-56 lg:h-full group pb-10 sm:pb-0">
              <motion.div 
                initial={{ opacity: 0, scale: 0.85, rotate: -8 }}
                animate={{ opacity: 1, scale: 1, rotate: -4 }}
                transition={{ duration: 0.6, type: "spring" }}
                className="relative w-full h-full max-w-[280px] sm:max-w-[360px] lg:max-w-[500px]"
              >
                <EditableElement
                  targetId={`home.hero-slider.slides.${current}.imageUrl`}
                  componentKey="HeroSlider"
                  elementKey="imageUrl"
                  label="Slide Image URL"
                  type="image"
                  defaultValue={slides[current].imageUrl || ""}
                  className="w-full h-full"
                >
                  {(val) => (
                    <Image
                      src={val || slides[current].imageUrl || ""}
                      alt={slides[current].headline || ""}
                      fill
                      priority
                      className="object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.18)] select-none pointer-events-none transform transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-2"
                      sizes="(max-width: 768px) 80vw, 40vw"
                    />
                  )}
                </EditableElement>
              </motion.div>
            </div>

          </motion.div>
        </AnimatePresence>

        {/* FLOATING CONTROL HUD MATRIX */}
        <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 bg-white/10 dark:bg-black/10 backdrop-blur-md p-2 rounded-full border border-white/10 pointer-events-auto">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index, index > current ? 1 : -1)}
                className="relative h-1.5 rounded-full bg-black/20 dark:bg-white/20 overflow-hidden transition-all duration-300"
                style={{ width: current === index ? '2.5rem' : '0.5rem' }}
                aria-label={`Jump to display frame slide number ${index + 1}`}
              >
                {current === index && (
                  <motion.div
                    key={current + (isAutoplayActive ? '-active' : '-inactive')}
                    initial={{ left: '-100%' }}
                    animate={{ left: isAutoplayActive ? '0%' : '-100%' }}
                    transition={{ duration: isAutoplayActive ? autoDelay / 1000 : 0, ease: 'linear' }}
                    className="absolute inset-0 bg-red-600 dark:bg-red-500 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsPausedByUser(!isPausedByUser)}
            className="p-2.5 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/10 text-current transition-all hover:bg-white/20 active:scale-90 pointer-events-auto shadow-md"
            aria-label={isPausedByUser ? "Resume automatic sequence playback" : "Pause automatic sequence playback"}
          >
            {isPausedByUser ? (
              <PlayIcon className="h-4 w-4 text-zinc-900 dark:text-white" />
            ) : (
              <PauseIcon className="h-4 w-4 text-zinc-900 dark:text-white" />
            )}
          </button>
        </div>

        {/* DESKTOP DIRECTION NAVIGATION ARROWS */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xl hover:scale-105 active:scale-95 transition-all z-20 hidden lg:flex items-center justify-center group border border-slate-100 dark:border-zinc-800"
          aria-label="Previous slide"
        >
          <ChevronLeftIcon className="h-5 w-5 stroke-[2.5]" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xl hover:scale-105 active:scale-95 transition-all z-20 hidden lg:flex items-center justify-center group border border-slate-100 dark:border-zinc-800"
          aria-label="Next slide"
        >
          <ChevronRightIcon className="h-5 w-5 stroke-[2.5]" />
        </button>

      </div>
    </section>
  );
}