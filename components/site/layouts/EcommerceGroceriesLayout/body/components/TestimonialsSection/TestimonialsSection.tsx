'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { Testimonial } from '@/types/typings';
import { ChatBubbleBottomCenterIcon, StarIcon } from '@heroicons/react/24/solid';

const sampletestimonials = [
  {
    authorName: 'Johnathon',
    quote: 'The products exceeded my expectations! The quality is incredible and the style is unmatched. I will definitely be a returning customer.',
    avatarUrl: 'https://i.pravatar.cc/150?u=john',
  },
  {
    authorName: 'Alina',
    quote: 'I am so happy with my purchase. The shoes are comfortable and stylish, and the delivery was fast. Highly recommended!',
    avatarUrl: 'https://i.pravatar.cc/150?u=alina',
  },
  {
    authorName: 'Mikey',
    quote: 'Fantastic experience. The customer support was excellent, and the product arrived exactly as described. Love my new shoes!',
    avatarUrl: 'https://i.pravatar.cc/150?u=mikey',
  },
];

interface TestimonialsSectionProps {
  testimonials?: Testimonial[] | null;
}

export default function TestimonialsSection({ testimonials = sampletestimonials }: TestimonialsSectionProps) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#10B981';

  const displayTestimonials = testimonials && testimonials.length > 0 ? testimonials : sampletestimonials;

  return (
    <section className="relative py-32 bg-white overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full blur-[120px] opacity-10" style={{ background: primary }} />
        <div className="absolute bottom-20 left-10 w-64 h-64 rounded-full blur-[120px] opacity-10" style={{ background: primary }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-100"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200" />
                ))}
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-gray-500">500+ Happy Clients</span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-none"
            >
              Voices of <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-400 to-gray-900">Trust.</span>
            </motion.h2>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="flex items-center gap-1 text-amber-400 mb-2"
          >
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className="w-6 h-6" />
            ))}
            <span className="ml-2 text-gray-900 font-bold text-lg">4.9/5.0</span>
          </motion.div>
        </div>

        {/* Testimonials Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayTestimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              whileHover={{ y: -10 }}
              className="relative group p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)]"
            >
              {/* Floating Quote Icon */}
              <div 
                className="absolute -top-6 left-10 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12"
                style={{ backgroundColor: primary, color: '#fff' }}
              >
                <ChatBubbleBottomCenterIcon className="w-6 h-6" />
              </div>

              <div className="flex flex-col h-full space-y-8">
                <p className="text-xl font-medium text-gray-700 leading-relaxed italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md">
                    <img
                      src={testimonial.avatarUrl || `https://i.pravatar.cc/150?u=${index}`}
                      alt={testimonial.authorName || `User ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-gray-900">{testimonial.authorName}</h4>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Verified Buyer</p>
                  </div>
                </div>
              </div>

              {/* Card Corner Detail */}
              <div 
                className="absolute top-0 right-0 w-24 h-24 opacity-[0.03] pointer-events-none group-hover:opacity-[0.08] transition-opacity"
                style={{ 
                  background: `radial-gradient(circle at top right, ${primary}, transparent 70%)` 
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}