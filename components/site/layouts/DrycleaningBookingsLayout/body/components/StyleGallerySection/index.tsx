"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
    CameraIcon, 
    ArrowUpRightIcon,
    XMarkIcon,
    AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

const categories = ['ALL', 'FADE', 'GROOMING', 'CLASSIC', 'RITUAL'];

const galleryImages = [
  { id: 1, src: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1', title: 'The Classic Executive', category: 'FADE', size: 'tall' },
  { id: 2, src: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a', title: 'Signature Beard Sculpt', category: 'GROOMING', size: 'square' },
  { id: 3, src: 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186', title: 'Midnight Scissor Cut', category: 'CLASSIC', size: 'wide' },
  { id: 4, src: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70', title: 'The Sharp Taper', category: 'FADE', size: 'square' },
  { id: 5, src: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033', title: 'Luxury Hot Towel Shave', category: 'RITUAL', size: 'tall' },
];

export default function StyleGallery() {
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages[0] | null>(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  
  const filteredImages = activeFilter === 'ALL' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === activeFilter);

  return (
    <section id="gallery" className="relative py-24 lg:py-40 bg-[#050505] overflow-hidden">
      
      {/* BACKGROUND ACCENT */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[#D4AF37]/[0.02] -skew-x-12 translate-x-1/2 pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* --- DYNAMIC HEADER --- */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-24 gap-12">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 mb-8"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#D4AF37]">Visual Excellence</span>
              <div className="h-[1px] flex-1 bg-white/10" />
            </motion.div>
            
            <h2 className="text-7xl md:text-9xl font-bold text-white tracking-tighter leading-[0.8] uppercase">
              The <br />
              <span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.3)' }}>Portfolio</span>
            </h2>
          </div>

          {/* FILTER SYSTEM */}
          <div className="flex flex-wrap gap-4 items-center">
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-[#D4AF37] mr-2" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`text-[10px] font-black tracking-[0.2em] uppercase px-6 py-3 rounded-full border transition-all ${
                  activeFilter === cat 
                  ? 'bg-[#D4AF37] border-[#D4AF37] text-black' 
                  : 'bg-transparent border-white/10 text-white/40 hover:border-white/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* --- ARCHITECTURAL GRID --- */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[300px]">
          <AnimatePresence mode="popLayout">
            {filteredImages.map((image, index) => (
              <motion.div
                layout
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => setSelectedImage(image)}
                className={`relative group cursor-none overflow-hidden rounded-sm ${
                  image.size === 'tall' ? 'md:row-span-2' : 
                  image.size === 'wide' ? 'md:col-span-2' : ''
                }`}
              >
                <div className="relative w-full h-full overflow-hidden bg-zinc-900">
                  <Image
                    src={image.src}
                    alt={image.title}
                    loader={({ src }) => `${src}?w=600&h=600&fit=crop&q=80`}
                    fill
                    className="object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1 brightness-[0.8] group-hover:brightness-100"
                  />
                  
                  {/* Glassmorphism Badge */}
                  <div className="absolute top-6 left-6 z-10">
                    <div className="backdrop-blur-md bg-black/40 border border-white/10 px-4 py-2 rounded-full translate-y-[-20px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <span className="text-[9px] font-bold text-[#D4AF37] tracking-widest uppercase">{image.category}</span>
                    </div>
                  </div>

                  {/* Large Floating Overlay Label */}
                  <div className="absolute inset-0 flex items-end p-10 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                      <h3 className="text-3xl font-black text-white uppercase leading-none tracking-tighter mb-2">
                        {image.title}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.3em]">View Project</span>
                        <ArrowUpRightIcon className="h-4 w-4 text-[#D4AF37]" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* --- LIGHTBOX (Enhanced) --- */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-[#050505]/98 backdrop-blur-3xl flex items-center justify-center p-4"
              onClick={() => setSelectedImage(null)}
            >
              <div className="absolute top-0 left-0 w-full p-10 flex justify-between items-center">
                 <div className="flex flex-col">
                    <span className="text-[#D4AF37] text-[10px] font-black tracking-[0.5em] uppercase">The Detail View</span>
                    <span className="text-white/20 text-xs uppercase font-bold mt-1">Ref: 00{selectedImage.id}</span>
                 </div>
                 <button className="w-14 h-14 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-[#D4AF37] hover:text-black transition-all">
                    <XMarkIcon className="w-6 h-6" />
                 </button>
              </div>

              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative max-w-5xl w-full aspect-square md:aspect-[16/10]"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <Image
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  loader={({ src }) => `${src}?w=1200&h=1200&fit=crop&q=90`}
                  fill
                  className="object-contain"
                />
              </motion.div>

              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center w-full">
                  <motion.h4 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter"
                  >
                    {selectedImage.title}
                  </motion.h4>
                  <p className="text-[#D4AF37] font-serif italic text-lg mt-2">Bespoke Craftsmanship</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* --- NEXT CHAPTER TRIGGER --- */}
        <div className="mt-40 text-center relative">
           <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5 z-0" />
           <motion.div 
             whileHover={{ scale: 1.05 }}
             className="relative z-10 inline-block bg-[#050505] px-12"
           >
             <p className="text-white/30 uppercase tracking-[0.4em] text-[10px] font-bold mb-6">Inspired by the craft?</p>
             <a href="/booking" className="group flex items-center gap-6">
                <span className="text-4xl md:text-6xl font-bold text-white uppercase tracking-tighter group-hover:text-[#D4AF37] transition-colors">
                  Get the Cut
                </span>
                <div className="w-16 h-16 rounded-full border border-[#D4AF37] flex items-center justify-center group-hover:bg-[#D4AF37] transition-all">
                   <ArrowUpRightIcon className="w-8 h-8 text-[#D4AF37] group-hover:text-black" />
                </div>
             </a>
           </motion.div>
        </div>
      </div>
    </section>
  );
}