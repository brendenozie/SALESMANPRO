'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function MotoFeatureSection() {
  const nitroRed = '#E63946'; // High-performance red
  const asphaltBlack = '#0F0F0F';

  const sectionData = {
    tag: "Unleash the Beast",
    title: "dominate the asphalt with pure power",
    description: "From the roaring highways to the rugged terrain of the Rift, our machines are built for the bold. Precision-engineered engines meets uncompromising durability.",
    subDescription: "Every bike is a masterpiece of combustion and chrome. With 24/7 service support and genuine parts, we don't just provide a ride—we provide the freedom of the open road.",
    ctaText: "Choose Your Ride",
    ctaLink: "/motorcycleecommerce/products",
    imageUrl: "https://images.unsplash.com/photo-1558981403-c5f91cbba527?auto=format&fit=crop&w=1200&q=80", 
  };

  return (
    <section className="bg-zinc-50 dark:bg-[#080808] py-24 lg:py-40 overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
          
          {/* IMAGE PANEL - The "Garage" Aesthetic */}
          <motion.div 
            initial={{ opacity: 0, x: -60, rotateY: 10 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:w-1/2 relative aspect-[4/5] rounded-[2rem] overflow-hidden group perspective-1000 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]"
          >
            <Image
              src={sectionData.imageUrl}
              alt="Custom Heavyweight Cruiser"
              fill
              className="object-cover transition-transform duration-[2s] group-hover:scale-110"
              loader={loader}
            />
            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/20 to-transparent" />
            
            {/* Technical Spec HUD Overlay */}
            <div className="absolute top-10 right-10 flex flex-col items-end">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl">
                 <p className="text-[10px] font-black uppercase tracking-widest text-[#E63946]">Engine Displacement</p>
                 <p className="text-3xl font-black text-white italic">1200<span className="text-sm">CC</span></p>
              </div>
            </div>

            {/* Floating "In Stock" Badge */}
            <div className="absolute bottom-10 left-10 flex items-center gap-3 bg-[#E63946] px-6 py-3 rounded-full">
               <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
               <span className="text-[10px] font-black text-white uppercase tracking-widest">Available in Nairobi</span>
            </div>
          </motion.div>

          {/* CONTENT PANEL - Aggressive & Bold */}
          <div className="w-full lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-[#E63946] text-xs font-black uppercase tracking-[0.5em] mb-8 block">
                {sectionData.tag}
              </span>
              <h2 className="text-6xl md:text-8xl font-black text-zinc-900 dark:text-white leading-[0.8] uppercase tracking-tighter mb-10">
                {sectionData.title.split(' ').map((word, i) => (
                  <span key={i} className={i % 2 !== 0 ? "text-zinc-200 dark:text-zinc-800" : ""}>
                    {word}{' '}
                  </span>
                ))}
              </h2>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-6 text-zinc-500 dark:text-zinc-400 text-xl leading-relaxed max-w-xl mb-12"
            >
              <p className="font-medium">{sectionData.description}</p>
              <p className="text-sm opacity-70 italic border-l-4 border-[#E63946] pl-6 font-light">
                {sectionData.subDescription}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-6"
            >
              <Link
                href={sectionData.ctaLink}
                className="group relative overflow-hidden bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black uppercase tracking-widest text-xs px-14 py-7 rounded-lg transition-all"
              >
                <span className="relative z-10 flex items-center gap-3">
                   {sectionData.ctaText}
                   <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-[#E63946] -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
              </Link>

              <button className="px-10 py-7 border-2 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-black uppercase tracking-widest text-xs rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                Book Test Ride
              </button>
            </motion.div>
          </div>

        </div>
      </div>
      
      {/* Background Speed Typography */}
      <div className="absolute -bottom-10 left-0 right-0 overflow-hidden whitespace-nowrap opacity-[0.02] pointer-events-none select-none">
         <p className="text-[20rem] font-black uppercase italic leading-none">
           THROTTLE • POWER • MOTO DUKA • BOLD • SPEED • 
         </p>
      </div>
    </section>
  );
}