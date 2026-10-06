'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLongRightIcon,
  SpeakerWaveIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';

const autoAdvanceDelay = 8000;

const loader = ({ src, width }: { src: string; width: number }) =>
  `${src}?w=${width}&q=75`;

export default function PremiumHeroSlider({ heroSlides, themeSettings }: any) {
  const primary = themeSettings?.primaryColor || '#1d4ed8';
  const secondary = themeSettings?.secondaryColor || '#f59e0b';

  const [current, setCurrent] = useState(0);

  const slides = heroSlides?.length
    ? heroSlides
    : [
        {
          subline: 'Limited Edition Release',
          headline: 'PURE SOUND. $UNFILTERED.',
          badgeText:
            'Experience Class 1 Bluetooth connectivity with 40-hour battery life. Engineered for the studio, built for the street.',
          imageUrl:
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
          ctaText: 'Explore the Series',
          ctaLink: '/earphonesecommerce/products'
        }
      ];

  useEffect(() => {
    const timer = setTimeout(
      () => setCurrent((prev) => (prev + 1) % slides.length),
      autoAdvanceDelay
    );
    return () => clearTimeout(timer);
  }, [current, slides.length]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white text-gray-900 dark:bg-[#050505] dark:text-white">
      {/* Ambient Orb */}
      <div
        className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-[120px] rounded-full opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${primary} 0%, transparent 70%)`
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial="initial"
            animate="animate"
            exit="exit"
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
          >
            {/* TEXT */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <motion.div
                variants={{
                  initial: { opacity: 0, x: -40 },
                  animate: { opacity: 1, x: 0 },
                  exit: { opacity: 0, x: -20 }
                }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="h-[2px] w-12"
                    style={{ backgroundColor: secondary }}
                  />
                  <span className="text-xs font-bold tracking-[0.3em] uppercase text-gray-500 dark:text-white/60">
                    {slides[current].subline}
                  </span>
                </div>

                <h2 className="text-5xl md:text-8xl font-black leading-[0.9] mb-8 tracking-tighter">
                  {slides[current].headline.split('$').map((part: string, i: number) => (
                    <span
                      key={i}
                      className={`block ${
                        i === 1
                          ? `
                            text-transparent
                            [-webkit-text-stroke:1.5px_#111827]
                            dark:[-webkit-text-stroke:1.5px_white]
                          `
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {part}
                    </span>
                  ))}
                </h2>

                <p className="text-lg max-w-md mb-10 leading-relaxed text-gray-600 dark:text-white/40">
                  {slides[current].badgeText}
                </p>

                <div className="flex flex-wrap gap-6 items-center">
                  <Link
                    href={slides[current].ctaLink}
                    className="px-8 py-4 rounded-full font-bold transition-transform hover:scale-105
                      bg-gray-900 text-white
                      dark:bg-white dark:text-black"
                  >
                    <span className="flex items-center gap-2">
                      {slides[current].ctaText}
                      <ArrowLongRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                    </span>
                  </Link>

                  <span className="text-sm text-gray-500 dark:text-white/60">
                    Trusted by Audiophiles
                  </span>
                </div>
              </motion.div>
            </div>

            {/* IMAGE */}
            <div className="lg:col-span-6 order-1 lg:order-2 relative">
              <motion.div
                variants={{
                  initial: { opacity: 0, scale: 0.85, rotate: -8 },
                  animate: { opacity: 1, scale: 1, rotate: 0 },
                  exit: { opacity: 0, scale: 1.1, rotate: 8 }
                }}
                transition={{ duration: 1 }}
                className="relative aspect-square"
              >
                <Image decoding="async"
                  src={slides[current].imageUrl}
                  alt="Product"
                  fill
                  priority
                  className="object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.35)]"
                />

                {/* BADGES */}
                <motion.div
                  animate={{ y: [0, -16, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute top-10 right-0 hidden md:block rounded-2xl p-4
                    backdrop-blur-md border
                    bg-white/70 border-black/10
                    dark:bg-white/10 dark:border-white/20"
                >
                  <BoltIcon className="w-6 h-6 mb-2 text-yellow-500" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">
                    Fast Charge
                  </p>
                  <p className="text-lg font-black">5 min = 2 hrs</p>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 16, 0] }}
                  transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                  className="absolute bottom-10 left-0 hidden md:block rounded-2xl p-4
                    backdrop-blur-md border
                    bg-white/70 border-black/10
                    dark:bg-white/10 dark:border-white/20"
                >
                  <SpeakerWaveIcon className="w-6 h-6 mb-2 text-blue-500" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">
                    Active ANC
                  </p>
                  <p className="text-lg font-black">-35dB</p>
                </motion.div>
              </motion.div>

              {/* BACKDROP TEXT */}
              <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] font-black tracking-tighter select-none text-black/[0.04] dark:text-white/[0.03]">
                AUDIO
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* SLIDE INDICATOR */}
        <div className="absolute bottom-12 left-6 flex gap-4 items-center">
          {slides.map((_: any, i: number) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="relative h-12 w-1 rounded-full overflow-hidden
                bg-black/10 dark:bg-white/10"
            >
              {i === current && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: '100%' }}
                  transition={{ duration: 8, ease: 'linear' }}
                  className="absolute inset-0 bg-black dark:bg-white"
                />
              )}
            </button>
          ))}
          <span className="text-xs font-mono text-gray-400 dark:text-white/20">
            0{current + 1} / 0{slides.length}
          </span>
        </div>
      </div>
    </section>
  );
}