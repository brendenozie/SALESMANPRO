"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowUpRightIcon,
    XMarkIcon,
    AdjustmentsHorizontalIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

// Updated Categories for Laundry/Drycleaning
const categories = ['ALL', 'COUTURE', 'BEDDING', 'LEATHER', 'EVERYDAY'];

const galleryImages = [
  { id: 1, src: 'https://images.unsplash.com/photo-1545173168-9f1947eebb9f', title: 'Silk Gown Restoration', category: 'COUTURE', size: 'tall' },
  { id: 2, src: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518', title: 'Egyptian Cotton Refresh', category: 'BEDDING', size: 'square' },
  { id: 3, src: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b', title: 'Heritage Leather Care', category: 'LEATHER', size: 'wide' },
  { id: 4, src: 'https://images.unsplash.com/photo-1489743342057-3448cc7c3bb9', title: 'Premium Denim Wash', category: 'EVERYDAY', size: 'square' },
  { id: 5, src: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60', title: 'Evening Wear Finish', category: 'COUTURE', size: 'tall' },
];

export default function FabricGallery() {
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages[0] | null>(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  
  const filteredImages = activeFilter === 'ALL' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === activeFilter);

  return (
    <section id="gallery" className="relative py-24 lg:py-40 bg-white dark:bg-[#080a0c] overflow-hidden">
      
      {/* CLEAN BACKGROUND ACCENT */}
      <div className="absolute top-0 right-0 w-1/4 h-full bg-teal-500/[0.03] skew-x-6 translate-x-1/2 pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* --- DYNAMIC HEADER --- */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-20 gap-12">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 mb-6"
            >
              <SparklesIcon className="h-5 w-5 text-teal-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-teal-600">The Finish Line</span>
              <div className="h-[1px] flex-1 bg-slate-100 dark:bg-white/10" />
            </motion.div>
            
            <h2 className="text-7xl md:text-8xl font-bold text-slate-900 dark:text-white tracking-tighter leading-[0.85] uppercase">
              Fabric <br />
              <span className="text-transparent font-serif italic font-light" style={{ WebkitTextStroke: '1px #cbd5e1' }}>Excellence</span>
            </h2>
          </div>

          {/* FILTER SYSTEM */}
          <div className="flex flex-wrap gap-3 items-center">
            <AdjustmentsHorizontalIcon className="h-4 w-4 text-slate-400 mr-2" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`text-[10px] font-black tracking-[0.2em] uppercase px-7 py-3.5 rounded-xl border transition-all duration-300 ${
                  activeFilter === cat 
                  ? 'bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-600/20' 
                  : 'bg-transparent border-slate-200 dark:border-white/10 text-slate-400 hover:border-teal-500/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* --- ARCHITECTURAL GRID --- */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-[350px]">
          <AnimatePresence mode="popLayout">
            {filteredImages.map((image) => (
              <motion.div
                layout
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                onClick={() => setSelectedImage(image)}
                className={`relative group cursor-pointer overflow-hidden rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 ${
                  image.size === 'tall' ? 'md:row-span-2' : 
                  image.size === 'wide' ? 'md:col-span-2' : ''
                }`}
              >
                <div className="relative w-full h-full overflow-hidden bg-slate-100">
                  <Image decoding="async"
                    src={image.src}
                    alt={image.title}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105 brightness-[0.95] group-hover:brightness-100"
                  />
                  
                  {/* Glassmorphism Badge */}
                  <div className="absolute top-8 left-8 z-10">
                    <div className="backdrop-blur-md bg-white/70 border border-white/40 px-5 py-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-10px] group-hover:translate-x-0">
                      <span className="text-[9px] font-black text-teal-700 tracking-widest uppercase">{image.category}</span>
                    </div>
                  </div>

                  {/* Soft Gradient Overlay */}
                  <div className="absolute inset-0 flex items-end p-12 bg-gradient-to-t from-teal-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                      <h3 className="text-3xl font-bold text-white tracking-tight mb-3">
                        {image.title}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Inspect Quality</span>
                        <ArrowUpRightIcon className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* --- LIGHTBOX (Clean Room Aesthetic) --- */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-white/95 dark:bg-[#080a0c]/98 backdrop-blur-xl flex items-center justify-center p-6"
              onClick={() => setSelectedImage(null)}
            >
              <div className="absolute top-0 left-0 w-full p-10 flex justify-between items-center">
                 <div className="flex flex-col">
                    <span className="text-teal-600 text-[10px] font-black tracking-[0.5em] uppercase">Macro Detail View</span>
                    <span className="text-slate-400 text-xs uppercase font-bold mt-1">Batch ID: #PRST-00{selectedImage.id}</span>
                 </div>
                 <button className="w-14 h-14 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full flex items-center justify-center text-slate-900 dark:text-white hover:bg-teal-600 hover:text-white transition-all shadow-xl">
                    <XMarkIcon className="w-6 h-6" />
                 </button>
              </div>

              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative max-w-4xl w-full aspect-square md:aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <Image decoding="async"
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  fill
                  className="object-cover"
                />
              </motion.div>

              <div className="absolute bottom-10 text-center w-full">
                  <motion.h4 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight"
                  >
                    {selectedImage.title}
                  </motion.h4>
                  <p className="text-teal-600 font-serif italic text-lg mt-2">Pristine Garment Care</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* --- NEXT CHAPTER TRIGGER --- */}
        <div className="mt-40 text-center relative">
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-100 dark:bg-white/5 z-0" />
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="relative z-10 inline-block bg-white dark:bg-[#080a0c] px-16"
            >
              <p className="text-slate-400 uppercase tracking-[0.4em] text-[10px] font-black mb-8">Ready for a refresh?</p>
              <a href="/order" className="group flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full border border-teal-500/30 flex items-center justify-center group-hover:bg-teal-600 group-hover:border-teal-600 transition-all duration-500 shadow-xl group-hover:shadow-teal-600/40">
                   <ArrowUpRightIcon className="w-8 h-8 text-teal-600 group-hover:text-white" />
                </div>
                <span className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white uppercase tracking-tighter group-hover:text-teal-600 transition-colors">
                  Start Your Order
                </span>
              </a>
            </motion.div>
        </div>
      </div>
    </section>
  );
}