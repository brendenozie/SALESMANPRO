import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { HeroSlide } from '@/types/typings';

// A static fallback array for when no dynamic data is available
const STATIC_SLIDES = [
  {
    id: 'static1',
    imageUrl: 'https://placehold.co/1200x800/F97316/FFFFFF?text=Economy+Insights',
    productImageUrl: 'https://placehold.co/1200x800/10B981/FFFFFF?text=Artistic+Expression',
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
    productImageUrl: 'https://placehold.co/1200x800/10B981/FFFFFF?text=Artistic+Expression',
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
    productImageUrl: 'https://placehold.co/1200x800/10B981/FFFFFF?text=Artistic+Expression',
    badgeText: 'ART',
    headline: 'Inspiring Creativity and Fostering Artistic Expression',
    subline: 'Discover inspiring art, artist profiles, and creative processes.',
    ctaText: 'View Art',
    ctaLink: '#',
    order: 3,
  },
];

interface HeroSectionProps { 
  heroSlides : HeroSlide[];
}

const HeroSection = ({ heroSlides }: HeroSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
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
            src={currentSlide.imageUrl || currentSlide.productImageUrl || 'https://placehold.co/1200x800/1E90FF/FFFFFF?text=AI+Future' }
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

/**
 * HeroSection.jsx
 *
 * This component implements a fully responsive, auto-advancing carousel
 * using React and Framer Motion. It supports both image and video backgrounds,
 * retaining the dark, gradient-heavy aesthetic of the first provided design.
 */

// "use client";
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// Icons are included as inline SVGs in this version for simplicity
// and to match the ArrowRight implementation in the original design.

// --- 1. Data Structure (Merged and Enhanced) ---
// This data combines the media information (url, type) from the second example
// with the content metadata (badge, cta) required by the first example's design.
const SLIDES = [
  {
    id: 'slide1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2670&auto=format&fit=crop',
    badgeText: 'STRATEGY',
    headline: 'Unlock Your True Potential and Scale Your Business',
    subline: 'Empowering ambitious individuals and teams to create a life of purpose, clarity, and success.',
    ctaText: 'Start Your Journey',
    ctaLink: '#contact',
    order: 1,
  },
  {
    id: 'slide2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=2670&auto=format&fit=crop',
    badgeText: 'GROWTH',
    headline: 'Transform Your Vision into Actionable Results Today',
    subline: 'Through strategic coaching and tailored consultation, I help you move from ideas to impact.',
    ctaText: 'Explore Consulting',
    ctaLink: '#services',
    order: 2,
  },
  {
    id: 'slide3',
    type: 'video',
    url: 'https://cdn.pixabay.com/video/2024/02/26/200827-919106201_large.mp4',
    badgeText: 'LEADERSHIP',
    headline: 'Lead with Confidence, Inspire with Unwavering Purpose',
    subline: 'Gain clarity, build resilience, and become the influential leader you were meant to be.',
    ctaText: 'Book a Call',
    ctaLink: '#discovery',
    order: 3,
  },
];

// Fallback data structure for when SLIDES array is empty (though it is hardcoded here)
const STATIC_FALLBACK = [
  {
    id: 'static1',
    type: 'image',
    url: 'https://placehold.co/1200x800/F97316/FFFFFF?text=Default+Content',
    badgeText: 'DEFAULT',
    headline: 'Welcome to Our Premium Content Platform',
    subline: 'Check back soon for exciting, personalized content updates.',
    ctaText: 'View Placeholder',
    ctaLink: '#',
    order: 1,
  },
];

const autoAdvanceDelay = 9000; // 9 seconds auto advance

// --- 2. Utility Components (Icons) ---

// Icon used in the CTA button (from the first design)
const ArrowRight = (props : React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

// Icons for manual navigation (from the second design, adapted to Lucide/inline SVG)
const ArrowLeftIcon = (props : React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"/>
  </svg>
);

// --- 3. Animation Variants ---
const contentVariants = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.6, staggerChildren: 0.2 } },
};

const itemVariants = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

// --- 4. Main Component ---
// const HeroSection = () => {
//   const [current, setCurrent] = useState(0);
//   const timeoutRef = useRef<NodeJS.Timeout | null>(null);

//   // Use primary data array, falling back to static if it somehow disappears
//   const slides = SLIDES.length > 0 ? SLIDES.sort((a, b) => a.order - b.order) : STATIC_FALLBACK;

//   // Function to advance or retreat the slide index
//   const advanceSlide = useCallback(
//     (direction: "next" | "prev") => {
//       setCurrent((prev) =>
//         direction === "next"
//           ? (prev + 1) % slides.length
//           : (prev - 1 + slides.length) % slides.length
//       );
//     },
//     [slides.length]
//   );

//   // Auto-advance logic (from the second design)
//   useEffect(() => {
//     if (timeoutRef.current) clearTimeout(timeoutRef.current);
//     timeoutRef.current = setTimeout(() => advanceSlide("next"), autoAdvanceDelay);
//     return () => {
//       if (timeoutRef.current) clearTimeout(timeoutRef.current);
//     };
//   }, [current, advanceSlide]);

//   const handleDotClick = (index: number) => {
//     setCurrent(index);
//   };

