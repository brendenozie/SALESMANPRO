'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPinIcon,
  SunIcon,
  CloudIcon,
  ArrowLongRightIcon
} from '@heroicons/react/24/solid';
import Image from 'next/image';

// Fallback data in case the database is empty

const farmChapters = [
  {
    tag: "The Origin",
    badgeText: "The Origin",
    title: "Tuyia $ Highlands",
    description: "Nestled in the lush valleys of Laikipia, where the air is crisp and the pastures are endless. This is where the story begins.",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2000",
    imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2000",
    productImageUrl: "https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&q=80&w=2000",
    stats: { elevation: "2,100m", rainfall: "950mm" }
  },
  {
    tag: "The Ethics",
    badgeText: "The Ethics",
    title: "Pasture $ Raised",
    description: "Our livestock roams free, grazing on organic clover and Kikuyu grass. No shortcuts, no hormones—just nature's pace.",
    image: "https://images.unsplash.com/photo-1544965838-54ef8406f868?auto=format&fit=crop&q=80&w=2000",
    imageUrl: "https://images.unsplash.com/photo-1544965838-54ef8406f868?auto=format&fit=crop&q=80&w=2000",
    productImageUrl: "https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&q=80&w=2000",
    stats: { roaming: "Free", diet: "100% Grass" }
  },
  {
    tag: "The Craft",
    badgeText: "The Craft",
    title: "Master $ Butchery",
    description: "Every cut is hand-selected and dry-aged in our Himalayan salt cellar for unparalleled depth of flavor.",
    image: "https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&q=80&w=2000",
    imageUrl: "https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&q=80&w=2000",
    productImageUrl: "https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&q=80&w=2000",
    stats: { aging: "28 Days", grade: "Premium" }
  },
];

