'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';

export default function MoriahTestimonials({ storeFormData }: any) {
  const [index, setIndex] = useState(0);
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#1e40af';

  const testimonials = storeFormData?.testimonials?.length > 0 ? storeFormData.testimonials : [
    { id: 1, authorName: "Emily R.", quote: "Joining this academy was the best decision for my career. The instructors are incredibly supportive.", authorRole: "Software Engineer", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330" },
    { id: 2, authorName: "John D.", quote: "My son's grades and confidence have soared since he started here. The personalized attention is unmatched.", authorRole: "Parent", avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e" },
    { id: 3, authorName: "Sarah L.", quote: "The vibrant community and extensive extracurriculars made my university experience unforgettable.", authorRole: "Alumna", avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80" },
  ];

  const current = testimonials[index];

  const next = () => setIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-32 bg-white relative overflow-hidden">
      {/* Aesthetic Background Quote Mark */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 select-none pointer-events-none">
        <span className="text-[20rem] font-black text-slate-50 opacity-[0.03] leading-none">“</span>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full mb-6"
          >
            <ChatBubbleLeftRightIcon className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Community Voices</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-light text-slate-900 tracking-tight">
            Trusted by <span className="font-semibold italic text-blue-600">thousands</span> of students.
          </h2>
        </div>

        <div className="max-w-5xl mx-auto relative">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            
            {/* Left: Big Feature Image / Avatar */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-64 h-64 md:w-80 md:h-80">
                {/* Decorative Rings */}
                <div className="absolute inset-0 border border-slate-100 rounded-full scale-125" />
                <div className="absolute inset-0 border border-slate-50 rounded-full scale-150" />
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 100 }}
                    className="relative w-full h-full rounded-[3rem] overflow-hidden shadow-2xl z-10"
                  >
                    <Image
                      src={current.avatarUrl || `https://ui-avatars.com/api/?name=${current.authorName}`}
                      alt={current.authorName}
                      loader={({src})=>src}
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                </AnimatePresence>
                
                {/* Floating Rating Badge */}
                <motion.div 
                   animate={{ y: [0, -10, 0] }}
                   transition={{ duration: 4, repeat: Infinity }}
                   className="absolute -bottom-6 -right-6 bg-white shadow-xl rounded-2xl p-4 z-20 flex items-center gap-2 border border-slate-50"
                >
                  <StarIcon className="w-5 h-5 text-amber-400" />
                  <span className="text-sm font-black text-slate-900">5.0</span>
                </motion.div>
              </div>
            </div>

            {/* Right: The Content */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <p className="text-2xl md:text-3xl font-light text-slate-700 leading-snug italic">
                    "{current.quote}"
                  </p>
                  
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 uppercase tracking-tighter">
                      {current.authorName}
                    </h4>
                    <p className="text-sm font-medium text-blue-600 tracking-widest uppercase mt-1">
                      {current.authorRole || "Student"}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Controls */}
              <div className="flex items-center gap-6 mt-12">
                <button 
                  onClick={prev}
                  className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all group"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                
                <div className="flex gap-2">
                  {testimonials.map((_: any, i: number) => (
                    <div 
                      key={i}
                      className={`h-1 transition-all duration-500 rounded-full ${i === index ? 'w-8 bg-blue-600' : 'w-2 bg-slate-200'}`}
                    />
                  ))}
                </div>

                <button 
                  onClick={next}
                  className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}