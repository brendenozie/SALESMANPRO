'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon, StarIcon, SwatchIcon, TruckIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide, ICoreValue } from '@/types/typings';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const transitionDuration = 0.8;
const autoAdvanceDelay = 5000;

export interface RoomSectionProps {
  themeSettings: any;
}

export default function RoomSection({ themeSettings }: RoomSectionProps) {

  const defaultPrimaryColor = '#6B46C1';
  const defaultSecondaryColor = '#D53F8C';
  const primary = themeSettings?.primaryColor || defaultPrimaryColor;
  const secondary = themeSettings?.secondaryColor || defaultSecondaryColor;

  return (
    <section className="py-24 max-w-7xl mx-auto px-6">
         <div className="flex justify-between items-end mb-12">
            <h2 className="text-4xl font-serif font-bold text-stone-900">Shop by Room</h2>
            <a href="#" className="text-stone-500 hover:text-orange-700 underline underline-offset-4">View Full Catalog</a>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Living Room', img: 'https://images.unsplash.com/photo-1583847669868-28203b10cd11?q=80&w=1000' },
              { name: 'Bedroom', img: 'https://images.unsplash.com/photo-1616594039964-40891f913dd2?q=80&w=1000' },
              { name: 'Dining', img: 'https://images.unsplash.com/photo-1617103996702-96ff29b1c467?q=80&w=1000' }
            ].map((cat, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ scale: 1.02 }}
                className="relative h-80 group overflow-hidden cursor-pointer"
              >
                <Image src={cat.img} alt={cat.name} fill className="object-cover" loader={loader} />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                <div className="absolute bottom-8 left-8">
                  <h3 className="text-2xl text-white font-serif font-medium">{cat.name}</h3>
                </div>
              </motion.div>
            ))}
         </div>
      </section>
  );
}
