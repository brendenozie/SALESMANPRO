import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { HeroSlide } from '@/types/typings';

// Mock imports for the single-file environment, assuming these are available
// We'll define the HeroSlide interface locally.
// For icons, we'll assume Heroicons are available (or use inline SVG/Lucide if Heroicons aren't working).
// Since the original used Heroicons, we'll define simple SVGs to replace them robustly.

// ====================================================================
// --- LOCAL TYPES AND MOCK ASSETS ---
// ====================================================================

// interface HeroSlide {
//   id: string;
//   companyId: string;
//   type: any;
//   order: number;
//   iconKey: any;
//   videoLink: string | null;
//   price: number | null;
//   endsAt: string | null;
//   productImageUrl: string | null;
//   imageUrl: string | null;
//   headline: string | null;
//   subline: string | null;
//   badgeText: string | null;
//   ctaText: string | null;
//   ctaLink: string | null;
//   backgroundColor: string;
//   textColor: string;
// }

const defaultSlides: HeroSlide[] = [
  {
    id: '1', companyId: '', type: null, order: 0, iconKey: null,
    videoLink: null, price: null, endsAt: null, productImageUrl: null,
    imageUrl: 'https://placehold.co/550x550/fff5f6/111827?text=SNEAKER+1',
    headline: 'Step Into Next-Level Comfort',
    subline: 'Sneakers',
    badgeText: 'Ergonomic. Lightweight. Built for daily motion.',
    ctaText: 'Discover Collection', ctaLink: '#collection',
    backgroundColor: '#fff5f6', textColor: '#111827'
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

// Helper to simulate Image component behavior (using regular img tag for single file)
const NextImage = ({ src, alt, width, height, className, ...props }: any) => (
    <img src={src} alt={alt} width={width} height={height} className={className} {...props} />
);

// Helper to simulate Link component behavior (using regular a tag for single file)
const NextLink = ({ href, className, children }: any) => (
    <a href={href} className={className}>{children}</a>
);

// Icon components (using inline SVG for robustness)
const ChevronLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

const PauseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0a.75.75 0 01.75-.75H16.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
  </svg>
);

const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
  </svg>
);
// ====================================================================

// Slide + Fade Blend Animation
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
  center: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const imageVariants = {
  enter: { opacity: 0, scale: 0.95 },
  center: { opacity: 1, scale: 1, transition: { duration: 0.7 } }
};

