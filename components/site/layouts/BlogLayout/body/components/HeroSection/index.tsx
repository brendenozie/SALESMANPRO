import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from "@/contexts/ContextProvider";
import { useStoreContext } from '@/contexts/StoreContext';

// NOTE: This placeholder mimics your useStoreContext hook.
// In your actual application, you would use the real hook.
// const useStoreContext = () => ({
//   storeFormData: {
//     name: 'GLOBAL INSIGHTS',
//     tagline: 'Your Daily Dose of Knowledge and Inspiration',
//     themeSettings: { primaryColor: '#EF4444' }, // Tailwind 'red-500'
//     heroSlides: [
//       {
//         id: 'hero1',
//         imageUrl: 'https://placehold.co/1200x800/1E90FF/FFFFFF?text=AI+Future',
//         headline: 'The Future of AI: Innovations Shaping Our World',
//         subline: 'Explore the cutting-edge advancements in artificial intelligence.',
//         ctaText: 'Read More',
//         ctaLink: '#',
//         order: 1,
//         badgeText: 'TECHNOLOGY',
//       },
//       {
//         id: 'hero2',
//         imageUrl: 'https://placehold.co/1200x800/32CD32/FFFFFF?text=Mindful+Living',
//         headline: 'Mindful Living: A Guide to Wellness and Balance',
//         subline: 'Discover practices for a healthier and more balanced life.',
//         ctaText: 'Discover',
//         ctaLink: '#',
//         order: 2,
//         badgeText: 'HEALTH',
//       },
//       {
//         id: 'hero3',
//         imageUrl: 'https://placehold.co/1200x800/FFD700/000000?text=Travel+Adventure',
//         headline: 'Exploring Hidden Gems: Your Next Adventure Awaits',
//         subline: 'Uncover breathtaking destinations and travel tips.',
//         ctaText: 'Plan Trip',
//         ctaLink: '#',
//         order: 3,
//         badgeText: 'TRAVEL',
//       },
//     ],
//   },
// });

// A static fallback array for when no dynamic data is available
const STATIC_SLIDES = [
  {
    id: 'static1',
    imageUrl: 'https://placehold.co/1200x800/F97316/FFFFFF?text=Economy+Insights',
    badgeText: 'ECONOMY',
    headline: 'Exploring the Intricacies of Global Economies',
    subline: 'Dive deep into markets, money, and macroeconomic trends that shape our world.',
    ctaText: 'Learn More',
    ctaLink: '#',
    order: 1,
  },
  {
    id: 'static2',
    imageUrl: 'https://placehold.co/1200x800/8B5CF6/FFFFFF?text=Fashion+Trends',
    badgeText: 'STYLE',
    headline: 'A Journey Through Colors, Textures, and Trends',
    subline: 'Stay ahead of the curve with our comprehensive style guides.',
    ctaText: 'Explore Style',
    ctaLink: '#',
    order: 2,
  },
  {
    id: 'static3',
    imageUrl: 'https://placehold.co/1200x800/10B981/FFFFFF?text=Artistic+Expression',
    badgeText: 'ART',
    headline: 'Inspiring Creativity and Fostering Artistic Expression',
    subline: 'Discover inspiring art, artist profiles, and creative processes.',
    ctaText: 'View Art',
    ctaLink: '#',
    order: 3,
  },
];

const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { storeFormData } = useStoreContext() || {};
  const { heroSlides } = storeFormData || {};
  
  // Use dynamic data if available, otherwise use the static fallback
  const slides = (Array.isArray(heroSlides) && heroSlides.length > 0)
    ? [...heroSlides].sort((a, b) => a.order - b.order)
    : STATIC_SLIDES;

  // Auto-advance the carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(interval);
  }, [slides.length]);

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = 'https://placehold.co/1200x800/CCCCCC/333333?text=Image+Not+Found';
  };

  const currentSlide = slides[currentIndex];

  const contentVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.6, staggerChildren: 0.2 } },
  };

  const itemVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  const ArrowRight = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );

  return (
    <div className=" w-full h-screen bg-slate-950 text-white font-sans overflow-hidden">
      {/* Background and Overlay */}
      <AnimatePresence>
        <motion.div
          key={currentSlide.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1.0 }}
          className="absolute inset-0"
        >
          <img
            src={currentSlide.imageUrl || 'https://placehold.co/1200x800/1E90FF/FFFFFF?text=AI+Future' }
            alt={currentSlide.headline || 'Hero Image'}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
          {/* Subtle gradient overlay to enhance text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Main Hero Content */}
      <div className="relative z-10 w-full h-full flex flex-col justify-end items-start pb-20 px-4 sm:px-8 lg:px-16">
        <motion.div
          key={currentSlide.id}
          variants={contentVariants}
          initial="initial"
          animate="animate"
          className="max-w-4xl text-left"
        >
          <motion.span variants={itemVariants} className="px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wide bg-gradient-to-r from-cyan-500 to-indigo-500 shadow-lg">
            {currentSlide.badgeText}
          </motion.span>
          
          <motion.h1 variants={itemVariants} className="mt-4 text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-sky-400 to-indigo-500">
            {currentSlide.headline}
          </motion.h1>
          
          <motion.p variants={itemVariants} className="mt-4 text-lg sm:text-xl text-slate-300 max-w-2xl">
            {currentSlide.subline}
          </motion.p>
          
          <motion.a
            variants={itemVariants}
            href={currentSlide.ctaLink}
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 mt-8 rounded-full text-lg font-semibold bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            {currentSlide.ctaText}
            <ArrowRight />
          </motion.a>
        </motion.div>

        {/* Carousel Navigation Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'w-8 bg-white' : 'w-2 bg-slate-400 opacity-50 hover:bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
