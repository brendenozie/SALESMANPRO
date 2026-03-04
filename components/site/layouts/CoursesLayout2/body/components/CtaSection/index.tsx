"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { EnvelopeIcon, SparklesIcon, ArrowRightIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { AcademicCapIcon } from '@heroicons/react/24/solid'; // Heroicons
import Image from 'next/image';

export default function ProfessionalCTA({ storeFormData }: any) {
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#1e40af';

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Structural Detail */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gray-50 -z-10" />
      
      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gray-900 border border-gray-800 shadow-[40px_40px_0px_rgba(0,0,0,0.05)]"
        >
          <div className="grid lg:grid-cols-12 items-stretch">
            
            {/* Left Side: The Executive Invitation (7 Columns) */}
            <div className="lg:col-span-7 p-10 lg:p-20 relative overflow-hidden">
              {/* Subtle Texture Overlay */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" 
                   style={{ backgroundImage: `radial-gradient(${primaryColor} 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="relative z-10"
              >
                <div className="flex items-center gap-3 mb-10">
                  <AcademicCapIcon className="w-5 h-5 text-white" />
                  <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500">Admissions 2026/27</span>
                </div>
                
                <h2 className="text-5xl lg:text-7xl font-bold text-white leading-[0.9] tracking-tighter mb-10">
                  Secure your place in the <br />
                  <span className="text-gray-500 italic font-light">next cohort.</span>
                </h2>

                <div className="flex flex-wrap items-center gap-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group bg-white text-gray-900 px-12 py-5 text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-4"
                  >
                    Apply for Admission
                    <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </motion.button>
                  
                  <div className="flex items-center gap-3 text-gray-500 border-l border-gray-800 pl-8">
                    <ShieldCheckIcon className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Verified Institution</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Side: The Briefing Subscription (5 Columns) */}
            <div className="lg:col-span-5 p-10 lg:p-20 bg-white/5 backdrop-blur-sm border-l border-gray-800 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-xl font-bold text-white mb-4 tracking-tight">Executive Briefing</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-10 font-medium">
                  Receive quarterly curriculum updates, institutional reports, and strategic academic insights directly.
                </p>

                <div className="relative border-b border-gray-700 pb-2 group focus-within:border-white transition-colors">
                  <input 
                    type="email" 
                    placeholder="Professional Email Address" 
                    className="w-full bg-transparent py-3 text-white placeholder:text-gray-700 focus:outline-none text-sm"
                  />
                  <button className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                    <EnvelopeIcon className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="mt-10 flex items-center gap-5">
                  <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-10 h-10 border-2 border-gray-900 overflow-hidden grayscale contrast-125">
                        <Image 
                          src={`https://i.pravatar.cc/100?img=${i+10}`} 
                          alt="Candidate" 
                          width={40} 
                          height={40} 
                          loader={({src})=>src} 
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">
                    Joined by 2.4k+ Professionals
                  </p>
                </div>
              </motion.div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}