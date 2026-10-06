'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLongRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { StoreForm } from '@/types/typings';

/* -------------------------------------------------------------------------- */
/* Helpers */
/* -------------------------------------------------------------------------- */

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const safeSlug = (name: string) => 
  name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

interface RoomCard {
  name: string;
  img: string;
  href: string;
  isDynamic: boolean;
  tag: string;
}

const defaultRooms = [
  { 
    id: 'living', 
    keywords: ['living', 'sofa', 'lounge'], 
    defaultName: 'Living Room', 
    defaultImg: 'https://images.unsplash.com/photo-1583847669868-28203b10cd11?q=80&w=1000',
    tag: 'The Social Space'
  },
  { 
    id: 'bedroom', 
    keywords: ['bed', 'sleep', 'night'], 
    defaultName: 'Bedroom', 
    defaultImg: 'https://images.unsplash.com/photo-1616594039964-40891f913dd2?q=80&w=1000',
    tag: 'Private Sanctuary'
  },
  { 
    id: 'dining', 
    keywords: ['dining', 'kitchen', 'table', 'eat'], 
    defaultName: 'Dining Room', 
    defaultImg: 'https://images.unsplash.com/photo-1617103996702-96ff29b1c467?q=80&w=1000',
    tag: 'Culinary Stage'
  }
];

export interface RoomSectionProps {
  store?: StoreForm | null;
  themeSettings: any;
}

export default function RoomSection({ store, themeSettings }: RoomSectionProps) {
  const primary = themeSettings?.primaryColor || '#18181b';
  const storeSlug = store?.slug || 'site';

  const rooms: RoomCard[] = useMemo(() => {
    const categories = store?.StoreCategory || [];
    return defaultRooms.map((roomType) => {
      const match = categories.find(cat => 
        roomType.keywords.some(k => cat.displayName?.toLowerCase().includes(k))
      );

      return {
        name: match?.displayName || roomType.defaultName,
        img: (match as any)?.imageUrl || (match as any)?.image || match?.category?.image || roomType.defaultImg,
        href: `/furnitureecommerce/products?category=${safeSlug(match?.categoryId || match?.displayName || roomType.id)}`,
        isDynamic: !!match,
        tag: roomType.tag
      };
    });
  }, [store]);

  return (
    <section className="py-32 bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      <div className="max-w-[1700px] mx-auto px-6">
        
        {/* Editorial Header */}
        <div className="relative mb-20">
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 block mb-4"
          >
            // Space Selection
          </motion.span>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <h2 className="text-6xl md:text-8xl font-light tracking-tighter text-zinc-900 dark:text-white uppercase leading-[0.8] max-w-2xl">
              Shop by <br />
              <span className="font-serif italic lowercase text-zinc-400 ml-12">Atmosphere</span>
            </h2>
            <Link 
              href="/furnitureecommerce/categories"
              className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900 dark:text-white pb-2 border-b border-zinc-200 dark:border-zinc-800"
            >
              The Full Catalog
              <ArrowLongRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-2" />
            </Link>
          </div>
        </div>

        {/* Asymmetric Grid Spread */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[900px]">
          
          {/* Main Hero: Living Room (60% Width) */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 relative group overflow-hidden"
          >
            <Link href={rooms[0].href} className="block w-full h-full relative">
              <Image decoding="async" 
                src={rooms[0].img} 
                alt={rooms[0].name} 
                fill 
                className="object-cover transition-transform duration-[2s] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-zinc-950/20 group-hover:bg-zinc-950/40 transition-colors duration-700" />
              
              <div className="absolute top-10 right-10 flex flex-col items-end">
                 <span className="text-white text-[10px] font-black uppercase tracking-widest bg-zinc-900 px-4 py-2">
                   Featured Space
                 </span>
              </div>

              <div className="absolute bottom-12 left-12">
                <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">
                  {rooms[0].tag}
                </span>
                <h3 className="text-5xl md:text-7xl font-light text-white uppercase tracking-tighter">
                  {rooms[0].name.split(' ')[0]} <br />
                  <span className="font-serif italic lowercase block translate-x-8">{rooms[0].name.split(' ')[1]}</span>
                </h3>
              </div>
            </Link>
          </motion.div>

          {/* Side Stack (40% Width) */}
          <div className="lg:col-span-5 grid grid-rows-2 gap-6">
            {rooms.slice(1).map((room, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="relative group overflow-hidden"
              >
                <Link href={room.href} className="block w-full h-full relative">
                  <Image decoding="async" 
                    src={room.img || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000'} 
                    alt={room.name} 
                    fill 
                    className="object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-zinc-950/20 to-transparent" />
                  
                  <div className="absolute inset-0 p-12 flex flex-col justify-end">
                    <span className="text-white/50 text-[10px] font-black uppercase tracking-[0.4em] mb-2">
                      {room.tag}
                    </span>
                    <div className="flex items-center justify-between">
                      <h3 className="text-3xl font-light text-white uppercase tracking-tighter">
                        {room.name}
                      </h3>
                      <div className="w-12 h-px bg-white/30 group-hover:w-20 transition-all duration-500" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Floating Brand Label */}
        <div className="mt-12 flex justify-end">
          <p className="text-[10px] font-serif italic text-zinc-400 max-w-xs text-right">
            Every room tells a story. Ours begins with architectural integrity and ends with your comfort.
          </p>
        </div>
      </div>
    </section>
  );
}