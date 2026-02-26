'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRightCircleIcon } from '@heroicons/react/24/outline';
import { IStoreCategory } from '@/types/typings';

export interface CategorySectionProps {
  StoreCategory: IStoreCategory[] | null;
  themeSettings: any;
}

export default function CategorySection({ StoreCategory, themeSettings }: CategorySectionProps) {
  const primary = themeSettings?.primaryColor || '#D97706';

  // Fallback images if the category doesn't have one
  const fallbackImages = [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
  ];

  return (
    <section className="py-24 bg-[#FDFCF9]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-amber-600 font-bold uppercase tracking-[0.3em] text-xs mb-4 block"
            >
              Our Specialties
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold tracking-tighter text-gray-900 leading-none"
            >
              Baked with <span className="italic font-serif font-light text-amber-700">Heart & Soul</span>
            </motion.h2>
          </div>
          <Link 
            href="/ecommerce/categories" 
            className="group flex items-center gap-2 text-sm font-black uppercase tracking-widest border-b-2 border-amber-500 pb-1 hover:text-amber-600 transition-colors"
          >
            View All Categories
            <ArrowRightCircleIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Dynamic Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {StoreCategory && StoreCategory.map((cat: IStoreCategory, idx: number) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group cursor-pointer"
            >
              <Link href={`/ecommerce/products?category=${cat.category?.slug || cat.id}`}>
                <div className="relative h-[450px] overflow-hidden rounded-2xl mb-6 shadow-xl transition-shadow hover:shadow-2xl">
                  
                  {/* Category Image with Ken Burns Effect cat.imageUrl ||*/}
                  <Image
                    src={ fallbackImages[idx % 3]}
                    alt={cat.displayName || 'Category'}
                    loader={({ src }) => src} // Use the URL directly without modification
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  
                  {/* Glassmorphism Badge (showing category icon if available) */}
                  {cat.icon && (
                    <div className="absolute top-6 left-6 px-4 py-2 backdrop-blur-md bg-white/20 border border-white/30 rounded-full text-white text-xs font-bold flex items-center gap-2">
                       <span className="text-lg">{cat.icon}</span>
                       <span className="tracking-widest uppercase">Specialty</span>
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                  
                  {/* Content Over Image */}
                  <div className="absolute bottom-8 left-8 right-8 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      Discovery
                    </p>
                    <h3 className="text-3xl font-bold mb-4 tracking-tight">
                       { cat.displayName || cat.category?.name || 'Untitled' }
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="h-[1px] w-8 bg-amber-500 transition-all duration-500 group-hover:w-12" />
                      <span className="text-sm font-black uppercase tracking-widest">Explore</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}

          {/* Empty State/Placeholder for "More Coming Soon" */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="relative h-[450px] rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center p-10 bg-gray-50/50"
          >
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
              <span className="text-2xl">🥐</span>
            </div>
            <h3 className="text-xl font-bold text-gray-400">New Delights Incoming</h3>
            <p className="text-gray-400 text-sm mt-2">We're constantly perfecting new recipes.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}