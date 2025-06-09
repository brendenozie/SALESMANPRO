"use client";

import React, { useContext } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function TestimonialSection() {
  const { storeFormData } = useStoreContext();
        
          if (!storeFormData) {
            return (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-600">Loading...</p>
              </div>
            );
          }
    
      const {
        slug,
        bannerUrl,
        name,
        description,
        storeCategories,      // array of { id, name, icon, items, sortOrder, visible }
        marketplaceListings,     // assume you added this field to Prisma/StoreForm
        testimonials,
        faqs,
        stats,
        themeSettings,
      } = storeFormData;
  
    const primary = themeSettings?.primaryColor || '#0d9488'; // teal-600 fallback
    const secondary = themeSettings?.secondaryColor || '#f97316'; // orange-500 fallback

  if (!testimonials.length) return null;

  return (
    <section className="bg-white py-20 px-4 text-center">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-semibold mb-4">
          What Our Clients Say
        </h2>
        <p className="text-gray-600 mb-12">Real feedback from our happy customers</p>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map(({ author, quote, avatarUrl }, idx) => (
            <motion.div
              key={idx}
              className="bg-gray-50 p-6 rounded-2xl shadow hover:shadow-md transition"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="flex justify-center mb-4">
                {avatarUrl ? (
                  <Image
                    loader={loader}
                    src={avatarUrl}
                    alt={author}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200" />
                )}
              </div>
              <p className="text-gray-700 italic mb-4">"{quote}"</p>
              <h4 className="text-lg font-semibold">{author}</h4>
              {<p className="text-sm text-gray-500">user</p>}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
