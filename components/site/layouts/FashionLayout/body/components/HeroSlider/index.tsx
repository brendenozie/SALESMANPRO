'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide } from '@/types/typings';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const autoAdvanceDelay = 5000;

export interface HeroSliderProps {
  heroSlides: HeroSlide[] | null;
  themeSettings: any;
}

const defaultSlides: HeroSlide[] = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop',
    subline: 'Spring Collection 2025',
    headline: 'Redefine Your\nUnique Style',
    badgeText: 'Discover the latest trends in street fashion and luxury wear. Curated for the bold, designed for the elegant.',
    ctaText: 'Shop Now',
    ctaLink: '/shop',
    id: '',
    companyId: '',
    productImageUrl: null,
    price: null,
    endsAt: null,
    order: 0,
    iconKey: null,
    backgroundColor: null,
    textColor: null,
    videoLink: null,
    type: null,
  },
];

export default function HeroSlider({ heroSlides, themeSettings }: HeroSliderProps) {
  const heroSlidesToShow: HeroSlide[] = (heroSlides && heroSlides.length > 0 ? heroSlides : defaultSlides).map(
    (slide, index) => ({
      ...slide,
      imageUrl: slide.imageUrl || defaultSlides[index]?.imageUrl || defaultSlides[0].imageUrl,
      subline: slide.subline || defaultSlides[index]?.subline || 'Spring Collection 2025',
      headline: slide.headline || defaultSlides[index]?.headline || 'Redefine Your Unique Style',
      badgeText:
        slide.badgeText ||
        defaultSlides[index]?.badgeText ||
        'Discover curated collections and exceptional savings on your favorite products.',
      ctaText: slide.ctaText || 'Shop Now',
      ctaLink: slide.ctaLink || '/shop',
    })
  );

  const primary = themeSettings?.primaryColor || '#6366F1';
  const secondary = themeSettings?.secondaryColor || '#EC4899';

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const resetTimer = useCallback(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % heroSlidesToShow.length);
    }, autoAdvanceDelay);
  }, [heroSlidesToShow.length]);

  useEffect(() => {
    resetTimer();
    return () => clearTimeout(timeoutRef.current);
  }, [current, resetTimer]);

  const goTo = (idx: number, dir = 0) => {
    clearTimeout(timeoutRef.current);
    setDirection(dir);
    setCurrent(idx);
  };

  const prevSlide = () => goTo((current - 1 + heroSlidesToShow.length) % heroSlidesToShow.length, -1);
  const nextSlide = () => goTo((current + 1) % heroSlidesToShow.length, 1);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const offset = info.offset.x;
    if (offset < -50) nextSlide();
    else if (offset > 50) prevSlide();
  };

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 100 : -100 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.8, ease: 'easeOut' } },
    exit: (dir: number) => ({ x: dir < 0 ? 100 : -100, opacity: 0, transition: { duration: 0.8 } }),
  };

  const fadeIn = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } } };
  const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.2 } } };

  return (
    <section className="relative w-full min-h-[90vh] flex items-center bg-[#f8f8f8] overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 w-[50vw] h-[100vh] bg-indigo-50 skew-x-12 translate-x-20 z-0" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
        {/* Content */}
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
          <AnimatePresence initial={false} custom={direction}>
            {heroSlidesToShow.map(
              (slide, idx) =>
                idx === current && (
                  <motion.div
                    key={idx}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    custom={direction}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={handleDragEnd}
                  >
                    <motion.div variants={fadeIn} className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-full">
                        {slide.subline}
                      </span>
                    </motion.div>
                    <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-bold text-slate-900 leading-[1.1]">
                      {slide.headline?.split('\n').map((line, i) => (
                        <React.Fragment key={i}>
                          {line.includes('$') ? (
                            <>
                              {line.split('$')[0]}
                              <span style={{ color: secondary }}>{line.split('$')[1]}</span>
                            </>
                          ) : (
                            line
                          )}
                          <br />
                        </React.Fragment>
                      ))}
                    </motion.h1>
                    <motion.p variants={fadeIn} className="text-lg text-slate-600 max-w-md">
                      {slide.badgeText}
                    </motion.p>
                    <motion.div variants={fadeIn} className="flex gap-4 pt-4">
                      <Link
                        href={slide.ctaLink || '#'}
                        className="bg-slate-900 text-white px-8 py-4 rounded-full font-semibold flex items-center gap-2 hover:bg-slate-800 transition-all group"
                      >
                        {slide.ctaText} <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                      <button className="px-8 py-4 rounded-full font-semibold text-slate-700 border border-slate-200 hover:border-slate-400 transition-all">
                        View Lookbook
                      </button>
                    </motion.div>
                  </motion.div>
                )
            )}
          </AnimatePresence>
        </motion.div>

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative h-[600px] w-full hidden md:block"
        >
          <div className="absolute inset-0 rounded-[2rem] overflow-hidden shadow-2xl">
            <Image
              src={heroSlidesToShow[current].imageUrl || 'https://via.placeholder.com/1000/600/C0C0C0?text=No+Image'}
              alt={heroSlidesToShow[current].headline || 'Hero Image'}
              loader={loader}
              fill
              className="object-cover"
              priority
            />
            {/* Overlay Card */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute bottom-8 left-8 right-8 bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/50"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-slate-500">Featured</p>
                  <h3 className="text-xl font-bold text-slate-900">Autumn Coat Collection</h3>
                </div>
                <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white">
                  <ArrowRightIcon className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-8 transform -translate-y-1/2 bg-white/50 hover:bg-white p-3 md:p-4 rounded-full text-gray-800 shadow-xl transition-all duration-200 z-30 backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <ArrowLeftIcon className="h-5 w-5 md:h-6 md:w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-8 transform -translate-y-1/2 bg-white/50 hover:bg-white p-3 md:p-4 rounded-full text-gray-800 shadow-xl transition-all duration-200 z-30 backdrop-blur-sm"
        aria-label="Next slide"
      >
        <ArrowRightIcon className="h-5 w-5 md:h-6 md:w-6" />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-30">
        {heroSlidesToShow.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx, idx > current ? 1 : -1)}
            className={`relative w-3.5 h-3.5 rounded-full overflow-hidden transition-all duration-300 border-2 ${
              idx === current ? 'border-white scale-125' : 'border-gray-400 opacity-70 hover:scale-110'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
