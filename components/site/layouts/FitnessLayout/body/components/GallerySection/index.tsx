"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  MagnifyingGlassPlusIcon, 
  Square3Stack3DIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import { useStoreContext } from "@/contexts/StoreContext";

const loader = ({ src }: { src: string }) => src;

const galleryItems = [
  {
    id: 1,
    title: "METABOLIC CHAMBER",
    category: "FACILITY",
    src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2000",
    size: "md:col-span-2 md:row-span-2 min-h-[320px] md:min-h-auto"
  },
  {
    id: 2,
    title: "NEURAL RECOVERY",
    category: "PROTOCOL",
    src: "https://images.unsplash.com/photo-1594882645126-14020914d58d?q=80&w=2000",
    size: "md:col-span-1 md:row-span-1 min-h-[240px] md:min-h-auto"
  },
  {
    id: 3,
    title: "TACTICAL STRENGTH",
    category: "INSTRUCTION",
    src: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=2000",
    size: "md:col-span-1 md:row-span-2 min-h-[320px] md:min-h-auto"
  },
  {
    id: 4,
    title: "BIOMETRIC SYNC",
    category: "INTERFACE",
    src: "https://images.unsplash.com/photo-1510017803434-a899398421b3?q=80&w=2000",
    size: "md:col-span-1 md:row-span-1 min-h-[240px] md:min-h-auto"
  },
  {
    id: 5,
    title: "ELITE ENDURANCE",
    category: "PROTOCOL",
    src: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2000",
    size: "md:col-span-2 md:row-span-1 min-h-[240px] md:min-h-auto"
  }
];

export default function GallerySection() {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || "#f97316";

  return (
    <section className="relative py-24 sm:py-32 bg-neutral-50 dark:bg-neutral-950 transition-colors duration-500 overflow-hidden">
      {/* Background Micro-Text Accent Graphic */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-10 pointer-events-none select-none">
        <div className="absolute top-1/4 left-4 text-[12vw] font-black text-neutral-900 dark:text-white uppercase italic tracking-tighter rotate-90 origin-top-left opacity-10">
          ARCHIVE
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Interactive Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-8">
          <div className="space-y-2">
            <motion.div 
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2.5 mb-2"
            >
              <CameraIcon className="h-4 w-4" style={{ color: primaryColor }} />
              <span className="font-black tracking-[0.3em] uppercase text-[10px]" style={{ color: primaryColor }}>
                Visual Documentation
              </span>
            </motion.div>
            <h2 className="text-5xl sm:text-6xl lg:text-8xl font-black text-neutral-900 dark:text-white italic tracking-tighter uppercase leading-[0.85]">
              The <br /> <span className="text-neutral-300 dark:text-neutral-900 transition-colors">Field Feed</span>
            </h2>
          </div>
          
          <div className="text-left sm:text-right shrink-0">
            <p className="text-neutral-400 dark:text-neutral-600 font-black uppercase text-[10px] tracking-[0.25em] mb-2.5">
              System Status: Optimal
            </p>
            <div className="flex gap-1 justify-start sm:justify-end">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className="h-4 w-[2px] opacity-40 dark:opacity-30" 
                  style={{ backgroundColor: primaryColor }} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Responsive Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-4 h-auto md:h-[750px] lg:h-[850px]">
          {galleryItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.05 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className={`relative group overflow-hidden rounded-[2rem] border border-neutral-200/60 dark:border-neutral-900/60 shadow-sm hover:shadow-xl transition-all duration-500 ${item.size}`}
            >
              {/* Core Context Content Image Asset */}
              <Image decoding="async"
                src={item.src || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2000"}
                alt={item.title}
                fill
                className="object-cover grayscale dark:opacity-90 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
              />
              
              {/* Dynamic Cinema Light Gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent opacity-85 dark:opacity-75 transition-opacity duration-500 group-hover:opacity-90" />
              
              {/* Interactive Dynamic Corner Elements */}
              <div 
                className="absolute top-5 left-5 border-l-2 border-t-2 w-4 h-4 transition-all duration-500 opacity-0 scale-75 group-hover:scale-100 group-hover:opacity-100" 
                style={{ borderColor: primaryColor }}
              />
              <div 
                className="absolute bottom-5 right-5 border-r-2 border-b-2 w-4 h-4 transition-all duration-500 opacity-0 scale-75 group-hover:scale-100 group-hover:opacity-100" 
                style={{ borderColor: primaryColor }}
              />

              {/* Grid Label Panels */}
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end translate-y-2 sm:translate-y-4 group-hover:translate-y-0 transition-transform duration-500 z-10">
                <div className="space-y-0.5">
                  <p className="font-black text-[9px] tracking-[0.25em] uppercase" style={{ color: primaryColor }}>
                    {item.category}
                  </p>
                  <h3 className="text-white font-black text-xl lg:text-2xl italic uppercase tracking-tighter leading-tight">
                    {item.title}
                  </h3>
                </div>
                
                <div className="p-2.5 bg-white/10 dark:bg-neutral-900/40 backdrop-blur-md border border-white/20 rounded-full opacity-0 scale-90 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 shrink-0 hidden sm:block">
                  <MagnifyingGlassPlusIcon className="h-4 w-4 text-white" />
                </div>
              </div>

              {/* Ambient Digital Reticle Filter Overlays */}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-[0.04] dark:group-hover:opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_3px,4px_100%] transition-opacity duration-500" />
            </motion.div>
          ))}
        </div>

        {/* Global Footer Meta Actions */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-neutral-200/60 dark:border-neutral-900/60 pt-8 gap-4 transition-colors">
          <div className="flex items-center gap-3 text-neutral-400 dark:text-neutral-600 transition-colors">
            <Square3Stack3DIcon className="h-4 w-4 opacity-70" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">
              Archive Total: 428 Files
            </span>
          </div>
          
          <button 
            className="group font-black uppercase text-[10px] tracking-[0.35em] flex items-center gap-3 text-neutral-800 dark:text-neutral-200 hover:opacity-80 transition-opacity"
          >
            {/* <span>Access Full Database</span>  */}
            <div 
              className="w-10 h-[2px] transition-all duration-500 group-hover:w-16" 
              style={{ backgroundColor: primaryColor }} 
            />
          </button>
        </div>
      </div>
    </section>
  );
}