'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  SparklesIcon, 
  ArrowRightIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';

const promoItems = [
  {
    id: 1,
    title: 'Archive Pieces',
    label: 'Curated Gifts',
    image: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60', 
    gridClass: 'md:col-span-1 md:row-span-1',
  },
  {
    id: 2,
    title: 'The Modern Heirloom',
    price: '$30.00',
    discount: '15% OFF',
    image: 'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01',
    gridClass: 'md:col-span-1 md:row-span-1',
  },
  {
    id: 3,
    title: 'The Season of Discovery',
    highlight: 'Summer Archive',
    subtitle: 'Limited release selections for the discerning eye.',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4',
    gridClass: 'md:col-span-2 md:row-span-2', 
    isCenter: true,
  },
  {
    id: 4,
    title: 'Urban Transit',
    label: 'Strollers & Gear',
    image: 'https://images.unsplash.com/photo-1591339102716-4bc24f7c41bc',
    gridClass: 'md:col-span-1 md:row-span-1',
  },
  {
    id: 5,
    title: 'Playful Intellect',
    label: 'Educational',
    image: 'https://images.unsplash.com/photo-1566438480900-0609be27a4be',
    gridClass: 'md:col-span-1 md:row-span-1',
  },
];

export default function NewsletterPromoGrid() {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0D9488';

  return (
    <section className="bg-[#FDFDFB] dark:bg-zinc-950 py-32 transition-colors duration-500 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        
        {/* Section Label */}
        <div className="flex items-center gap-4 mb-16">
          <div className="w-12 h-[1px] bg-zinc-300 dark:bg-zinc-800" />
          <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-zinc-400">Spotlight Bento</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 auto-rows-[320px]">
          {promoItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className={`group relative overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 ${item.gridClass}`}
            >
              {/* Image with High-Contrast Editorial Overlay */}
              <div className="absolute inset-0">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover grayscale-[0.4] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[2s] ease-out"
                  loader={({ src }) => `${src}?auto=format&fit=crop&w=1200&q=80`}
                />
                <div className="absolute inset-0 bg-zinc-900/20 group-hover:bg-zinc-900/10 transition-colors duration-700" />
              </div>

              {/* Functional Content Overlay */}
              <div className={`relative z-10 p-8 h-full flex flex-col ${item.isCenter ? 'items-center justify-center text-center' : 'justify-between'}`}>
                
                {item.isCenter ? (
                  <div className="space-y-8 max-w-md">
                    <div className="flex items-center justify-center gap-3">
                      <SparklesIcon className="w-4 h-4 text-white" />
                      <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-white/80">Exclusive Series</span>
                    </div>
                    
                    <h3 className="text-5xl md:text-7xl font-serif italic text-white leading-[0.8] tracking-tighter">
                      {item.highlight}
                    </h3>
                    
                    <p className="text-white/70 font-mono text-[11px] uppercase tracking-widest">{item.subtitle}</p>
                    
                    <Link href="/products" className="inline-block pt-6">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-10 py-4 bg-white text-zinc-900 font-mono text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-4 mx-auto transition-all"
                      >
                        <ShoppingBagIcon className="w-4 h-4" />
                        Explore Archive
                      </motion.button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <div className="font-mono text-[10px] text-white/60 uppercase tracking-widest">
                        Index No. {idx + 1}
                      </div>
                      {item.discount && (
                        <div className="bg-white/10 backdrop-blur-md px-3 py-1 border border-white/20 text-[9px] font-mono text-white uppercase tracking-tighter">
                          {item.discount}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <h4 className="text-2xl font-serif italic text-white leading-tight">{item.title}</h4>
                      
                      <Link href="/products" className="inline-flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.2em] text-white/60 group-hover:text-white transition-all">
                        <span>Discover</span>
                        <ArrowRightIcon className="w-4 h-4" />
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}