'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  PlusIcon, 
  HandThumbUpIcon, 
  MapPinIcon,
  CameraIcon
} from '@heroicons/react/24/outline';

const loader = ({ src, width }: { src: string; width: number }) => `${src}?w=${width}&q=90`;

const galleryItems = [
  { id: 1, title: 'Flame Grilled Wagyu', tag: 'Signature', img: 'https://images.unsplash.com/photo-1544025162-d76694265947', size: 'md:col-span-2 md:row-span-2' },
  { id: 2, title: 'Ocean Harvest', tag: 'Fresh', img: 'https://images.unsplash.com/photo-1551739440-5dd934d3a94a', size: 'md:col-span-1 md:row-span-1' },
  { id: 3, title: 'Artisanal Pasta', tag: 'Handmade', img: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856', size: 'md:col-span-1 md:row-span-2' },
  { id: 4, title: 'Botanical Cocktails', tag: 'Craft', img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b', size: 'md:col-span-1 md:row-span-1' },
  { id: 5, title: 'The Chef’s Table', tag: 'Atmosphere', img: 'https://images.unsplash.com/photo-1550966842-28c460a8848b', size: 'md:col-span-2 md:row-span-1' },
];

export default function RestaurantGallery() {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <section className="bg-zinc-950 py-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* --- SECTION HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20">
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 shadow-2xl"
            >
              <CameraIcon className="w-4 h-4 text-orange-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Atmosphere & Flavor</span>
            </motion.div>
            <h2 className="text-6xl md:text-8xl font-serif italic text-white tracking-tighter leading-none">
              A Visual <span className="text-zinc-600">Feast</span>
            </h2>
          </div>

          <p className="text-zinc-500 max-w-sm text-sm font-medium leading-relaxed">
            Every dish is a canvas. Every corner is a story. Explore the curated moments from our kitchen and dining hall.
          </p>
        </div>

        {/* --- BENTO GALLERY GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-6 auto-rows-[300px]">
          {galleryItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative group rounded-[2.5rem] overflow-hidden cursor-none ${item.size} bg-zinc-900 border border-zinc-800/50`}
              onMouseEnter={() => setSelectedId(item.id)}
              onMouseLeave={() => setSelectedId(null)}
            >
              {/* Image with subtle zoom on card hover */}
              <Image
                src={item.img}
                alt={item.title}
                fill
                loader={loader}
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
              />

              {/* Glassmorphic Badge */}
              <div className="absolute top-6 left-6 z-10">
                <div className="px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/90">{item.tag}</span>
                </div>
              </div>

              {/* Bottom Content Fade */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-8 flex flex-col justify-end">
                <motion.div
                    initial={{ y: 20 }}
                    animate={{ y: selectedId === item.id ? 0 : 20 }}
                    className="flex justify-between items-end"
                >
                    <h3 className="text-3xl font-serif italic text-white leading-none">{item.title}</h3>
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-zinc-900 shadow-2xl hover:scale-110 transition-transform">
                        <PlusIcon className="w-6 h-6" />
                    </div>
                </motion.div>
              </div>

              {/* Custom Cursor/Follower Effect (Internal to Card) */}
              <AnimatePresence>
                {selectedId === item.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="absolute inset-0 pointer-events-none border-[12px] border-white/5 rounded-[2.5rem] transition-all"
                  />
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* --- INTERACTIVE FOOTER --- */}
        <div className="mt-20 flex flex-col md:flex-row items-center justify-between p-12 rounded-[3rem] bg-zinc-900/50 border border-zinc-800/50">
            <div className="flex items-center gap-6 mb-8 md:mb-0">
                <div className="flex -space-x-4">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="w-12 h-12 rounded-full border-4 border-zinc-900 bg-zinc-800 overflow-hidden">
                            <Image src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" width={48} height={48} loader={({src}) => src}/>
                        </div>
                    ))}
                </div>
                <div>
                    <p className="text-white font-bold text-lg leading-tight">Shared by our Guests</p>
                    <p className="text-zinc-500 text-sm">Join 2,400+ others who tagged us this week.</p>
                </div>
            </div>

            <button className="flex items-center gap-3 px-10 py-5 rounded-full bg-white text-zinc-900 font-black uppercase text-[10px] tracking-[0.3em] hover:bg-orange-500 hover:text-white transition-all shadow-2xl">
                <HandThumbUpIcon className="w-4 h-4" />
                Tag us on Instagram
            </button>
        </div>
      </div>
    </section>
  );
}