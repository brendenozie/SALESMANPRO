import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { HeroSlide } from '@/types/typings';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  PauseIcon, 
  PlayIcon 
} from '@heroicons/react/24/solid';

// ====================================================================
// --- MOCK ASSETS & DEFAULT DATA ---
// ====================================================================

const defaultSlides: HeroSlide[] = [
  {
    id: '1', companyId: '', type: null, order: 0, iconKey: null,
    videoLink: null, price: null, endsAt: null, productImageUrl: null,
    imageUrl: 'https://placehold.co/550x550/fff5f6/111827?text=SNEAKER+1',
    headline: 'Step Into Next-Level Comfort',
    subline: 'Sneakers',
    badgeText: 'Ergonomic. Lightweight. Built for daily motion.',
    ctaText: 'Discover Collection', ctaLink: '#collection',
    backgroundColor: '#fff5f6', textColor: '#111827' // These can be overridden by dynamic data
  },
  {
    id: '2', companyId: '', type: null, order: 0, iconKey: null,
    videoLink: null, price: null, endsAt: null, productImageUrl: null,
    imageUrl: 'https://placehold.co/550x550/eef7ff/1f2937?text=SNEAKER+2',
    headline: 'Unleash Your Personal Best',
    subline: 'Performance',
    badgeText: 'Engineered for speed and endurance.',
    ctaText: 'Shop Performance', ctaLink: '#performance',
    backgroundColor: '#eef7ff', textColor: '#1f2937'
  },
  {
    id: '3', companyId: '', type: null, order: 0, iconKey: null,
    videoLink: null, price: null, endsAt: null, productImageUrl: null,
    imageUrl: 'https://placehold.co/550x550/f0fdf4/052e16?text=SNEAKER+3',
    headline: 'Style That Keeps Pace',
    subline: 'Lifestyle',
    badgeText: 'Classic design meets modern sustainability.',
    ctaText: 'View Lifestyle', ctaLink: '#lifestyle',
    backgroundColor: '#f0fdf4', textColor: '#052e16'
  }
];

// Mock Components
const NextImage = ({ src, alt, width, height, className, ...props }: any) => (
    <img src={src} alt={alt} width={width} height={height} className={className} {...props} />
);

const NextLink = ({ href, className, children }: any) => (
    <a href={href} className={className}>{children}</a>
);

// ====================================================================
// --- ANIMATIONS ---
// ====================================================================

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 60 : -60, filter: 'blur(6px)' }),
  center: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: [0.33, 1, 0.68, 1] }
  },
  exit: (dir: number) => ({ opacity: 0, x: dir < 0 ? 60 : -60, filter: 'blur(6px)' })
};

const contentVariants = {
  enter: { opacity: 0, y: 15 },
  center: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } }
};

