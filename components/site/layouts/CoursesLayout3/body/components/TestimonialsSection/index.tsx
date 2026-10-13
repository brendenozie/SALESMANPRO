"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { useStoreContext } from '@/contexts/StoreContext';
import { useEditor } from '@/contexts/EditorContext';
import { EditableElement } from '@/components/site/EditableElement';

const fallbackTestimonials = [
  {
    id: 'fb-1',
    name: "Emily Robinson",
    role: "Post-Graduate Alumni",
    quote: "The academy didn't just teach me curriculum; they taught me how to think critically in a global market. The mentorship here is unparalleled.",
    rating: 5,
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&h=150&auto=format&fit=crop",
  },
  {
    id: 'fb-2',
    name: "Dr. Julian Vance",
    role: "Parent of Year 4 Student",
    quote: "Finding an institution that balances academic rigor with genuine character development was our priority. We found that here and more.",
    rating: 5,
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&h=150&auto=format&fit=crop",
  }
];

export default function TestimonialSection({ storeFormData: propStoreFormData }: { storeFormData?: any }) {
  const contextStore = useStoreContext();
  const storeFormData = propStoreFormData || contextStore?.storeFormData;
  const { isEditorMode } = useEditor();

  const [currentIndex, setCurrentIndex] = useState(0);

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#1e3a8a';
  const accentColor = storeFormData?.themeSettings?.secondaryColor || '#d4af37';

  const testimonials = storeFormData?.testimonials?.length > 0 
    ? storeFormData.testimonials.map((t: any) => ({
        id: t.id,
        name: t.authorName || 'Academy Member',
        role: t.authorName?.includes('Dr') ? 'Parent' : 'Student',
        quote: t.quote,
        rating: t.rating || 5,
        avatarUrl: t.avatarUrl || `https://ui-avatars.com/api/?name=${t.authorName}&background=f8f9fa&color=1e3a8a`
      }))
    : fallbackTestimonials;

  const active = testimonials[currentIndex] || testimonials[0];

  const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="relative py-24 lg:py-40 bg-white overflow-hidden">
      {/* Editor mode toolbar */}
      {isEditorMode && testimonials.length > 1 && (
        <div className="absolute top-4 left-6 z-50 flex items-center gap-2 bg-black/80 text-white px-3 py-1.5 rounded-full text-xs shadow-lg backdrop-blur-md">
          <span className="font-semibold text-gray-300">Edit Testimonial:</span>
          {testimonials.map((_: any, idx: number) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`px-2 py-0.5 rounded text-xs transition-colors ${
                currentIndex === idx
                  ? 'bg-white text-black font-bold shadow'
                  : 'bg-white/20 text-white hover:bg-white/40'
              }`}
            >
              #{idx + 1}
            </button>
          ))}
        </div>
      )}

      {/* Background Stylized Quote Mark */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none select-none">
        <span className="text-[25rem] font-serif font-black text-gray-50 leading-none">“</span>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Header Alignment */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-8 bg-gray-200" />
            <EditableElement targetId="courses3.home.testimonials.badge" fieldType="text" label="Testimonials Badge">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Community Voices</span>
            </EditableElement>
            <div className="h-px w-8 bg-gray-200" />
          </div>
          <EditableElement targetId="courses3.home.testimonials.title" fieldType="text" label="Testimonials Title">
            <h2 className="text-5xl lg:text-6xl font-serif font-bold text-gray-900 tracking-tighter">
              Voices of <span className="italic font-light text-gray-400">Excellence.</span>
            </h2>
          </EditableElement>
        </div>

        <div className="relative grid lg:grid-cols-12 items-center gap-12">
          
          {/* Left Side: The Image Frame */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative">
              <div className="relative w-64 h-80 lg:w-80 lg:h-[450px] overflow-hidden shadow-2xl grayscale hover:grayscale-0 transition-all duration-700">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="absolute inset-0"
                  >
                    <EditableElement targetId={`home.testimonials.items.${currentIndex}.avatar`} fieldType="image" label="Testimonial Avatar">
                      <Image decoding="async" 
                        src={active.avatarUrl} 
                        alt={active.name} 
                        fill 
                        className="object-cover"
                      />
                    </EditableElement>
                  </motion.div>
                </AnimatePresence>
              </div>
              {/* Gold Accent Square */}
              <div 
                className="absolute -bottom-6 -left-6 w-32 h-32 -z-10 opacity-20" 
                style={{ backgroundColor: accentColor }} 
              />
            </div>
          </div>

          {/* Right Side: The Quote Content */}
          <div className="lg:col-span-7">
            <div className="relative min-h-[400px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: "circOut" }}
                >
                  <div className="flex gap-1 mb-8">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="w-4 h-4" style={{ color: i < active.rating ? accentColor : '#e5e7eb' }} />
                    ))}
                  </div>

                  <EditableElement targetId={`home.testimonials.items.${currentIndex}.quote`} fieldType="textarea" label="Testimonial Quote">
                    <blockquote className="text-2xl lg:text-4xl font-serif font-medium text-gray-800 leading-[1.4] mb-10 italic">
                      “{active.quote}”
                    </blockquote>
                  </EditableElement>

                  <div>
                    <EditableElement targetId={`home.testimonials.items.${currentIndex}.author`} fieldType="text" label="Author Name">
                      <h4 className="text-xl font-bold text-gray-900 mb-1">{active.name}</h4>
                    </EditableElement>
                    <EditableElement targetId={`home.testimonials.items.${currentIndex}.role`} fieldType="text" label="Author Role">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        {active.role}
                      </span>
                    </EditableElement>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation UI */}
              <div className="flex items-center gap-8 mt-16">
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={prev}
                    className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors group"
                  >
                    <ChevronLeftIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-900" />
                  </button>
                  <button 
                    type="button"
                    onClick={next}
                    className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors group"
                  >
                    <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-900" />
                  </button>
                </div>

                {/* Counter / Progress */}
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-gray-900">0{currentIndex + 1}</span>
                  <div className="w-20 h-px bg-gray-100 relative overflow-hidden">
                    <motion.div 
                      className="absolute inset-y-0 left-0"
                      initial={{ width: "0%" }}
                      animate={{ width: `${((currentIndex + 1) / testimonials.length) * 100}%` }}
                      style={{ backgroundColor: primaryColor }}
                    />
                  </div>
                  <span className="text-[10px] font-black text-gray-300">0{testimonials.length}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}