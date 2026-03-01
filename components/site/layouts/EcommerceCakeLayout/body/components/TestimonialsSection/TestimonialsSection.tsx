'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { Testimonial } from '@/types/typings';
import Image from 'next/image';
// Using Hero Icons as per saved preference
import { 
  ChatBubbleBottomCenterTextIcon, 
  StarIcon,
  HeartIcon 
} from '@heroicons/react/24/solid';

const sampletestimonials = [
  {
    authorName: 'Johnathon R.',
    quote: 'The Red Velvet exceeded my expectations! The moisture level is incredible and the frosting is unmatched. A returning customer for life.',
    avatarUrl: 'https://i.pravatar.cc/150?u=john',
  },
  {
    authorName: 'Alina M.',
    quote: 'Ordered a custom wedding cake and it was a masterpiece. Stylish, delicious, and the delivery was incredibly fast. Highly recommended!',
    avatarUrl: 'https://i.pravatar.cc/150?u=alina',
  },
  {
    authorName: 'Mikey T.',
    quote: 'Fantastic experience! The customer support helped me choose the perfect flavor profile for my anniversary. Everyone loved it!',
    avatarUrl: 'https://i.pravatar.cc/150?u=mikey',
  },
];

interface TestimonialsSectionProps {
  testimonials?: Testimonial[] | null;
}

export default function TestimonialsSection({ testimonials = sampletestimonials }: TestimonialsSectionProps) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#D97706';

  const testimonialsToUse = testimonials && testimonials.length > 0 ? testimonials : sampletestimonials;

  return (
    <section className="relative py-24 bg-[#FCFAF7] overflow-hidden">
      {/* Background Decorative "Sprinkles" */}
      <div className="absolute top-10 left-10 opacity-10 rotate-12">
        <HeartIcon className="w-20 h-20 text-rose-300" />
      </div>
      <div className="absolute bottom-10 right-10 opacity-10 -rotate-12">
        <ChatBubbleBottomCenterTextIcon className="w-24 h-24 text-amber-300" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Editorial Header */}
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white shadow-sm border border-slate-100 mb-6"
          >
            <StarIcon className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Trusted by Foodies</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-tight">
            Loved by our <br/>
            <span className="italic font-serif font-light" style={{ color: primary }}>Cake Community</span>
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonialsToUse.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.8 }}
              whileHover={{ y: -10 }}
              className="relative group bg-white p-10 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-50"
            >
              {/* Floating Quote Icon */}
              <div 
                className="absolute -top-5 left-10 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform"
                style={{ backgroundColor: primary }}
              >
                <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-white" />
              </div>

              {/* Star Rating */}
              <div className="flex gap-1 mb-6 mt-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4 text-amber-400" />
                ))}
              </div>

              {/* Quote Content */}
              <blockquote className="text-lg text-slate-700 font-medium italic leading-relaxed mb-8">
                “{t.quote}”
              </blockquote>

              {/* Author Profile */}
              <div className="flex items-center gap-4 border-t border-slate-100 pt-8">
                <div className="relative w-14 h-14 rounded-full overflow-hidden ring-4 ring-slate-50">
                   <img
                    src={t.avatarUrl || `https://ui-avatars.com/api/?name=${t.authorName}`}
                    alt={t.authorName || 'User'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm uppercase tracking-widest">
                    {t.authorName}
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    Verified Connoisseur
                  </span>
                </div>
              </div>

              {/* Decorative Card Detail */}
              <div className="absolute bottom-6 right-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <HeartIcon className="w-6 h-6 text-rose-100" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Social Proof Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-16 text-center"
        >
          <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">
            Join 10,000+ happy cake lovers worldwide
          </p>
        </motion.div>
      </div>
    </section>
  );
}