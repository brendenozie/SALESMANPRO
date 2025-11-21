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
    imageUrl:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
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
    imageUrl:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
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

  const defaultPrimaryColor = '#6B46C1';
  const defaultSecondaryColor = '#D53F8C';
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
    <section className="relative pt-20 h-screen min-h-[700px] bg-stone-100 overflow-hidden flex items-center">
      {/* BACKGROUND GRID: left decorative + right image (right image updates per current slide) */}
      <div className="absolute inset-0 grid grid-cols-2">
        <div className="bg-stone-100 h-full w-full relative hidden md:block">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-stone-200 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="relative h-full w-full">
          <Image
            src={heroSlidesToShow[current].imageUrl || heroSlidesToShow[current].productImageUrl || "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80"}
            alt={heroSlidesToShow[current].headline || 'Hero Image'}
            loader={loader}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-stone-900/10" />
        </div>
      </div>

      {/* SLIDER CONTENT & ANIMATIONS */}
      <div className="container mx-auto px-4 md:px-8 lg:px-16 relative z-10 w-full">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          {heroSlidesToShow.map(
            (slide, idx) =>
              idx === current && (
                <motion.div
                  key={idx}
                  className="relative overflow-hidden rounded-3xl group h-[500px] md:h-[600px]"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={handleDragEnd}
                >
                  {/* MOBILE: image panel + bottom text overlay (keeps your current mobile layout) */}
                  <div className="relative w-full md:hidden overflow-hidden h-full">
                    <div className="relative h-full w-full">
                      <Image
                        src={slide.imageUrl || slide.productImageUrl || "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80"}
                        alt={slide.headline || 'Hero Image'}
                        fill
                        sizes="100vw"
                        className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                        loader={loader}
                        priority
                      />
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 z-10" />

                    <div className="absolute bottom-0 left-0 right-0 p-6 z-30 text-white">
                      <h2 className="text-2xl font-bold">{slide.headline}</h2>
                      {slide.badgeText && <p className="text-sm mt-2 line-clamp-3">{slide.badgeText}</p>}
                      {slide.ctaLink && slide.ctaText && (
                        <Link
                          href={slide.ctaLink}
                          className="inline-block mt-3 bg-white text-black font-medium px-4 py-2 rounded-md"
                        >
                          {slide.ctaText}
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* DESKTOP: use the new design — left decorative (already in background), right image (background), plus centered frosted content card */}
                  <div className="hidden md:block w-full h-full relative">
                    {/* Centered content card overlay */}
                    <div className="absolute inset-0 flex items-center">
                      <div className="max-w-7xl mx-auto px-6 w-full">
                        <motion.div
                          initial={{ opacity: 0, x: -50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="bg-white/90 backdrop-blur-sm p-8 md:p-12 max-w-xl shadow-2xl border-l-4 border-orange-600"
                        >
                          <span
                            className="text-orange-700 font-bold tracking-widest text-xs uppercase mb-2 block"
                            style={{ color: primary }}
                          >
                            {slide.subline}
                          </span>

                          <h1 className="text-5xl md:text-6xl font-serif font-bold text-stone-900 leading-tight mb-6">
                            {String(slide.headline)
                              .split('\n')
                              .map((line, i) => (
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
                          </h1>

                          {slide.badgeText && (
                            <p className="text-stone-600 text-lg mb-8 leading-relaxed">{slide.badgeText}</p>
                          )}

                          <div className="flex gap-4">
                            {slide.ctaLink && slide.ctaText && (
                              <Link
                                href={slide.ctaLink}
                                className="bg-stone-900 text-white px-8 py-4 font-medium hover:bg-orange-700 transition-colors flex items-center gap-2"
                              >
                                {slide.ctaText}
                                <ArrowRightIcon className="w-4 h-4" />
                              </Link>
                            )}

                            <button className="px-8 py-4 border border-stone-300 text-stone-800 font-medium hover:bg-stone-50 transition-colors">
                              View Lookbook
                            </button>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
          )}
        </AnimatePresence>

        {/* ARROWS */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-8 md:left-10 transform -translate-y-1/2 bg-white/50 hover:bg-white p-3 md:p-4 rounded-full text-gray-800 shadow-xl transition-all duration-200 z-30 backdrop-blur-sm"
          aria-label="Previous slide"
        >
          <ArrowLeftIcon className="h-5 w-5 md:h-6 md:w-6" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-8 md:right-10 transform -translate-y-1/2 bg-white/50 hover:bg-white p-3 md:p-4 rounded-full text-gray-800 shadow-xl transition-all duration-200 z-30 backdrop-blur-sm"
          aria-label="Next slide"
        >
          <ArrowRightIcon className="h-5 w-5 md:h-6 md:w-6" />
        </button>

        {/* PAGINATION DOTS */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-30">
          {heroSlidesToShow.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx, idx > current ? 1 : -1)}
              className={`relative w-3.5 h-3.5 rounded-full overflow-hidden transition-all duration-300 border-2 ${
                idx === current ? 'border-white scale-125' : 'border-gray-400 opacity-70 hover:scale-110'
              }`}
            >
              {idx === current && (
                <div
                  ref={progressRef}
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{ backgroundColor: 'white', width: '0%' }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
