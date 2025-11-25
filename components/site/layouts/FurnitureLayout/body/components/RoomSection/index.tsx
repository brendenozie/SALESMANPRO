'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { StoreForm, IStoreCategory } from '@/types/typings';

// --- Helpers ---

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const safeSlug = (name: string) => 
  name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

interface RoomCard {
  name: string;
  img: string;
  href: string;
  isDynamic: boolean;
}

// Default static data for the furniture context
const defaultRooms = [
  { 
    id: 'living', 
    keywords: ['living', 'sofa', 'lounge'], 
    defaultName: 'Living Room', 
    defaultImg: 'https://images.unsplash.com/photo-1583847669868-28203b10cd11?q=80&w=1000' 
  },
  { 
    id: 'bedroom', 
    keywords: ['bed', 'sleep', 'night'], 
    defaultName: 'Bedroom', 
    defaultImg: 'https://images.unsplash.com/photo-1616594039964-40891f913dd2?q=80&w=1000' 
  },
  { 
    id: 'dining', 
    keywords: ['dining', 'kitchen', 'table', 'eat'], 
    defaultName: 'Dining Room', 
    defaultImg: 'https://images.unsplash.com/photo-1617103996702-96ff29b1c467?q=80&w=1000' 
  }
];

export interface RoomSectionProps {
  store?: StoreForm | null; // Added store prop
  themeSettings: any;
}

export default function RoomSection({ store, themeSettings }: RoomSectionProps) {
  const primary = themeSettings?.primaryColor || '#ea580c'; // Default to orange-600
  const storeSlug = store?.slug || 'site';

  // Logic: Map Store Categories to the 3 "Room" Slots
  const rooms: RoomCard[] = useMemo(() => {
    const categories = store?.StoreCategory || [];

    return defaultRooms.map((roomType) => {
      // 1. Try to find a matching category in the store data
      const match = categories.find(cat => 
        roomType.keywords.some(k => cat.displayName?.toLowerCase().includes(k))
      );

      // 2. If found, use dynamic data. If not, use static fallback.
      if (match) {
        return {
          name: match.displayName || roomType.defaultName,
          img: (match as any).imageUrl || (match as any).image || roomType.defaultImg,
          href: `/${storeSlug}/category/${safeSlug(match.categoryId || match.displayName || '')}`,
          isDynamic: true
        };
      }

      return {
        name: roomType.defaultName,
        img: roomType.defaultImg,
        href: `/${storeSlug}/categories`, // General link if specific not found
        isDynamic: false
      };
    });
  }, [store, storeSlug]);

  return (
    <section className="py-24 max-w-7xl mx-auto px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-4">
        <div>
           <h2 className="text-4xl font-serif font-bold text-stone-900 dark:text-white">
            Shop by Room
           </h2>
           <p className="mt-2 text-stone-500 dark:text-stone-400">
             Curated arrangements for every corner of your home.
           </p>
        </div>
        
        <Link 
          href={`/${storeSlug}/categories`}
          className="group flex items-center text-stone-500 hover:text-[color:var(--primary)] transition-colors duration-300 underline underline-offset-4"
          style={{ '--primary': primary } as React.CSSProperties}
        >
          View Full Catalog
          <ArrowRightIcon className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
      
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rooms.map((room, idx) => (
          <Link href={room.href} key={idx} passHref legacyBehavior>
            <motion.a 
              whileHover={{ y: -8 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="relative h-[400px] rounded-2xl overflow-hidden group cursor-pointer block shadow-sm hover:shadow-xl"
            >
              <Image 
                src={room.img} 
                alt={room.name} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-110" 
                loader={loader}
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-3xl text-white font-serif font-medium mb-2">
                      {room.name}
                    </h3>
                    <p className="text-white/80 text-sm font-light tracking-wide opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                      Explore Collection
                    </p>
                  </div>
                  
                  {/* Floating Action Button */}
                  <div 
                    className="w-10 h-10 rounded-full bg-white text-stone-900 flex items-center justify-center opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 delay-100"
                    style={{ color: primary }}
                  >
                    <ArrowRightIcon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </motion.a>
          </Link>
        ))}
      </div>
    </section>
  );
}