export default function TuyiaFarmImmersiveHero({ heroSlides = [] }) {
  const [active, setActive] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Safety: Ensure slides is always an array with at least one valid object
  const slides = (heroSlides && heroSlides.length > 0) ? heroSlides : farmChapters;
  const currentSlide = slides[active] || farmChapters[0];

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 12000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleMouseMove = (e: React.MouseEvent) => {
    // Parallax logic
    setMousePos({
      x: (e.clientX / window.innerWidth - 0.5) * 15,
      y: (e.clientY / window.innerHeight - 0.5) * 15,
    });
  };

  return (
    <section 
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full bg-[#080807] overflow-hidden flex flex-col justify-end lg:justify-center"
    >
      {/* BACKGROUND TYPOGRAPHY - Added defensive check */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-10">
        <motion.h1 
          animate={{ x: mousePos.x * -0.5, y: mousePos.y * -0.5 }}
          className="text-[40vw] font-black text-white/[0.02] uppercase leading-none tracking-tighter"
        >
          {currentSlide?.title?.split('$')[0] || "Pristine"}
        </motion.h1>
      </div>

      {/* DYNAMIC IMAGE CANVAS */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 0.6, scale: 1.02, x: mousePos.x, y: mousePos.y }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <Image 
            src={currentSlide?.image || currentSlide?.imageUrl || farmChapters[0].image} 
            alt={currentSlide?.title || "Hero Image"}
            loader={({ src }) => src} // Bypass loader for external URLs
            fill 
            className="object-cover"
            priority
            unoptimized // Bypasses production remotePattern errors if not configured
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080807] via-transparent to-[#080807]/40" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-30 container mx-auto px-6 lg:px-12 pb-20 lg:pb-0">
        <div className="max-w-5xl">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/20 lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none p-8 lg:p-0 rounded-[2rem]"
          >
            {/* Tagline */}
            <div className="flex items-center gap-3 mb-6">
               <div className="h-[2px] w-10 bg-red-600" />
               <span className="text-red-500 text-[10px] lg:text-xs font-black uppercase tracking-[0.4em]">
                 {currentSlide?.tag || currentSlide?.badgeText || 'Exclusive'}
               </span>
            </div>

            {/* Headline - CRASH FIXED with safe chaining and fallbacks */}
            <h2 className="text-[12vw] lg:text-[8rem] font-black text-white leading-[0.85] tracking-tighter mb-8 uppercase">
              {(currentSlide?.title || "Care $ Quality").split('$').map((word, i) => (
                <span key={i} className="block overflow-hidden">
                  <motion.span 
                    initial={{ y: "100%" }} animate={{ y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.8 }}
                    className={`block ${i === 1 ? "text-transparent italic font-serif" : ""}`}
                    style={i === 1 ? { WebkitTextStroke: '1px rgba(255,255,255,0.4)' } : {}}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </h2>

            <p className="text-stone-300 text-lg lg:text-2xl max-w-xl mb-12 font-medium leading-relaxed opacity-80">
              {currentSlide?.description}
            </p>

            {/* Stats - defensive mapping */}
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start lg:items-center">
              <button className="group relative w-full lg:w-auto flex items-center justify-center gap-6 bg-white px-10 py-6 rounded-full overflow-hidden transition-all active:scale-95">
                  <span className="relative z-10 text-black font-black text-xs uppercase tracking-widest">Explore More</span>
                  <ArrowLongRightIcon className="relative z-10 w-6 h-6 text-black group-hover:translate-x-2 transition-transform" />
                  <div className="absolute inset-0 bg-red-600 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500" />
              </button>

              <div className="flex gap-12 border-t lg:border-t-0 lg:border-l border-white/10 pt-8 lg:pt-0 lg:pl-16 w-full lg:w-auto">
                {Object.entries(currentSlide?.stats || {}).map(([key, value]) => (
                  <div key={key} className="flex flex-col">
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">{key}</span>
                    <span className="text-2xl lg:text-3xl font-black text-white italic tracking-tighter">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation Indicators */}
      <div className="absolute bottom-12 lg:left-12 lg:top-1/2 lg:-translate-y-1/2 z-50 flex lg:flex-col gap-4 w-full lg:w-auto justify-center px-6">
        {slides.map((_, i) => (
          <button 
            key={i}
            onClick={() => setActive(i)}
            className="group flex items-center gap-3"
          >
            <div className={`transition-all duration-500 rounded-full ${active === i ? 'w-12 lg:w-16 h-[2px] bg-red-600' : 'w-4 h-[2px] bg-white/20'}`} />
          </button>
        ))}
      </div>
    </section>
  );
}
// 'use client';

// import React, { useState, useEffect, useCallback } from 'react';
// import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
// import { 
//   MapPinIcon,
//   SunIcon,
//   CloudIcon,
//   ArrowLongRightIcon,
//   ChevronRightIcon
// } from '@heroicons/react/24/solid'; // Solid icons for better mobile visibility
// import Image from 'next/image';

// const farmChapters = [
//   {
//     tag: "The Origin",
//     badgeText: "The Origin",
//     title: "Tuyia $ Highlands",
//     description: "Nestled in the lush valleys of Laikipia, where the air is crisp and the pastures are endless. This is where the story begins.",
//     image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2000",
//     imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2000",
//     productImageUrl: "https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&q=80&w=2000",
//     stats: { elevation: "2,100m", rainfall: "950mm" }
//   },
//   {
//     tag: "The Ethics",
//     badgeText: "The Ethics",
//     title: "Pasture $ Raised",
//     description: "Our livestock roams free, grazing on organic clover and Kikuyu grass. No shortcuts, no hormones—just nature's pace.",
//     image: "https://images.unsplash.com/photo-1544965838-54ef8406f868?auto=format&fit=crop&q=80&w=2000",
//     imageUrl: "https://images.unsplash.com/photo-1544965838-54ef8406f868?auto=format&fit=crop&q=80&w=2000",
//     productImageUrl: "https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&q=80&w=2000",
//     stats: { roaming: "Free", diet: "100% Grass" }
//   },
//   {
//     tag: "The Craft",
//     badgeText: "The Craft",
//     title: "Master $ Butchery",
//     description: "Every cut is hand-selected and dry-aged in our Himalayan salt cellar for unparalleled depth of flavor.",
//     image: "https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&q=80&w=2000",
//     imageUrl: "https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&q=80&w=2000",
//     productImageUrl: "https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&q=80&w=2000",
//     stats: { aging: "28 Days", grade: "Premium" }
//   },
// ];

// export default function TuyiaFarmImmersiveHero({ heroSlides = [] }) {
//   const [active, setActive] = useState(0);
//   const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
//   const slides = heroSlides.length > 0 ? heroSlides : farmChapters;

//   // 1. AUTO-ADVANCE LOGIC
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setActive((prev) => (prev + 1) % slides.length);
//     }, 12000);
//     return () => clearInterval(timer);
//   }, [slides.length]);

//   // 2. MOUSE PARALLAX EFFECT (Desktop Only)
//   const handleMouseMove = (e: React.MouseEvent) => {
//     setMousePos({
//       x: (e.clientX / window.innerWidth - 0.5) * 20,
//       y: (e.clientY / window.innerHeight - 0.5) * 20,
//     });
//   };

//   return (
//     <section 
//       onMouseMove={handleMouseMove}
//       className="relative h-[100vh] w-full bg-[#080807] overflow-hidden flex flex-col justify-end lg:justify-center"
//     >
//       {/* BACKGROUND TYPOGRAPHY - Integrated into the space */}
//       <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-10">
//         <motion.h1 
//           animate={{ x: mousePos.x * -1, y: mousePos.y * -1 }}
//           className="text-[45vw] font-black text-white/[0.03] uppercase leading-none tracking-tighter"
//         >
//           {slides[active]?.title?.split('$')[0] || "Tuyia Heritage"}
//         </motion.h1>
//       </div>

//       {/* DYNAMIC IMAGE CANVAS - LARGER ON MOBILE */}
//       <AnimatePresence mode="wait">
//         <motion.div
//           key={active}
//           initial={{ opacity: 0, scale: 1.1 }}
//           animate={{ opacity: 0.7, scale: 1.05, x: mousePos.x, y: mousePos.y }}
//           exit={{ opacity: 0, scale: 1 }}
//           transition={{ duration: 1.5, ease: "easeOut" }}
//           className="absolute inset-0 z-0 h-[75vh] lg:h-full"
//         >
//           <Image 
//             src={slides[active]?.image || slides[active]?.imageUrl || slides[active]?.productImageUrl || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2000"} 
//             alt={slides[active]?.title || "Tuyia Heritage"}
//             fill 
//             className="object-cover"
//             priority
//             loader={({ src }) => src}
//           />
//           {/* Advanced Mobile Gradient: Fades image into the content card */}
//           <div className="absolute inset-0 bg-gradient-to-t from-[#080807] via-transparent to-[#080807]/50 lg:via-[#080807]/20" />
//           <div className="absolute inset-0 bg-gradient-to-r from-[#080807] via-transparent to-transparent hidden lg:block" />
//         </motion.div>
//       </AnimatePresence>

//       {/* DESKTOP TOP HUD */}
//       <div className="absolute top-16 right-12 z-40 hidden lg:flex items-center gap-8">
//         <div className="text-right">
//           <span className="text-[10px] font-black uppercase tracking-widest text-red-600 block">System Status</span>
//           <span className="text-sm font-bold text-white uppercase flex items-center gap-2">
//             <SunIcon className="w-4 h-4 text-red-500" /> Optimal Conditions
//           </span>
//         </div>
//         <div className="h-8 w-[1px] bg-white/20" />
//         <div className="text-right">
//           <span className="text-[10px] font-black uppercase tracking-widest text-red-600 block">Origin</span>
//           <span className="text-sm font-bold text-white uppercase flex items-center gap-2">
//             <MapPinIcon className="w-4 h-4 text-red-500" /> Laikipia, KE
//           </span>
//         </div>
//       </div>

//       {/* MAIN CONTENT AREA */}
//       <div className="relative z-30 container mx-auto px-6 lg:px-12 pb-12 lg:pb-0">
//         <div className="max-w-5xl">
//           <motion.div
//             key={active}
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//             className="bg-black/40 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none p-6 lg:p-0 rounded-3xl border border-white/5 lg:border-none"
//           >
//             {/* Chapter Tag */}
//             <div className="flex items-center gap-3 mb-4 lg:mb-8">
//                <motion.div 
//                  initial={{ width: 0 }} animate={{ width: 40 }}
//                  className="h-[2px] bg-red-600"
//                />
//                <span className="text-red-500 text-[10px] lg:text-xs font-black uppercase tracking-[0.4em]">
//                  {slides[active]?.tag || slides[active]?.badgeText || ''}
//                </span>
//             </div>

//             {/* Aggressive Headline: Scaled for Mobile Impact */}
//             <h2 className="text-[14vw] lg:text-[9rem] font-black text-white leading-[0.85] tracking-tighter mb-6 lg:mb-10 uppercase">
//               {slides[active]?.title?.split('$').map((word: string, i: number) => (
//                 <span key={i} className="block overflow-hidden">
//                   <motion.span 
//                     initial={{ y: "100%" }} animate={{ y: 0 }}
//                     transition={{ delay: i * 0.1, duration: 0.8 }}
//                     className={`block ${i === 1 ? "text-transparent italic font-serif" : ""}`}
//                     style={i === 1 ? { WebkitTextStroke: '1px rgba(255,255,255,0.5)' } : {}}
//                   >
//                     {word}
//                   </motion.span>
//                 </span>
//               ))}
//             </h2>

//             <p className="text-stone-300 text-base lg:text-2xl max-w-xl mb-8 lg:mb-12 font-medium leading-relaxed">
//               {slides[active]?.description}
//             </p>

//             {/* Actions & Stats Container */}
//             <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start lg:items-center">
//               <button className="group relative w-full lg:w-auto flex items-center justify-center lg:justify-start gap-6 bg-white px-8 lg:px-12 py-5 lg:py-6 rounded-full lg:rounded-2xl overflow-hidden transition-all hover:pr-14 active:scale-95">
//                   <span className="relative z-10 text-black font-black text-xs uppercase tracking-widest">Explore Heritage</span>
//                   <ArrowLongRightIcon className="relative z-10 w-6 h-6 text-black group-hover:translate-x-2 transition-transform" />
//                   <div className="absolute inset-0 bg-red-600 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500" />
//               </button>

//               <div className="grid grid-cols-2 gap-8 lg:flex lg:gap-16 border-t lg:border-t-0 lg:border-l border-white/10 pt-8 lg:pt-0 lg:pl-16 w-full lg:w-auto">
//                 {Object.entries(slides[active]?.stats || {}).map(([key, value]) => (
//                   <div key={key} className="flex flex-col">
//                     <span className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">{key}</span>
//                     <span className="text-2xl lg:text-4xl font-black text-white italic tracking-tighter">{value as string}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </div>

//       {/* NAVIGATION: Mobile (Bottom Center) / Desktop (Left Vertical) */}
//       <div className="absolute bottom-32 lg:bottom-auto lg:left-12 lg:top-1/2 lg:-translate-y-1/2 z-50 flex lg:flex-col gap-4 w-full lg:w-auto justify-center">
//         {slides.map((_, i) => (
//           <button 
//             key={i}
//             onClick={() => setActive(i)}
//             className="group flex items-center gap-3 p-2"
//           >
//             <div className={`transition-all duration-500 rounded-full ${active === i ? 'w-8 lg:w-14 h-[3px] bg-red-600' : 'w-2 lg:w-4 h-[3px] bg-white/20 group-hover:bg-white/50'}`} />
//             <span className={`text-[10px] font-black text-white uppercase tracking-widest hidden lg:block transition-opacity duration-500 ${active === i ? 'opacity-100' : 'opacity-0'}`}>
//               0{i + 1}
//             </span>
//           </button>
//         ))}
//       </div>

//       {/* BOTTOM TRUST BAR */}
//       <div className="absolute bottom-4 left-6 right-6 lg:left-12 lg:right-12 z-40 flex flex-row justify-between items-center border-t border-white/5 pt-8">
//         <div className="flex items-center gap-4 lg:gap-12">
//           <div className="flex items-center gap-3">
//              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-md">
//                <CloudIcon className="w-4 h-4 text-stone-400" />
//              </div>
//              <p className="text-[8px] lg:text-[10px] font-bold text-stone-500 uppercase tracking-widest leading-none hidden sm:block">
//                Certified <br /> <span className="text-white">Organic</span>
//              </p>
//           </div>
//           <div className="flex items-center gap-3">
//              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-md">
//                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
//              </div>
//              <p className="text-[8px] lg:text-[10px] font-bold text-stone-500 uppercase tracking-widest leading-none">
//                Live <br /> <span className="text-white">Traceable</span>
//              </p>
//           </div>
//         </div>

//         <div className="text-right hidden sm:block">
//            <p className="text-[9px] font-black text-stone-600 uppercase tracking-[0.4em]">{slides[active]?.badgeText || ''}</p>
//         </div>
//       </div>
//     </section>
//   );
// }