//   const handleImageError = (e : React.SyntheticEvent<HTMLImageElement, Event>) => {
//     e.currentTarget.onerror = null;
//     e.currentTarget.src = 'https://placehold.co/1200x800/CCCCCC/333333?text=Image+Not+Found';
//   };

//   const currentSlide = slides[current];

//   return (
//     // Note: The Tailwind configuration for 'animate-blob' and 'animation-delay-xxxx' 
//     // from the second example is assumed to be present in your global CSS config.
//     <div className="w-full h-screen bg-slate-950 text-white font-sans overflow-hidden relative">
      
//       {/* Background Media and Overlay (Using AnimatePresence from Block 1 and Media Check from Block 2) */}
//       <AnimatePresence initial={false}>
//         <motion.div
//           key={currentSlide.id}
//           className="absolute inset-0"
//           initial={{ opacity: 0, scale: 1.05 }}
//           animate={{ opacity: 1, scale: 1 }}
//           exit={{ opacity: 0, scale: 1.05 }}
//           transition={{ duration: 1.0 }}
//         >
//           {currentSlide.type === "image" ? (
//             <img
//               src={currentSlide.url}
//               alt={currentSlide.headline || 'Hero Image'}
//               className="w-full h-full object-cover"
//               onError={handleImageError}
//             />
//           ) : (
//             <video
//               src={currentSlide.url}
//               autoPlay
//               muted
//               loop
//               playsInline
//               className="w-full h-full object-cover"
//             />
//           )}

//           {/* Subtle gradient overlay to enhance text readability (from Block 1) */}
//           <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
//         </motion.div>
//       </AnimatePresence>

//       {/* Main Hero Content */}
//       <div className="relative z-10 w-full h-full flex flex-col justify-end items-start pb-20 px-4 sm:px-8 lg:px-16">
//         <motion.div
//           key={currentSlide.id + '-content'} // Key needed for content re-animation
//           variants={contentVariants}
//           initial="initial"
//           animate="animate"
//           className="max-w-4xl text-left"
//         >
//           {/* Badge Text (from Block 1) */}
//           <motion.span variants={itemVariants} className="px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wide bg-gradient-to-r from-cyan-500 to-indigo-500 shadow-lg">
//             {currentSlide.badgeText}
//           </motion.span>
          
//           {/* Headline (from Block 1) */}
//           <motion.h1 variants={itemVariants} className="mt-4 text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-sky-400 to-indigo-500">
//             {currentSlide.headline}
//           </motion.h1>
          
//           {/* Subline (from Block 1) */}
//           <motion.p variants={itemVariants} className="mt-4 text-lg sm:text-xl text-slate-300 max-w-2xl">
//             {currentSlide.subline}
//           </motion.p>
          
//           {/* CTA Button (from Block 1) */}
//           <motion.a
//             variants={itemVariants}
//             href={currentSlide.ctaLink}
//             className="group inline-flex items-center justify-center gap-2 px-8 py-4 mt-8 rounded-full text-lg font-semibold bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl"
//           >
//             {currentSlide.ctaText}
//             <ArrowRight />
//           </motion.a>
//         </motion.div>

//         {/* Carousel Navigation (Combining dots from Block 1 and manual arrows from Block 2) */}
//         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
          
//           {/* Previous Button */}
//           <button
//             onClick={() => advanceSlide("prev")}
//             className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition hidden sm:block"
//             aria-label="Previous Slide"
//           >
//             <ArrowLeftIcon className="h-5 w-5" />
//           </button>

//           {/* Dots (from Block 1) */}
//           <div className="flex gap-2">
//             {slides.map((_, index) => (
//               <button
//                 key={index}
//                 onClick={() => handleDotClick(index)}
//                 className={`h-2 rounded-full transition-all duration-300 ${
//                   index === current ? 'w-8 bg-white' : 'w-2 bg-slate-400 opacity-50 hover:bg-slate-300'
//                 }`}
//                 aria-label={`Go to slide ${index + 1}`}
//               />
//             ))}
//           </div>

//           {/* Next Button */}
//           <button
//             onClick={() => advanceSlide("next")}
//             className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition hidden sm:block"
//             aria-label="Next Slide"
//           >
//             <ArrowRight className="h-5 w-5" />
//           </button>
//         </div>
//       </div>
      
//       {/* Decorative background shapes (from Block 2, adapted colors) */}
//       <style jsx global>{`
//         @keyframes blob {
//           0% { transform: translate(0, 0) scale(1); }
//           33% { transform: translate(30px, -50px) scale(1.1); }
//           66% { transform: translate(-20px, 20px) scale(0.9); }
//           100% { transform: translate(0, 0) scale(1); }
//         }
//         .animate-blob {
//           animation: blob 7s infinite cubic-bezier(0.7, 0, 0.3, 1);
//         }
//         .animation-delay-2000 { animation-delay: 2s; }
//         .animation-delay-4000 { animation-delay: 4s; }
//       `}</style>
//       <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500 rounded-full mix-blend-lighten filter blur-3xl opacity-20 animate-blob"></div>
//       <div className="absolute bottom-20 right-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-lighten filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
//       <div className="absolute top-1/3 right-1/4 w-56 h-56 bg-teal-500 rounded-full mix-blend-lighten filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
//     </div>
//   );
// };

// export default HeroSection;
