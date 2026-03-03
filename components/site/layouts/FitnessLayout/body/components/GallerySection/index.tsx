"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  MagnifyingGlassPlusIcon, 
  Square3Stack3DIcon,
  CameraIcon
} from '@heroicons/react/24/outline';

const loader = ({ src }: { src: string }) => src;

const galleryItems = [
  {
    id: 1,
    title: "METABOLIC CHAMBER",
    category: "FACILITY",
    src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2000",
    size: "col-span-2 row-span-2"
  },
  {
    id: 2,
    title: "NEURAL RECOVERY",
    category: "PROTOCOL",
    src: "https://images.unsplash.com/photo-1594882645126-14020914d58d?q=80&w=2000",
    size: "col-span-1 row-span-1"
  },
  {
    id: 3,
    title: "TACTICAL STRENGTH",
    category: "INSTRUCTION",
    src: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=2000",
    size: "col-span-1 row-span-2"
  },
  {
    id: 4,
    title: "BIOMETRIC SYNC",
    category: "INTERFACE",
    src: "https://images.unsplash.com/photo-1510017803434-a899398421b3?q=80&w=2000",
    size: "col-span-1 row-span-1"
  },
  {
    id: 5,
    title: "ELITE ENDURANCE",
    category: "PROTOCOL",
    src: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2000",
    size: "col-span-2 row-span-1"
  }
];

export default function GallerySection() {
  return (
    <section className="relative py-32 bg-[#050505] overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-10 text-[10vw] font-black text-white/5 uppercase italic tracking-tighter rotate-90">ARCHIVE</div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-4"
            >
              <CameraIcon className="h-4 w-4 text-orange-500" />
              <span className="text-orange-500 font-black tracking-[0.4em] uppercase text-[10px]">Visual Documentation</span>
            </motion.div>
            <h2 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-[0.8]">
              The <br /> <span className="text-white/10">Field Feed</span>
            </h2>
          </div>
          
          <div className="hidden md:block text-right">
            <p className="text-gray-600 font-black uppercase text-[10px] tracking-[0.3em] mb-2">System Status: Optimal</p>
            <div className="flex gap-1 justify-end">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 w-[2px] bg-orange-500/40" />
              ))}
            </div>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-none md:grid-rows-3 gap-4 h-auto md:h-[800px]">
          {galleryItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className={`relative group overflow-hidden border border-white/5 ${item.size}`}
            >
              {/* Image with Grayscale to Color Transition */}
              <Image
                src={item.src}
                alt={item.title}
                fill
                loader={loader}
                className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 ease-in-out"
              />
              
              {/* Tactical Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              
              {/* Corner Accents */}
              <div className="absolute top-4 left-4 border-l border-t border-orange-500/0 group-hover:border-orange-500/100 w-4 h-4 transition-all duration-500" />
              <div className="absolute bottom-4 right-4 border-r border-b border-orange-500/0 group-hover:border-orange-500/100 w-4 h-4 transition-all duration-500" />

              {/* Data Labels */}
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div>
                  <p className="text-orange-500 font-black text-[9px] tracking-[0.3em] uppercase mb-1">{item.category}</p>
                  <h3 className="text-white font-black text-xl italic uppercase tracking-tighter">{item.title}</h3>
                </div>
                <div className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <MagnifyingGlassPlusIcon className="h-5 w-5 text-white" />
                </div>
              </div>

              {/* Scanline Effect on Hover */}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
            </motion.div>
          ))}
        </div>

        {/* Footer Meta */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between border-t border-white/5 pt-8">
          <div className="flex items-center gap-6 mb-6 md:mb-0">
            <Square3Stack3DIcon className="h-5 w-5 text-gray-700" />
            <span className="text-[10px] text-gray-700 font-black uppercase tracking-[0.4em]">Archive Total: 428 Files</span>
          </div>
          <button className="group text-white font-black uppercase text-[10px] tracking-[0.4em] flex items-center gap-4 hover:text-orange-500 transition-colors">
            Access Full Database <div className="w-12 h-[1px] bg-orange-500 group-hover:w-20 transition-all" />
          </button>
        </div>
      </div>
    </section>
  );
}