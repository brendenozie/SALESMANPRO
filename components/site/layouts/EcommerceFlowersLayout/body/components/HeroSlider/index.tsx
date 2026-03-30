'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide } from '@/types/typings';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const transitionDuration = 1.2; // Slower, more elegant transition
const autoAdvanceDelay = 6000;

export interface HeroSliderProps {
  heroSlides: HeroSlide[] | null;
  themeSettings: any;
}

const defaultSlides: HeroSlide[] = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1600&q=80',
    subline: 'Spring Collection 2026',
    headline: 'THE ULTIMATE\n$FLOWER$ DESTINATION',
    badgeText: 'Transform your space into a paradise with our hand-picked seasonal blooms and artisanal arrangements.',
    ctaText: 'Shop the Collection',
    ctaLink: '/shop',
    id: '1',
    companyId: '',
    productImageUrl: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80', // Floating secondary image
    price: null,
    endsAt: null,
    order: 0,
    iconKey: null,
    backgroundColor: '#FFF9F9',
    textColor: null,
    videoLink: null,
    type: null,
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1600&q=80',
    subline: 'Artisan Curated',
    headline: 'NATURE\'S FINEST\n$MOMENTS$',
    badgeText: 'Discover the language of flowers through our bespoke bouquets designed for life\'s most precious celebrations.',
    ctaText: 'View Bouquets',
    ctaLink: '/collection',
    id: '2',
    companyId: '',
    productImageUrl: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=600&q=80',
    price: null,
    endsAt: null,
    order: 0,
    iconKey: null,
    backgroundColor: '#F7F9F7',
    textColor: null,
    videoLink: null,
    type: null,
  },
];

export default function HeroSlider({ heroSlides, themeSettings }: HeroSliderProps) {
  const primary = themeSettings?.primaryColor || '#E11D48'; // A sophisticated Rose Red
  const secondary = themeSettings?.secondaryColor || '#1E293B';

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const progressRef = useRef<HTMLDivElement>(null);

  const heroSlidesToShow = (heroSlides && heroSlides.length > 0 ? heroSlides : defaultSlides);

  const resetTimer = useCallback(() => {
    clearTimeout(timeoutRef.current);
    if (progressRef.current) {
      progressRef.current.style.transition = 'none';
      progressRef.current.style.width = '0%';
      void progressRef.current.offsetWidth;
      progressRef.current.style.transition = `width ${autoAdvanceDelay}ms linear`;
      progressRef.current.style.width = '100%';
    }
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

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, scale: 1.05 }),
    center: { opacity: 1, scale: 1, transition: { duration: transitionDuration, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.8 } },
  };

  return (
    <section className="relative w-full min-h-[100vh] flex items-center overflow-hidden bg-[#fafafa]">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        {heroSlidesToShow.map((slide, idx) => idx === current && (
          <motion.div
            key={slide.id || idx}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full flex items-center"
          >
            {/* Background Image with Soft Overlay */}
            <div className="absolute inset-0 z-0">
              <Image
                src={slide.imageUrl || 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1600&q=80'}
                alt="background"
                fill
                className="object-cover brightness-95"
                priority
                loader={loader}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent md:from-white/80" />
            </div>

            <div className="container mx-auto px-6 md:px-12 lg:px-20 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              
              {/* Text Content */}
              <div className="max-w-2xl">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="inline-block text-xs uppercase tracking-[0.3em] font-bold mb-4 text-rose-600">
                    {slide.subline}
                  </span>
                  
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-slate-900 leading-[1.1] mb-6">
                    {(slide.headline ?? '').split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line.includes('$') ? (
                          <>
                            {line.split('$')[0]}
                            <span className="italic text-rose-500 font-light">{line.split('$')[1]}</span>
                            {line.split('$')[2]}
                          </>
                        ) : line}
                        <br />
                      </React.Fragment>
                    ))}
                  </h1>

                  <p className="text-lg text-slate-600 mb-8 max-w-md leading-relaxed">
                    {slide.badgeText}
                  </p>

                  <div className="flex items-center gap-6">
                    <Link
                      href={slide.ctaLink || '/flowersecommerce/products'}
                      className="group relative px-8 py-4 bg-slate-900 text-white rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95"
                    >
                      <span className="relative z-10 font-medium">{slide.ctaText}</span>
                      <div className="absolute inset-0 bg-rose-600 translate-y-full transition-transform group-hover:translate-y-0" />
                    </Link>
                    
                    <div className="hidden sm:flex items-center gap-2 text-slate-400 text-sm font-medium italic">
                      <span className="w-8 h-[1px] bg-slate-300"></span>
                      Eco-friendly Sourcing
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Floating "Vogue" Style Image Panel */}
              <motion.div 
                className="hidden md:block relative aspect-[4/5] w-full max-w-sm ml-auto"
                initial={{ opacity: 0, y: 40, rotate: 2 }}
                animate={{ opacity: 1, y: 0, rotate: -2 }}
                transition={{ delay: 0.6, duration: 1 }}
              >
                <div className="absolute inset-0 border border-white/40 rounded-2xl transform translate-x-4 translate-y-4 z-0" />
                <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-2xl border-8 border-white">
                   <Image 
                    src={slide.productImageUrl || slide.imageUrl || 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80'} 
                    alt="feature" 
                    fill 
                    className="object-cover"
                    loader={loader}
                   />
                </div>
                {/* Decorative floating badge */}
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl flex flex-col items-center justify-center">
                   <span className="text-xs uppercase tracking-widest text-slate-400">Freshly Picked</span>
                   <span className="text-xl font-serif text-slate-900">Daily</span>
                </div>
              </motion.div>

            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute bottom-12 right-12 z-30 flex items-center gap-4">
        <div className="flex items-center gap-2 mr-8">
           {heroSlidesToShow.map((_, idx) => (
             <button
               key={idx}
               onClick={() => goTo(idx, idx > current ? 1 : -1)}
               className={`h-1 transition-all duration-500 rounded-full ${idx === current ? 'w-12 bg-rose-600' : 'w-4 bg-slate-300'}`}
             />
           ))}
        </div>
        <button 
          onClick={() => goTo((current - 1 + heroSlidesToShow.length) % heroSlidesToShow.length, -1)}
          className="p-3 border border-slate-200 rounded-full hover:bg-white transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-slate-900" />
        </button>
        <button 
          onClick={() => goTo((current + 1) % heroSlidesToShow.length, 1)}
          className="p-3 border border-slate-200 rounded-full hover:bg-white transition-colors"
        >
          <ArrowRightIcon className="w-5 h-5 text-slate-900" />
        </button>
      </div>

      {/* Progress Bar (Hidden but functional for timing) */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100 z-40">
        <div ref={progressRef} className="h-full bg-rose-600 w-0" />
      </div>
    </section>
  );
}