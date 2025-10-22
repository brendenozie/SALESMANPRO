/**
 * HeroSection.jsx
 *
 * This component implements a fully responsive, auto-advancing carousel
 * using React and Framer Motion, matching the light-theme design.
 * It now correctly integrates a mock of 'useStoreContext' to load dynamic data.
 */
"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStoreContext } from '@/contexts/StoreContext'; // Replaced by mock below

// --------------------------------------------------
// 1. MOCK UTILITIES (Replaces External Imports)
// --------------------------------------------------

// A. Inline Icons (Replaces @heroicons/react)
const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
  </svg>
);

const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
  </svg>
);

// B. MOCK for useStoreContext (Activated for single-file environment)
// const useStoreContext = () => {
//   // Data simulating what the context would provide
//   const storeData = {
//     storeFormData: {
//       // Data will load these slides if the component is mounted correctly.
//       heroSlides: [
//         {
//           type: "image",
//           url: "https://images.unsplash.com/photo-1579783902672-88d07018a1a4?q=80&w=2670&auto=format&fit=crop",
//           headline: "Design Your Success Blueprint",
//           subline: "We combine data science and creative strategy to architect scalable growth for your business.",
//         },
//         {
//           type: "image",
//           url: "https://images.unsplash.com/photo-1542435503-914c622b8ea7?q=80&w=2670&auto=format&fit=crop",
//           headline: "Ignite Digital Transformation",
//           subline: "Navigate the complexity of modern markets with bespoke technology and mindset coaching.",
//         },
//       ],
//     },
//   };
//   return storeData;
// };

// --------------------------------------------------
// 2. DATA (Fallback used when context is empty)
// --------------------------------------------------

const LOCAL_FALLBACK_SLIDES = [
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2670&auto=format&fit=crop",
    headline: "Unlock Your True Potentiall",
    subline:
      "Empowering ambitious individuals and teams to create a life of purpose, clarity, and success.",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=2670&auto=format&fit=crop",
    headline: "Transform Your Vision into Action",
    subline:
      "Through strategic coaching and tailored consultation, I help you move from ideas to impact.",
  },
  {
    type: "video",
    url: "https://cdn.pixabay.com/video/2024/02/26/200827-919106201_large.mp4",
    headline: "Lead with Confidence, Inspire with Purpose",
    subline:
      "Gain clarity, build resilience, and become the leader you were meant to be.",
  },
];

const autoAdvanceDelay = 9000; // 9 seconds

// --------------------------------------------------
// 3. MAIN COMPONENT (With Data Integration)
// --------------------------------------------------

const HeroSection = () => {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // CORE INTEGRATION: Using the (mocked) context hook
  const { storeFormData } = useStoreContext() || {};
  const { heroSlides } = storeFormData || {};

  // DATA RESOLUTION: Use dynamic data if available, otherwise use the local fallback
  const slides = heroSlides && (Array.isArray(heroSlides) && heroSlides.length > 0)
    ? heroSlides
    : LOCAL_FALLBACK_SLIDES;

  const advanceSlide = useCallback(
    (direction: "next" | "prev") => {
      setCurrent((prev) =>
        direction === "next"
          ? (prev + 1) % slides.length
          : (prev - 1 + slides.length) % slides.length
      );
    },
    [slides.length] // Dependency on slides.length is crucial for correct modulo arithmetic
  );

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => advanceSlide("next"), autoAdvanceDelay);
    
    return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [current, advanceSlide, slides.length]); 

  const handleDotClick = (index: number) => {
    setCurrent(index);
  };
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = 'https://placehold.co/2670x1780/D1D5DB/1F2937?text=Image+Load+Error';
    e.currentTarget.alt = 'Image Load Error Placeholder';
  };
  
  // Ensure we always have a current slide, even if slides is empty (shouldn't happen with fallback)
  // Use a concrete fallback element and `any` typing to avoid type union issues coming from external `HeroSlide` types.
  const currentSlide: any = slides[current] || LOCAL_FALLBACK_SLIDES[0];

  return (
    <section id="hero" className="relative overflow-hidden h-screen flex items-center justify-center bg-white">
      
      {/* Background media with Framer Motion transitions */}
      <AnimatePresence initial={false}>
        <motion.div
          key={current}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
        >
          {currentSlide.type === "image" ? (
            <img
              src={currentSlide.url}
              alt={currentSlide.headline}
              loading="eager"
              onError={handleImageError}
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              src={currentSlide.url}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
              poster="https://placehold.co/2670x1780/D1D5DB/1F2937?text=Video+Loading"
            />
          )}
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content - Added pt-20 for mobile clearance and pb-12 for bottom padding */}
      <div className="relative z-10 text-center max-w-3xl px-6 pt-20 pb-12 md:py-0">
        <motion.span
          key={current + '-span'}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg font-semibold text-orange-700 uppercase tracking-wide mb-3 block"
        >
          Your Partner in Growth
        </motion.span>

        <motion.h1
          key={current + '-h1'}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          // Adjusted headline size for better mobile fit: text-4xl on default/mobile screens
          className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight"
        >
          {/* Headline parsing logic preserved: colorizing the last part */}
          {currentSlide.headline?.split(" ").slice(0, 3).join(" ")}{" "}
          <span className="text-orange-600">
            {currentSlide.headline?.split(" ").slice(3).join(" ")}
          </span>
        </motion.h1>

        <motion.p
          key={current + '-p'}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-6 text-xl text-gray-700 max-w-2xl mx-auto"
        >
          {currentSlide.subline}
        </motion.p>

        {/* Call to Action Buttons */}
        <motion.div
          key={current + '-cta'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
        >
          <a
            href="#contact"
            className="inline-flex items-center justify-center px-10 py-5 bg-orange-600 text-white font-bold rounded-full shadow-lg hover:bg-orange-700 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 text-lg"
          >
            Book a Free Discovery Call
            <ArrowRightIcon className="w-6 h-6 ml-3" />
          </a>
          <a
            href="#services"
            className="inline-flex items-center justify-center px-10 py-5 bg-white text-orange-600 font-bold rounded-full shadow-lg border border-orange-200 hover:bg-orange-50 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 text-lg"
          >
            Explore Services
          </a>
        </motion.div>
      </div>

      {/* Slide navigation controls */}
      <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center gap-4 z-20">
        <button
          onClick={() => advanceSlide("prev")}
          className="p-3 rounded-full bg-white/50 hover:bg-white/70 text-gray-800 backdrop-blur-sm transition"
          aria-label="Previous slide"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div className="flex gap-2">
          {slides.map((_, idx) => (
            <div
              key={idx}
              onClick={() => handleDotClick(idx)}
              className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
                idx === current ? "bg-orange-600 scale-110" : "bg-gray-400"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
        <button
          onClick={() => advanceSlide("next")}
          className="p-3 rounded-full bg-white/50 hover:bg-white/70 text-gray-800 backdrop-blur-sm transition"
          aria-label="Next slide"
        >
          <ArrowRightIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Decorative background shapes (CSS is inline for single file) */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite cubic-bezier(0.7, 0, 0.3, 1);
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
      {/* Animated blobs for a modern, subtle background effect */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/3 right-1/4 w-56 h-56 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
    </section>
  );
};

export default HeroSection;
