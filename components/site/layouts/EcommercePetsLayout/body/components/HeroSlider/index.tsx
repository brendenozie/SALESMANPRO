'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide } from '@/types/typings';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const transitionDuration = 0.8;
const autoAdvanceDelay = 5000;

export interface HeroSliderProps {
  heroSlides: HeroSlide[] | null;
  themeSettings: any;
}

const defaultSlides: HeroSlide[] = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    subline: 'Exclusive Offer',
    headline: 'STEP INTO\nSTYLE & COMFORT',
    badgeText:
      'Out too the been like hard off. Improve enquire welcome own beloved matters her. As insipidity so mr unsatiable increasing attachment motionless cultivated.',
    ctaText: 'Buy Now',
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
  {
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    subline: 'New Collection',
    headline: 'ELEVATE YOUR\nLOOK TODAY',
    badgeText: 'Discover fresh drops and timeless classics. Comfort and style perfectly combined.',
    ctaText: 'Shop Now',
    ctaLink: '/collection',
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
  const defaultPrimaryColor = '#6B46C1';
  const defaultSecondaryColor = '#D53F8C';

  const heroSlidesToShow: HeroSlide[] = (heroSlides && heroSlides.length > 0 ? heroSlides : defaultSlides).map(
    (slide, index) => ({
      ...slide,
      imageUrl: slide.imageUrl || defaultSlides[index]?.imageUrl || defaultSlides[0].imageUrl,
      subline: slide.subline || 'Exclusive Offer',
      headline: slide.headline || defaultSlides[index]?.headline || 'Unlock Amazing Deals Now!',
      badgeText:
        slide.badgeText ||
        defaultSlides[index]?.badgeText ||
        'Discover curated collections and exceptional savings on your favorite products.',
      ctaText: slide.ctaText || 'Explore Collections',
      ctaLink: slide.ctaLink || '/shop',
    })
  );

  const primary = themeSettings?.primaryColor || defaultPrimaryColor;
  const secondary = themeSettings?.secondaryColor || defaultSecondaryColor;

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const progressRef = useRef<HTMLDivElement>(null);

  const resetTimer = useCallback(() => {
    clearTimeout(timeoutRef.current);
    if (heroSlidesToShow.length > 0) {
      if (progressRef.current) {
        progressRef.current.style.transition = 'none';
        progressRef.current.style.width = '0%';
        // force reflow
        // @ts-ignore
        progressRef.current.offsetWidth;
        progressRef.current.style.transition = `width ${autoAdvanceDelay}ms linear`;
        progressRef.current.style.width = '100%';
      }
      timeoutRef.current = setTimeout(() => {
        setDirection(1);
        setCurrent((prev) => (prev + 1) % heroSlidesToShow.length);
      }, autoAdvanceDelay);
    }
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

  const prevSlide = () =>
    goTo((current - 1 + heroSlidesToShow.length) % heroSlidesToShow.length, -1);
  const nextSlide = () => goTo((current + 1) % heroSlidesToShow.length, 1);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const offset = info.offset.x;
    if (offset < -50) nextSlide();
    else if (offset > 50) prevSlide();
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: transitionDuration, ease: 'easeOut' },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0,
      transition: { duration: transitionDuration, ease: 'easeInOut' },
    }),
  };

  return (
  <section
    className="relative w-full min-h-[700px] md:h-[85vh] overflow-hidden flex items-center"
    style={{ backgroundColor: primary }}
  >
    <div className="container mx-auto px-6 lg:px-20 relative z-10 h-full flex items-center">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        {heroSlidesToShow.map(
          (slide, idx) =>
            idx === current && (
              <motion.div
                key={idx}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
              >
                {/* TEXT SIDE */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6">

                  {/* Subline */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-base md:text-lg font-bold tracking-tight"
                    style={{ color: secondary }}
                  >
                    {slide.subline}
                  </motion.p>

                  {/* Headline */}
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl sm:text-5xl lg:text-7xl font-black leading-[1.1] text-white"
                  >
                    {(slide.headline ?? '').split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                  </motion.h1>

                  {/* Description */}
                  {slide.badgeText && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-white/90 text-sm md:text-base max-w-md leading-relaxed"
                    >
                      {slide.badgeText}
                    </motion.p>
                  )}

                  {/* CTA Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 pt-2 w-full sm:w-auto"
                  >
                    {slide.ctaLink && slide.ctaText && (
                      <Link
                        href={slide.ctaLink}
                        className="px-8 py-3.5 bg-white text-black rounded-xl font-bold shadow-lg hover:scale-105 transition-all text-center"
                      >
                        {slide.ctaText}
                      </Link>
                    )}

                    <Link
                      href="/shop"
                      className="px-8 py-3.5 border-2 border-white bg-white/20 backdrop-blur-md text-white rounded-xl font-bold hover:bg-white/40 transition-all text-center"
                    >
                      See More
                    </Link>
                  </motion.div>
                </div>

                {/* IMAGE SIDE */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7 }}
                  className="relative h-[350px] sm:h-[450px] md:h-[550px] w-full mt-auto"
                >
                  <Image
                    src={slide.imageUrl || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80'}
                    alt={slide.headline || 'Hero Image'}
                    fill
                    loader={loader}
                    className="object-contain object-bottom scale-110 md:scale-125 origin-bottom"
                    priority
                  />
                </motion.div>
              </motion.div>
            )
        )}
      </AnimatePresence>
    </div>

    {/* Decorative Stars */}
    <div className="absolute top-[10%] right-[15%] text-white text-3xl opacity-80 select-none z-20">
      ✦
    </div>
    <div className="absolute top-[40%] right-[5%] text-white text-2xl opacity-70 select-none z-20">
      ✦
    </div>

    {/* Arrows */}
    <button
      onClick={prevSlide}
      className="absolute top-1/2 left-6 transform -translate-y-1/2 bg-white/40 hover:bg-white p-3 rounded-full text-black shadow-xl z-30 backdrop-blur-sm"
    >
      <ArrowLeftIcon className="h-5 w-5" />
    </button>

    <button
      onClick={nextSlide}
      className="absolute top-1/2 right-6 transform -translate-y-1/2 bg-white/40 hover:bg-white p-3 rounded-full text-black shadow-xl z-30 backdrop-blur-sm"
    >
      <ArrowRightIcon className="h-5 w-5" />
    </button>

    {/* Pagination Dots */}
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex space-x-3 z-30">
      {heroSlidesToShow.map((_, idx) => (
        <button
          key={idx}
          onClick={() => goTo(idx, idx > current ? 1 : -1)}
          className={`relative w-3.5 h-3.5 rounded-full overflow-hidden transition-all duration-300 border-2 ${
            idx === current
              ? 'border-white scale-125'
              : 'border-white/60 opacity-70 hover:scale-110'
          }`}
        >
          {idx === current && (
            <div
              ref={progressRef}
              className="absolute left-0 top-0 h-full rounded-full bg-white"
              style={{ width: '0%' }}
            />
          )}
        </button>
      ))}
    </div>

    {/* Bottom Wave */}
    <div className="absolute bottom-[-1px] left-0 w-full overflow-hidden leading-[0] z-0">
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="relative block w-[150%] md:w-[110%] h-[60px] md:h-[120px] fill-white"
      >
        <path d="M0,0 C200,40 400,-10 600,30 C800,70 1000,20 1200,50 V120 H0 Z"></path>
      </svg>
    </div>
  </section>
);
}
