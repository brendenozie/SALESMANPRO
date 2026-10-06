'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ShoppingCartIcon, PlusIcon } from '@heroicons/react/24/solid';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function ProductShowcaseSection() {
  const primaryColor = '#8B4513'; // Deep Roasted Brown
  const accentGold = '#F3A852'; // Golden Honey/Peanut tone
  const softCream = '#FAF7F2'; 

  // Scroll effect for parallax peanuts
  const { scrollYProgress } = useScroll();
  const yPeanut1 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const yPeanut2 = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <section className="relative py-24 bg-white overflow-hidden">
      {/* Decorative Parallax Peanuts */}
      <motion.div style={{ y: yPeanut1 }} className="absolute top-20 left-[10%] opacity-20 pointer-events-none z-0">
        <span className="text-6xl">🥜</span>
      </motion.div>
      <motion.div style={{ y: yPeanut2 }} className="absolute bottom-40 right-[5%] opacity-10 pointer-events-none z-0">
        <span className="text-8xl">🥜</span>
      </motion.div>

      <div className="container mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* LEFT SIDE: The "Hero" Jar & Organic Mask */}
          <div className="relative group">
            {/* The "Spread" Background Blob */}
            <motion.div 
              initial={{ scale: 0.8, rotate: -10, opacity: 0 }}
              whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "backOut" }}
              className="absolute inset-0 bg-amber-100/60 rounded-[4rem] rotate-3 -z-10 group-hover:rotate-6 transition-transform duration-700"
              style={{ clipPath: 'polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)' }}
            />

            {/* Main Product Image with subtle floating animation */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 drop-shadow-[0_35px_35px_rgba(139,69,19,0.25)] flex justify-center"
            >
              <Image decoding="async"
                src="https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?q=80&w=1000&auto=format&fit=crop"
                alt="Crunchy Peanut Butter"
                width={450}
                height={600}
                className="object-contain"
              />
            </motion.div>

            {/* Price Badge Overlay */}
            <motion.div 
               initial={{ scale: 0 }}
               whileInView={{ scale: 1 }}
               transition={{ type: 'spring', delay: 0.5 }}
               className="absolute top-10 right-10 w-24 h-24 rounded-full bg-[#3E2723] flex flex-col items-center justify-center text-white border-4 border-white shadow-xl z-20 -rotate-12"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Only</span>
              <span className="text-xl font-black">$3.99</span>
            </motion.div>
          </div>

          {/* RIGHT SIDE: Info Card & Content */}
          <div className="space-y-10">
            <div className="space-y-4">
              <motion.span 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="inline-block text-amber-600 font-black uppercase tracking-[0.3em] text-xs"
              >
                Signature Roast No. 12
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-6xl font-black text-[#3E2723] leading-none"
              >
                Extra Crunchy <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800">
                  Sea Salt Blend
                </span>
              </motion.h2>
            </div>

            {/* Ingredient Highlights */}
            <div className="flex flex-wrap gap-4">
              {['Non-GMO', 'Keto Friendly', 'Vegan'].map((tag, i) => (
                <div key={i} className="px-4 py-2 bg-stone-100 rounded-full text-[10px] font-black uppercase tracking-widest text-stone-500 border border-stone-200">
                  {tag}
                </div>
              ))}
            </div>

            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-stone-600 text-lg leading-relaxed max-w-lg"
            >
              We don&apos;t hide behind sugar. Our Extra Crunchy blend features slow-roasted peanuts, 
              a dash of sea salt, and absolutely zero palm oil. Taste the grit of quality.
            </motion.p>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Link
                href="/peanutecommerce/products"
                className="group w-full sm:w-auto flex items-center justify-between gap-10 px-8 py-5 bg-[#3E2723] rounded-2xl text-white font-black transition-all hover:shadow-2xl hover:-translate-y-1 active:scale-95 overflow-hidden relative"
              >
                <span className="relative z-10 uppercase tracking-widest text-sm">Add To Pantry</span>
                <div className="h-8 w-8 bg-amber-500 rounded-lg flex items-center justify-center relative z-10 group-hover:rotate-90 transition-transform">
                  <PlusIcon className="h-5 w-5 text-white" />
                </div>
                <div className="absolute inset-0 bg-amber-700 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Link>

              <button className="text-sm font-black uppercase tracking-widest text-stone-400 hover:text-amber-600 transition-colors underline underline-offset-8">
                View Nutrition Label
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}