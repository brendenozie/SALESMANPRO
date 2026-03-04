'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { EnvelopeIcon, SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function MoriahCTA({ storeFormData }: any) {
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#1e40af';
  const accentColor = storeFormData?.themeSettings?.secondaryColor || '#FFC107';

  return (
    <section className="py-32 bg-white relative overflow-hidden">
      {/* Background Decorative Element: Soft Glowing Orb */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-10 pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-slate-900 rounded-[4rem] overflow-hidden shadow-2xl"
          >
            {/* Background Image with Parallax-like Overlay */}
            <div className="absolute inset-0">
              <Image
                src={storeFormData?.bannerUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f"}
                alt="CTA Background"
                loader={({src})=>src}
                fill
                className="object-cover opacity-30 grayscale"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/90 to-transparent" />
            </div>

            <div className="relative z-10 grid lg:grid-cols-2 items-center">
              
              {/* Left Side: The "Direct Action" */}
              <div className="p-12 lg:p-20 border-b lg:border-b-0 lg:border-r border-white/10">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 backdrop-blur-md rounded-full mb-8 border border-white/10">
                    <SparklesIcon className="w-4 h-4 text-blue-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Ready to begin?</span>
                  </div>
                  
                  <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-8">
                    Your future self <br />
                    <span className="text-blue-500 italic">will thank you.</span>
                  </h2>

                  <motion.button
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    className="group bg-blue-600 hover:bg-white text-white hover:text-slate-900 px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center gap-4 shadow-xl"
                  >
                    Explore Our Catalog
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </motion.div>
              </div>

              {/* Right Side: The "Community Connection" */}
              <div className="p-12 lg:p-20 bg-white/5 backdrop-blur-xl">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-2xl font-bold text-white mb-4">Stay in the loop.</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-10 max-w-sm">
                    Get exclusive first-access to new courses, educational insights, and community events delivered to your inbox.
                  </p>

                  <div className="relative group">
                    <input 
                      type="email" 
                      placeholder="Enter your email" 
                      className="w-full bg-slate-800/50 border border-white/10 rounded-2xl px-6 py-5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-white p-3 rounded-xl text-slate-900 hover:bg-blue-500 hover:text-white transition-all shadow-lg">
                      <EnvelopeIcon className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="mt-8 flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                          <Image src={storeFormData?.bannerUrl || `https://i.pravatar.cc/100?img=${i+10}`} alt="User" width={32} height={32} loader={({src})=>src} />
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Join 2,000+ Students
                    </p>
                  </div>
                </motion.div>
              </div>

            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}