export default function HeroSlider({ heroSlides }: { heroSlides?: HeroSlide[] }) {
  const slides = (heroSlides?.length ? heroSlides : defaultSlides).map((s, i) => ({
    ...s,
    // Use productImageUrl, fallback to imageUrl, fallback to default placeholder
    imageUrl: s.productImageUrl || s.imageUrl || defaultSlides[i % defaultSlides.length].imageUrl,
  })) as HeroSlide[]; // Assert type after mapping

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  // Separate states for hover pause and explicit user pause
  const [isHovering, setIsHovering] = useState(false);
  const [isPausedByUser, setIsPausedByUser] = useState(false);
  const isAutoplayActive = !isHovering && !isPausedByUser;

  const timeoutRef = useRef<number | null>(null);
  const autoDelay = 6000;

  // Preload all images (client-side only, next/image handles server-side priority)
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
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }

    if (isAutoplayActive) {
      // TypeScript requires type assertion for setTimeout return in some environments
      timeoutRef.current = window.setTimeout(nextSlide, autoDelay);
    }
  }, [nextSlide, isAutoplayActive]);

  // Main Effect for Autoplay Timer
  useEffect(() => {
    resetTimer();
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [current, isAutoplayActive, resetTimer]);


  const handleDragEnd = (_: any, info: PanInfo) => {
    const offset = info.offset.x;
    // Set a threshold for swipe based on device size/feel
    const swipeThreshold = 50;

    if (offset < -swipeThreshold) nextSlide();
    else if (offset > swipeThreshold) prevSlide();

    // Reset timer on manual interaction
    resetTimer();
  };

  const toggleAutoplay = () => {
    setIsPausedByUser(p => !p);
  };

  return (
    <section
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="relative overflow-hidden py-16 md:py-24 bg-gray-50 font-sans"
    >
      <div className="container mx-auto px-6 md:px-12 lg:px-20 xl:px-32">
        <div className="relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center">
          <AnimatePresence initial={false} custom={direction}>
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
              role="region"
              aria-roledescription="carousel"
              aria-label={`Slide ${current + 1} of ${slides.length}`}
              style={{ backgroundColor: slides[current].backgroundColor, color: slides[current].textColor }}
              className="absolute inset-0 rounded-3xl p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row gap-12 items-center justify-between cursor-grab active:cursor-grabbing"
            >

              {/* TEXT & CTA */}
              <motion.div variants={contentVariants} className="w-full lg:w-1/2 text-center lg:text-left order-2 lg:order-1">
                <p className="text-sm font-semibold uppercase tracking-widest text-red-600 mb-3">
                  {slides[current].subline}
                </p>
                <h2 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-[1.1] drop-shadow-sm">
                  {slides[current].headline}
                </h2>
                <p className="mt-6 text-lg opacity-80 max-w-lg mx-auto lg:mx-0">
                  {slides[current].badgeText}
                </p>
                <div className="mt-10">
                  <NextLink
                    href={slides[current].ctaLink || '#'}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-red-600 text-white font-bold text-lg rounded-full shadow-xl shadow-red-500/30 hover:bg-red-700 active:scale-[0.98] transition-all transform duration-200 ring-2 ring-red-600 ring-offset-4 ring-offset-current"
                  >
                    {slides[current].ctaText} <ChevronRightIcon className="h-6 w-6" />
                  </NextLink>
                </div>
              </motion.div>

              {/* IMAGE */}
              <motion.div variants={imageVariants} className="w-full lg:w-1/2 flex justify-center relative order-1 lg:order-2">
                <div className="absolute inset-0 flex items-center justify-center text-[18vw] lg:text-[15vw] font-extrabold opacity-[0.06] uppercase select-none pointer-events-none">
                  {slides[current].subline}
                </div>
                <NextImage
                  src={slides[current].imageUrl || ''}
                  alt={slides[current].headline || ''}
                  width={550}
                  height={550}
                  className="relative object-contain max-h-[45vh] md:max-h-[50vh] drop-shadow-2xl z-10 p-4"
                  // 'priority' attribute is removed here since we are using a mock Image component
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* --- CONTROLS: PROGRESS, DOTS, PLAY/PAUSE --- */}
        <div className="mt-8 flex flex-col items-center gap-4">

          {/* PROGRESS BAR */}
          <div className="w-full max-w-xl h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              key={current + (isAutoplayActive ? '-active' : '-inactive')}
              initial={{ width: 0 }}
              animate={{ width: isAutoplayActive ? '100%' : '0%' }}
              transition={{ duration: isAutoplayActive ? autoDelay / 1000 : 0, ease: 'linear' }}
              className="h-full bg-red-600 shadow-md"
            />
          </div>

          <div className="flex items-center space-x-4">
            {/* DOT NAVIGATION */}
            <div className="flex space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index, index > current ? 1 : -1)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    current === index
                      ? 'bg-red-600 w-6 shadow-md'
                      : 'bg-gray-400 hover:bg-red-300'
                  }`}
                />
              ))}
            </div>

            {/* PLAY / PAUSE BUTTON */}
            <button
              onClick={toggleAutoplay}
              aria-label={isPausedByUser ? "Resume Autoplay" : "Pause Autoplay"}
              className="p-1.5 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors shadow-inner"
            >
              {isPausedByUser ? (
                <PlayIcon className="h-5 w-5" />
              ) : (
                <PauseIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* ARROWS (positioned absolutely to the container for wider hit areas) */}
        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 z-20 hidden md:block"
        >
          <ChevronLeftIcon className="h-6 w-6 text-gray-700" />
        </button>

        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 z-20 hidden md:block"
        >
          <ChevronRightIcon className="h-6 w-6 text-gray-700" />
        </button>
      </div>
    </section>
  );
}