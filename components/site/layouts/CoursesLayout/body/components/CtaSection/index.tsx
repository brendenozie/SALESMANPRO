"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon, 
  SparklesIcon, 
  ArrowRightIcon,
  CheckBadgeIcon 
} from '@heroicons/react/24/solid'; // Solid icons for high impact
import Image from 'next/image';
import { useStoreContext } from '@/contexts/StoreContext';
import clsx from 'clsx';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => 
  `${src}?w=${width}&q=${quality || 75}`;

export default function CtaSection() {
  const { storeFormData } = useStoreContext();

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121';
  const accentColor = storeFormData?.themeSettings?.secondaryColor || '#FFC107';

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950 overflow-hidden">
      
      {/* 1. Background Layer: Subtle Mesh & Depth */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" style={{ backgroundColor: `${primaryColor}15` }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" style={{ backgroundColor: `${accentColor}15` }} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="relative rounded-[3rem] overflow-hidden shadow-2xl bg-gray-900">
          
          {/* 2. Content Container */}
          <div className="relative z-20 grid lg:grid-cols-2 min-h-[600px]">
            
            {/* Left Side: The "Atmosphere" */}
            <div className="relative h-full min-h-[300px] lg:min-h-0 overflow-hidden">
              <Image
                src={storeFormData?.bannerUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671"}
                alt="Academy Life"
                fill
                loader={loader}
                className="object-cover transition-transform duration-1000 hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/40 to-transparent" />
              
              <div className="absolute inset-0 p-12 flex flex-col justify-end">
                <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   className="space-y-4"
                >
                  <div className="flex items-center gap-2 text-white/80">
                    <CheckBadgeIcon className="w-5 h-5 text-green-400" />
                    <span className="text-xs font-bold uppercase tracking-widest">Verified Excellence</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white leading-tight">
                    {storeFormData?.name || "EduLearn"} <br />
                    <span className="text-white/60 font-light italic">Global Community.</span>
                  </h3>
                </motion.div>
              </div>
            </div>

            {/* Right Side: The "Action" */}
            <div className="bg-gray-900 p-10 lg:p-16 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
                  <SparklesIcon className="w-4 h-4" style={{ color: accentColor }} />
                  <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Limited Enrollment for 2026</span>
                </div>

                <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-[1.1]">
                  Ready to <span style={{ color: primaryColor }}>Transform</span> Your Career?
                </h2>

                <p className="text-gray-400 text-lg mb-10 font-light leading-relaxed">
                  Join {storeFormData?.name || "our academy"} and get access to industry-leading mentors and a curriculum built for the future.
                </p>

                {/* Unified CTA & Newsletter */}
                <div className="space-y-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-5 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-3 shadow-xl transition-all"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Get Started Now
                    <ArrowRightIcon className="w-5 h-5" />
                  </motion.button>

                  <div className="relative group">
                    <input 
                      type="email"
                      placeholder="Enter your email for updates..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white outline-none focus:ring-2 transition-all"
                      style={{ ['--tw-ring-color' as any]: primaryColor }}
                    />
                    <button 
                      className="absolute right-2 top-2 bottom-2 px-6 rounded-xl text-gray-900 font-bold text-sm transition-all hover:opacity-90"
                      style={{ backgroundColor: accentColor }}
                    >
                      Join List
                    </button>
                  </div>
                  
                  <p className="text-center lg:text-left text-[10px] text-gray-500 uppercase tracking-widest">
                    No spam. Only high-value insights.
                  </p>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}