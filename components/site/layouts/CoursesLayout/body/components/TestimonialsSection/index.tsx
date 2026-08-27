"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid'; // Using Hero Icons as requested
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => 
  `${src}?w=${width}&q=${quality || 75}`;

export default function TestimonialSection({ storeFormData }: any) {
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#1e3a8a';
  const accentColor = storeFormData?.themeSettings?.secondaryColor || '#d4af37';

  const testimonials = storeFormData?.testimonials?.length > 0 ? storeFormData.testimonials : [
    { 
      authorName: "Emily R.", 
      quote: "Joining this academy was the best decision for my career. The instructors are incredibly supportive, and the material is cutting-edge.", 
      role: "Software Engineer", 
      rating: 5,
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150"
    },
    { 
      authorName: "John D.", 
      quote: "My son's grades and confidence have soared. The personalized attention truly makes a difference.", 
      role: "Parent", 
      rating: 5,
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150"
    },
    { 
      authorName: "Sarah L.", 
      quote: "The vibrant community and extensive extracurriculars made my experience unforgettable. I developed leadership skills for life.", 
      role: "Alumna", 
      rating: 5,
      avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150"
    },
  ];

  return (
    <section className="py-32 bg-[#F8F9FB] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* --- Section Header --- */}
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="flex justify-center items-center gap-2 mb-4"
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5 text-slate-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Voices of Success</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900">
            Trusted by <span className="italic font-light" style={{ color: primaryColor }}>Generations</span>
          </h2>
        </div>

        {/* --- Testimonial Grid --- */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {testimonials.map((t: any, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="break-inside-avoid bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500 group"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-6">
                {[...Array(t.rating || 5)].map((_, i) => (
                  <StarIcon key={i} className="w-3.5 h-3.5" style={{ color: accentColor }} />
                ))}
              </div>

              {/* Quote */}
              <p className="text-slate-700 text-lg font-light leading-relaxed mb-8 italic">
                "{t.quote || t.testimonialText}"
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-4 pt-6 border-t border-slate-50">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                  <Image 
                    src={t.avatarUrl || `https://ui-avatars.com/api/?name=${t.authorName || 'User'}&background=random`}
                    alt={t.authorName || "Author"}
                    fill
                    loader={loader}
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    {t.authorName}
                  </h4>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                    {t.role || "Community Member"}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- Trust Bar --- */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-24 pt-12 border-t border-slate-200 flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-700"
        >
          {/* You could map through logos here, or use text marks */}
          <span className="text-sm font-black tracking-[0.3em] text-slate-400">ACCREDITED</span>
          <span className="text-sm font-black tracking-[0.3em] text-slate-400">EST. 1994</span>
          <span className="text-sm font-black tracking-[0.3em] text-slate-400">GLOBAL REACH</span>
          <span className="text-sm font-black tracking-[0.3em] text-slate-400">TOP-TIER FACULTY</span>
        </motion.div>
      </div>
    </section>
  );
}