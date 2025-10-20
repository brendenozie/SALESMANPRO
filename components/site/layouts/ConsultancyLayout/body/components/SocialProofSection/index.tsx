'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useStoreContext } from '@/contexts/StoreContext';

// Add this type augmentation if not already present
type StoreForm = {
  heroSlides?: { type: string; url: string; headline: string; subline: string }[];
  logos?: { src: string; alt: string }[];
  stats?: { label: string; value: number }[];
  themeSettings?: { primary: string };
  awards?: ({ title: string; year: number } | { [key: string]: any })[];
  metrics?: { name: string; value: number }[];
};

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const autoAdvanceDelay = 9000; // 9 seconds

export default function SocialProofSection() {
  const { storeFormData } = useStoreContext();

  // --- 🧩 Sample fallback data ---
  const sampleData = useMemo(
    () => ({
      heroSlides: [
        {
          type: 'image',
          url: '/coach-hero.jpg',
          headline: 'Unlock Your True Potential',
          subline:
            'Empowering ambitious individuals and teams to create a life of purpose, clarity, and success.',
        },
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=2670&auto=format&fit=crop',
          headline: 'Transform Your Vision into Action',
          subline:
            'Through strategic coaching and tailored consultation, I help you move from ideas to impact.',
        },
        {
          type: 'video',
          url: 'https://cdn.pixabay.com/video/2024/02/26/200827-919106201_large.mp4',
          headline: 'Lead with Confidence, Inspire with Purpose',
          subline: 'Gain clarity, build resilience, and become the leader you were meant to be.',
        },
      ],
      logos: [
        { src: '/logo-forbes.svg', alt: 'Forbes' },
        { src: '/logo-tedx.svg', alt: 'TEDx' },
        { src: '/logo-inc.svg', alt: 'Inc.' },
        { src: '/logo-entrepreneur.svg', alt: 'Entrepreneur' },
        { src: '/logo-bloomberg.svg', alt: 'Bloomberg' },
      ],
      stats: [
        { label: 'Clients Coached', value: 10000 },
        { label: 'Talks Delivered', value: 50 },
        { label: 'Years of Experience', value: 15 },
      ],
      themeSettings: {
        primary: '#EA580C', // orange-600
      },
      awards: [
        { title: 'Best Coaching Award', year: 2020 },
        { title: 'Leadership Excellence', year: 2021 },
      ],
      metrics: [
        { name: 'Client Satisfaction', value: 95 },
        { name: 'Project Success Rate', value: 90 },
      ],
    }),
    []
  );

  // --- ✅ Merge with real data ---
  const {
    heroSlides = sampleData.heroSlides,
    logos = sampleData.logos,
    stats: rawStats = sampleData.stats,
    awards = sampleData.awards,
    metrics = sampleData.metrics,
    themeSettings = sampleData.themeSettings,
  } : any = storeFormData || sampleData;

  // --- 🧠 Ensure at least 3 stats ---
  const stats = useMemo(() => {
    let filledStats = (rawStats || []).map((stat: any, i: number) => ({
      label: stat.label ?? `Stat ${i + 1}`,
      value: typeof stat.value === 'number' ? stat.value : Number(stat.value) || 0,
    }));

    if (filledStats.length < 3) {
      // Pull some from awards
      const awardFallbacks = (awards || [])
        .slice(0, 3 - filledStats.length)
        .map((a : { title: string; year: number }, i: number) => ({
          label: a.title || `Award ${i + 1}`,
          value: 'year' in a && typeof a.year === 'number' ? a.year : new Date().getFullYear(),
        }));

      // Then from metrics
      const metricFallbacks = (metrics || [])
        .slice(0, 3 - (filledStats.length + awardFallbacks.length))
        .map((m : { name: string; value: number }, i: number) => ({
          label: typeof m === 'object' && 'name' in m && typeof m.name === 'string' ? m.name : `Metric ${i + 1}`,
          value: typeof m.value === 'number' ? m.value : Number(m.value) || Math.floor(Math.random() * 1000),
        }));

      filledStats = [...filledStats, ...awardFallbacks, ...metricFallbacks];
    }

    // Add placeholder samples if still less than 3
    if (filledStats.length < 3) {
      const placeholders = Array.from({ length: 3 - filledStats.length }).map((_, i) => ({
        label: `Sample Stat ${i + 1}`,
        value: Math.floor(Math.random() * 1000),
      }));
      filledStats = [...filledStats, ...placeholders];
    }

    return filledStats.slice(0, 3);
  }, [rawStats, awards, metrics]);

  // --- 🖼️ Auto-slide logic ---
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const advanceSlide = useCallback(
    (direction: 'next' | 'prev') => {
      setCurrent((prev) =>
        direction === 'next'
          ? (prev + 1) % heroSlides.length
          : (prev - 1 + heroSlides.length) % heroSlides.length
      );
    },
    [heroSlides.length]
  );

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => advanceSlide('next'), autoAdvanceDelay);
    return () => clearTimeout(timeoutRef.current!);
  }, [current, advanceSlide]);

  const primaryColor = themeSettings?.primary || '#EA580C';

  // --- 💎 UI ---
  return (
    <section className="relative py-20 bg-gradient-to-b from-white via-orange-50 to-white overflow-hidden">
      {/* Floating shapes */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-orange-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="container relative z-10 mx-auto px-6 text-center">
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true }}
        >
          <span
            className="inline-block uppercase font-semibold tracking-wide text-sm mb-3"
            style={{ color: primaryColor }}
          >
            Recognition & Impact
          </span>
          <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Trusted by{' '}
            <span style={{ color: primaryColor }}>
              Leaders, Innovators, and Visionaries
            </span>
          </h3>
          <p className="max-w-2xl mx-auto text-lg text-gray-600 mb-12">
            Over the years, I’ve partnered with renowned brands, appeared on major platforms,
            and helped individuals reach new levels of professional and personal excellence.
          </p>
        </motion.div>

        {/* Logos */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-10 items-center justify-items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ staggerChildren: 0.15, delayChildren: 0.3 }}
          viewport={{ once: true }}
        >
          {logos.map((logo: { src: string; alt: string }, idx: number) => (
            <motion.div
              key={idx}
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              whileHover={{ scale: 1.08, rotate: 1 }}
              className="grayscale hover:grayscale-0 transition-all duration-300"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={120}
                height={60}
                loader={loader}
                className="h-10 md:h-12 opacity-80 hover:opacity-100 transition-opacity"
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          className="mt-16 flex flex-wrap justify-center gap-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          viewport={{ once: true }}
        >
          {stats.map((stat : { label: string; value: number }, i: number) => (
            <div key={i}>
              <h4 className="text-4xl font-extrabold" style={{ color: primaryColor }}>
                +{Number(stat.value).toLocaleString()}
              </h4>
              <p className="text-gray-700 font-medium">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}



// 'use client';

// import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import Image from 'next/image';
// import { ArrowRightIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
// import { useStoreContext } from '@/contexts/StoreContext'; // ✅ for live data if available

// const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
//   `${src}?w=${width}&q=${quality || 75}`;

// const autoAdvanceDelay = 9000; // 9 seconds

// export default function SocialProofSection() {
//   const { storeFormData } = useStoreContext();

//   // --- 🧩 Sample fallback data ---
//   const sampleData = useMemo(
//     () => ({
//       heroSlides: [
//         {
//           type: 'image',
//           url: '/coach-hero.jpg',
//           headline: 'Unlock Your True Potential',
//           subline:
//             'Empowering ambitious individuals and teams to create a life of purpose, clarity, and success.',
//         },
//         {
//           type: 'image',
//           url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=2670&auto=format&fit=crop',
//           headline: 'Transform Your Vision into Action',
//           subline:
//             'Through strategic coaching and tailored consultation, I help you move from ideas to impact.',
//         },
//         {
//           type: 'video',
//           url: 'https://cdn.pixabay.com/video/2024/02/26/200827-919106201_large.mp4',
//           headline: 'Lead with Confidence, Inspire with Purpose',
//           subline:
//             'Gain clarity, build resilience, and become the leader you were meant to be.',
//         },
//       ],
//       logos: [
//         { src: '/logo-forbes.svg', alt: 'Forbes' },
//         { src: '/logo-tedx.svg', alt: 'TEDx' },
//         { src: '/logo-inc.svg', alt: 'Inc.' },
//         { src: '/logo-entrepreneur.svg', alt: 'Entrepreneur' },
//         { src: '/logo-bloomberg.svg', alt: 'Bloomberg' },
//       ],
//       stats: [
//         { label: 'Clients Coached', value: 10000 },
//         { label: 'Talks Delivered', value: 50 },
//         { label: 'Years of Experience', value: 15 },
//       ],
//       themeSettings: {
//         primary: '#EA580C', // orange-600
//       },
//     }),
//     []
//   );

//   // --- ✅ Merge data from context or sample fallback ---
//   const {
//     heroSlides = sampleData.heroSlides,
//     logos = sampleData.logos,
//     stats = sampleData.stats,
//     themeSettings = sampleData.themeSettings,
//   } = storeFormData || sampleData;

//   const [current, setCurrent] = useState(0);
//   const timeoutRef = useRef<NodeJS.Timeout | null>(null);

//   const advanceSlide = useCallback(
//     (direction: 'next' | 'prev') => {
//       setCurrent((prev) =>
//         direction === 'next'
//           ? (prev + 1) % heroSlides.length
//           : (prev - 1 + heroSlides.length) % heroSlides.length
//       );
//     },
//     [heroSlides.length]
//   );

//   useEffect(() => {
//     if (timeoutRef.current) clearTimeout(timeoutRef.current);
//     timeoutRef.current = setTimeout(() => advanceSlide('next'), autoAdvanceDelay);
//     return () => clearTimeout(timeoutRef.current!);
//   }, [current, advanceSlide]);

//   const primaryColor = themeSettings?.primary || '#EA580C';

//   // --- 💎 UI ---
//   return (
//     <section className="relative py-20 bg-gradient-to-b from-white via-orange-50 to-white overflow-hidden">
//       {/* Floating shapes */}
//       <div className="absolute inset-0">
//         <div className="absolute top-10 left-10 w-32 h-32 bg-orange-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse"></div>
//         <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse animation-delay-2000"></div>
//       </div>

//       <div className="container relative z-10 mx-auto px-6 text-center">
//         {/* Intro Text */}
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8, ease: 'easeOut' }}
//           viewport={{ once: true }}
//         >
//           <span
//             className="inline-block uppercase font-semibold tracking-wide text-sm mb-3"
//             style={{ color: primaryColor }}
//           >
//             Recognition & Impact
//           </span>
//           <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
//             Trusted by{' '}
//             <span style={{ color: primaryColor }}>
//               Leaders, Innovators, and Visionaries
//             </span>
//           </h3>
//           <p className="max-w-2xl mx-auto text-lg text-gray-600 mb-12">
//             Over the years, I’ve partnered with renowned brands, appeared on major platforms,
//             and helped individuals reach new levels of professional and personal excellence.
//           </p>
//         </motion.div>

//         {/* Logos */}
//         <motion.div
//           className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-10 items-center justify-items-center"
//           initial={{ opacity: 0 }}
//           whileInView={{ opacity: 1 }}
//           transition={{ staggerChildren: 0.15, delayChildren: 0.3 }}
//           viewport={{ once: true }}
//         >
//           {logos.map((logo : { src: string; alt: string }, idx : number) => (
//             <motion.div
//               key={idx}
//               initial={{ scale: 0.8, opacity: 0 }}
//               whileInView={{ scale: 1, opacity: 1 }}
//               transition={{ duration: 0.6, ease: 'easeOut' }}
//               whileHover={{ scale: 1.08, rotate: 1 }}
//               className="grayscale hover:grayscale-0 transition-all duration-300"
//             >
//               <Image
//                 src={logo.src}
//                 alt={logo.alt}
//                 width={120}
//                 height={60}
//                 loader={loader}
//                 className="h-10 md:h-12 opacity-80 hover:opacity-100 transition-opacity"
//               />
//             </motion.div>
//           ))}
//         </motion.div>

//         {/* Stats / Counters */}
//         <motion.div
//           className="mt-16 flex flex-wrap justify-center gap-10 text-center"
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.3, duration: 0.8 }}
//           viewport={{ once: true }}
//         >
//           {stats && stats.map((stat, i) => (
//             <div key={i}>
//               <h4
//                 className="text-4xl font-extrabold"
//                 style={{ color: primaryColor }}
//               >
//                 +{stat.value.toLocaleString()}
//               </h4>
//               <p className="text-gray-700 font-medium">{stat.label}</p>
//             </div>
//           ))}
//         </motion.div>
//       </div>
//     </section>
//   );
// }