const imageVariants = {
  enter: { opacity: 0, scale: 0.9, rotate: -5 },
  center: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

export default function HeroSlider({ heroSlides }: { heroSlides?: HeroSlide[] }) {
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

  useEffect(() => {
    slides.forEach((s) => {
      if (s.imageUrl) {
        const img = new window.Image();
        img.src = s.imageUrl;
      }
    });
  }, [slides]);

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

  const resetTimer = useCallback(() => {
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    if (isAutoplayActive) {
      timeoutRef.current = window.setTimeout(nextSlide, autoDelay);
    }
  }, [nextSlide, isAutoplayActive]);

  useEffect(() => {
    resetTimer();
    return () => { if (timeoutRef.current !== null) clearTimeout(timeoutRef.current); };
  }, [current, isAutoplayActive, resetTimer]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) nextSlide();
    else if (info.offset.x > swipeThreshold) prevSlide();
    resetTimer();
  };

  return (
    <section
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="relative overflow-hidden py-12 md:py-20 bg-gray-50 dark:bg-slate-950 transition-colors duration-500 font-sans"
    >
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <div className="relative min-h-[500px] md:min-h-[600px] flex items-center justify-center">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={current}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              custom={direction}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={handleDragEnd}
              style={{ 
                backgroundColor: slides[current].backgroundColor, 
                color: slides[current].textColor 
              }}
              className="absolute inset-0 rounded-[2.5rem] p-8 md:p-16 flex flex-col lg:flex-row gap-10 items-center justify-between cursor-grab active:cursor-grabbing shadow-2xl shadow-black/5 dark:shadow-white/5 overflow-hidden"
            >
              {/* Background Decorative Text */}
              <div className="absolute inset-0 flex items-center justify-center text-[18vw] font-black opacity-[0.04] dark:opacity-[0.07] uppercase select-none pointer-events-none">
                {slides[current].subline}
              </div>

              {/* TEXT CONTENT */}
              <motion.div variants={contentVariants} className="w-full lg:w-1/2 text-center lg:text-left z-10 order-2 lg:order-1">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600 dark:text-red-500 mb-4">
                  {slides[current].subline}
                </p>
                <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-[1.05] tracking-tight">
                  {slides[current].headline}
                </h2>
                <p className="mt-6 text-lg md:text-xl opacity-80 max-w-lg mx-auto lg:mx-0 font-medium">
                  {slides[current].badgeText}
                </p>
                <div className="mt-10">
                  <NextLink
                    href={slides[current].ctaLink || '#'}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-red-600 text-white font-bold text-lg rounded-full shadow-lg shadow-red-500/40 hover:bg-red-700 hover:-translate-y-1 active:scale-95 transition-all duration-200"
                  >
                    {slides[current].ctaText} 
                    <ChevronRightIcon className="h-5 w-5 stroke-[3]" />
                  </NextLink>
                </div>
              </motion.div>

              {/* IMAGE CONTENT */}
              <motion.div variants={imageVariants} className="w-full lg:w-1/2 flex justify-center z-10 order-1 lg:order-2">
                <NextImage
                  src={slides[current].imageUrl || ''}
                  alt={slides[current].headline || ''}
                  width={550}
                  height={550}
                  className="relative object-contain max-h-[35vh] md:max-h-[50vh] drop-shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* --- CONTROLS --- */}
        <div className="mt-12 flex flex-col items-center gap-6">
          
          {/* PROGRESS BAR */}
          <div className="w-full max-w-md h-1.5 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              key={current + (isAutoplayActive ? '-active' : '-inactive')}
              initial={{ width: 0 }}
              animate={{ width: isAutoplayActive ? '100%' : '0%' }}
              transition={{ duration: isAutoplayActive ? autoDelay / 1000 : 0, ease: 'linear' }}
              className="h-full bg-red-600 dark:bg-red-500"
            />
          </div>

          <div className="flex items-center gap-8">
            {/* DOTS */}
            <div className="flex gap-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index, index > current ? 1 : -1)}
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    current === index
                      ? 'bg-red-600 dark:bg-red-500 w-10'
                      : 'bg-gray-300 dark:bg-slate-700 w-2.5 hover:bg-red-300'
                  }`}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>

            {/* PLAY / PAUSE */}
            <button
              onClick={() => setIsPausedByUser(!isPausedByUser)}
              className="group p-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              {isPausedByUser ? (
                <PlayIcon className="h-5 w-5 text-gray-600 dark:text-slate-300 group-hover:text-red-600" />
              ) : (
                <PauseIcon className="h-5 w-5 text-gray-600 dark:text-slate-300 group-hover:text-red-600" />
              )}
            </button>
          </div>
        </div>

        {/* ARROWS (Hidden on mobile) */}
        <button
          onClick={prevSlide}
          className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 shadow-xl hover:scale-110 active:scale-90 transition-all z-20 hidden md:flex items-center justify-center group"
        >
          <ChevronLeftIcon className="h-6 w-6 text-gray-800 dark:text-white group-hover:text-red-600 transition-colors" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 shadow-xl hover:scale-110 active:scale-90 transition-all z-20 hidden md:flex items-center justify-center group"
        >
          <ChevronRightIcon className="h-6 w-6 text-gray-800 dark:text-white group-hover:text-red-600 transition-colors" />
        </button>
      </div>
    </section>
  );
}