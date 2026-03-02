"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CameraIcon, 
    ArrowUpRightIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const galleryImages = [
  { id: 1, src: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070', title: 'The Classic Executive', category: 'FADE' },
  { id: 2, src: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1888', title: 'Signature Beard Sculpt', category: 'GROOMING' },
  { id: 3, src: 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?q=80&w=1887', title: 'Midnight Scissor Cut', category: 'CLASSIC' },
  { id: 4, src: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074', title: 'The Sharp Taper', category: 'FADE' },
  { id: 5, src: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=2070', title: 'Luxury Hot Towel Shave', category: 'RITUAL' },
  { id: 6, src: 'https://images.unsplash.com/photo-1512690196236-407675713c32?q=80&w=2070', title: 'The Modern Pompadour', category: 'CLASSIC' },
  { id: 7, src: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=2070', title: 'The Street Standard', category: 'STREET' },
  { id: 8, src: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=2070', title: 'The Razor Fade', category: 'FADE' },
  { id: 9, src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=2070', title: 'The Dapper Gentleman', category: 'CLASSIC' },
  { id: 10, src: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=2070', title: 'The Urban Edge', category: 'STREET' },
];

export default function StyleGallery() {
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages[0] | null>(null);

  return (
    <section id="gallery" className="py-24 lg:py-40 bg-black overflow-hidden">
      <div className="container mx-auto px-6">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col mb-20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="h-[1px] w-12 bg-[#C5A267]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.5em] text-[#C5A267]">The Portfolio</span>
          </motion.div>
          
          <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none mb-8">
            STREET <br />
            <span className="font-serif italic font-light text-[#C5A267]">Standard.</span>
          </h2>
        </div>

        {/* --- MASONRY GRID --- */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {galleryImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.8, ease: "circOut" }}
              viewport={{ once: true }}
              onClick={() => setSelectedImage(image)}
              className="relative group cursor-none break-inside-avoid"
            >
              <div className="relative overflow-hidden bg-[#111]">
                <Image
                  src={image.src}
                  alt={image.title}
                  loader={({ src }) => `${src}?q=80&w=800&auto=format&fit=crop`}
                  width={800}
                  height={1000}
                  className="w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:opacity-50"
                />
                
                {/* Custom Cursor Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="bg-[#C5A267] p-5 rounded-full transform scale-50 group-hover:scale-100 transition-transform duration-500 shadow-2xl">
                    <ArrowUpRightIcon className="w-6 h-6 text-black" />
                  </div>
                </div>

                {/* Bottom Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black via-black/80 to-transparent">
                  <span className="text-[10px] font-bold text-[#C5A267] tracking-[0.3em] uppercase">{image.category}</span>
                  <h3 className="text-xl font-bold text-white mt-1 uppercase tracking-tighter">{image.title}</h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- LIGHTBOX --- */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 md:p-20"
              onClick={() => setSelectedImage(null)}
            >
              <button className="absolute top-10 right-10 text-white hover:text-[#C5A267] transition-colors">
                <XMarkIcon className="w-10 h-10" />
              </button>
              
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="relative max-w-4xl w-full aspect-[4/5] md:aspect-video"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <Image
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  loader={({ src }) => `${src}?q=80&w=1200&auto=format&fit=crop`}
                  fill
                  className="object-contain"
                />
                <div className="absolute -bottom-16 left-0 right-0 text-center">
                  <h4 className="text-2xl font-serif italic text-white">{selectedImage.title}</h4>
                  <p className="text-[10px] tracking-[0.4em] text-[#C5A267] uppercase font-bold mt-2">Crafted by Master Barbers</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* --- CALL TO ACTION --- */}
        <div className="mt-32 flex flex-col items-center">
           <div className="p-4 border border-white/10 rounded-full mb-8">
              <CameraIcon className="w-8 h-8 text-white/20" />
           </div>
           <p className="text-white/40 uppercase tracking-[0.3em] text-[10px] font-bold mb-4">Want the look?</p>
           <a href="#services" className="text-white text-2xl font-black uppercase tracking-tighter hover:text-[#C5A267] transition-colors border-b-2 border-[#C5A267] pb-1">
             Book Your Ritual
           </a>
        </div>
      </div>
    </section>
  );
}