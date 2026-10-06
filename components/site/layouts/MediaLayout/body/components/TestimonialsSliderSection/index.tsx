'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon, ArrowUpRightIcon, StarIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';

// --- Types ---
interface Testimonial {
  id: string;
  quote: string;
  name: string;
  title: string; // Job Title or Company
  avatarUrl: string;
  rating: number; // 1-5
}

interface TestimonialsSectionProps {
  title?: string;
  subtitle?: string;
  testimonials?: Testimonial[];
}

// --- Mock Data (Fallbacks) ---
const fallbackTestimonials: Testimonial[] = [
  {
    id: 't1',
    quote: "The media section component is a masterpiece of modern web design, perfectly blending utility with stunning visual appeal. A huge leap forward for our newsroom presentation.",
    name: 'Sarah Chen',
    title: 'Lead UI/UX Designer, InnovateCorp',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop',
    rating: 5,
  },
  {
    id: 't2',
    quote: "Implementation was seamless, and the Framer Motion effects gave our site the polish it desperately needed. The filter functionality is exactly what our users asked for.",
    name: 'Michael Davis',
    title: 'CTO, Global Tech Solutions',
    avatarUrl: 'https://images.unsplash.com/photo-1544723795-3fb646cb0d75?q=80&w=2694&auto=format&fit=crop',
    rating: 5,
  },
  {
    id: 't3',
    quote: "We've seen a 40% increase in engagement with our news content since launching this design. The clear hierarchy and dark mode support are critical wins.",
    name: 'Jessica Lee',
    title: 'Marketing Director, Ascent Media',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29329?q=80&w=2574&auto=format&fit=crop',
    rating: 4,
  },
];

// --- Helper: Image Loader (Consistent with MediaSection) ---
const loader = ({ src, width }: { src: string; width: number }) => `${src}?w=${width}`;

export default function TestimonialsSection({ title, subtitle, testimonials }: TestimonialsSectionProps) {
  const displayTestimonials = testimonials || fallbackTestimonials;
  
  const StarRating = ({ count }: { count: number }) => (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <StarIcon 
          key={i} 
          className={`w-5 h-5 ${
            i < count ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
          }`} 
        />
      ))}
    </div>
  );

  return (
    <section className="relative py-24 bg-white dark:bg-gray-950 overflow-hidden">
      
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* --- Header --- */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2"
          >
            Social Proof
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight"
          >
            {title || "Trusted by Industry Leaders"}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-gray-600 dark:text-gray-400"
          >
            {subtitle || "Hear directly from the people who use our platform every day."}
          </motion.p>
        </div>

        {/* --- Testimonials Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayTestimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <StarRating count={testimonial.rating} />
              
              <blockquote className="mt-4 flex-grow">
                <p className="text-xl font-medium text-gray-900 dark:text-white leading-relaxed">
                  "{testimonial.quote}"
                </p>
              </blockquote>
              
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <Image decoding="async"
                    src={testimonial.avatarUrl}
                    alt={testimonial.name}
                    fill
                    className="object-cover rounded-full"
                  />
                </div>
                <div className="ml-4">
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400">
                    {testimonial.title}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* --- Optional CTA --- */}
        <div className="mt-16 text-center">
            <motion.a 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                href="#" 
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-indigo-600 dark:text-white bg-indigo-50 dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-gray-700 transition-all duration-300 shadow-md"
            >
                Read All 500+ Reviews
                <ArrowUpRightIcon className="w-5 h-5 ml-2" />
            </motion.a>
        </div>
      </div>
    </section>
  );
}