"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid'; // Heroicons
import Image from 'next/image';

export default function ProfessionalTestimonials({ storeFormData }: any) {
  const [index, setIndex] = useState(0);
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#1e40af';

  const testimonials = storeFormData?.testimonials?.length > 0 ? storeFormData.testimonials : [
    { id: 1, authorName: "Emily R.", quote: "The strategic curriculum and mentorship provided here were pivotal in my transition to a senior engineering role.", authorRole: "Lead Software Engineer", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330" },
    { id: 2, authorName: "John D.", quote: "The rigorous academic standards and focus on measurable outcomes have fundamentally shifted my son's trajectory.", authorRole: "Corporate Executive", avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e" },
    { id: 3, authorName: "Sarah L.", quote: "An institutional environment that balances technical proficiency with global leadership frameworks.", authorRole: "Alumna, Oxford", avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80" },
  ];

  const current = testimonials[index];
  const next = () => setIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-32 bg-[#fafafa] relative overflow-hidden border-b border-gray-100">
      {/* Background Structural Grid Detail */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
           style={{ backgroundImage: `linear-gradient(to right, ${primaryColor} 1px, transparent 1px), linear-gradient(to bottom, ${primaryColor} 1px, transparent 1px)`, backgroundSize: '80px 80px' }} />

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Header: Institutional Alignment */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8 border-b border-gray-200 pb-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-400" />
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">Verification & Feedback</span>
            </div>
            <h2 className="text-5xl lg:text-7xl font-bold text-gray-900 tracking-tighter leading-none">
              Client <span className="text-gray-300 font-light italic">perspectives.</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className="w-4 h-4 text-gray-900" />
            ))}
            <span className="ml-3 text-xs font-black uppercase tracking-widest text-gray-900">4.9/5.0 Rated</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-0 border border-gray-200 bg-white shadow-2xl shadow-gray-200/50">
          
          {/* Left: Author Monolith (5 Columns) */}
          <div className="lg:col-span-5 relative bg-gray-900 min-h-[400px] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src={current.avatarUrl || `https://ui-avatars.com/api/?name=${current.authorName}`}
                  alt={current.authorName}
                  loader={({src})=>src}
                  fill
                  className="object-cover grayscale opacity-70 transition-all duration-700 hover:grayscale-0 hover:opacity-100"
                />
              </motion.div>
            </AnimatePresence>
            
            {/* Structural ID Label */}
            <div className="absolute bottom-0 left-0 bg-white p-8 border-r border-t border-gray-100 w-full max-w-[280px]">
              <h4 className="text-xl font-bold text-gray-900 tracking-tight mb-1">{current.authorName}</h4>
              <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: primaryColor }}>
                {current.authorRole || "Strategic Partner"}
              </p>
            </div>
          </div>

          {/* Right: The Testimony Block (7 Columns) */}
          <div className="lg:col-span-7 p-12 lg:p-20 flex flex-col justify-center relative">
            <div className="absolute top-10 right-10 opacity-[0.05] pointer-events-none">
              <span className="text-[12rem] font-serif leading-none">“</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="relative z-10"
              >
                <p className="text-2xl lg:text-4xl font-medium text-gray-800 leading-[1.4] mb-12 italic border-l-4 pl-10" style={{ borderColor: `${primaryColor}20` }}>
                  "{current.quote}"
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Navigation: Industrial Grade Controls */}
            <div className="flex items-center justify-between pt-12 border-t border-gray-100">
              <div className="flex items-center gap-8">
                <button 
                  onClick={prev}
                  className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <ChevronLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  Previous
                </button>
                <div className="w-[1px] h-4 bg-gray-200" />
                <button 
                  onClick={next}
                  className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
                >
                  Next
                  <ChevronRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              {/* Technical Pagination Status */}
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                  Record {index + 1} / {testimonials.length}
                </span>
                <div className="flex gap-1.5">
                  {testimonials.map((_ : any, i : number) => (
                    <div 
                      key={i}
                      className={`h-1 transition-all duration-300 ${i === index ? 'w-6 bg-gray-900' : 'w-1.5 bg-gray-200'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}