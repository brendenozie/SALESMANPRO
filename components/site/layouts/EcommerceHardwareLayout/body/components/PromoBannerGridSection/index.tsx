'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  WrenchIcon, 
  BoltIcon, 
  FireIcon,
  ArrowRightIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/solid';

const promoBanners = [
  {
    title: 'POWER TOOLS',
    subtitle: 'Precision engineering',
    price: 'KES 8,500',
    discount: 'TRADE-IN DEAL',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c',
    baseColor: '#F59E0B', 
    icon: WrenchIcon,
    tag: 'Pro Series'
  },
  {
    title: 'SITE SAFETY',
    subtitle: 'Zero-compromise gear',
    buttonText: 'Bulk Order',
    discount: 'OSHA COMPLIANT',
    image: 'https://images.unsplash.com/photo-1516937941344-00b4e0337589',
    isSpecial: true,
    icon: ShieldCheckIcon,
    tag: 'Safety First'
  },
  {
    title: 'ELECTRICAL',
    subtitle: 'High-voltage efficiency',
    price: 'From KES 1,200',
    discount: 'NEW INVENTORY',
    image: 'https://images.unsplash.com/photo-1558434195-096860368d40', 
    baseColor: '#3B82F6', 
    icon: BoltIcon,
    tag: 'Energy Tech'
  },
];

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function HardwarePromoBannerSection() {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#F59E0B'; // Safety Amber

  return (
    <section className="max-w-[1800px] mx-auto px-6 md:px-12 py-24 bg-white dark:bg-[#050505]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {promoBanners.map((banner, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover="hover"
            className="group relative h-[380px] overflow-visible cursor-pointer"
          >
            {/* The Chassis: Main Card Body */}
            <div 
              className={`absolute inset-0 border-t-4 transition-all duration-500 overflow-hidden
                ${banner.isSpecial 
                  ? 'bg-zinc-900 border-amber-500' 
                  : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 group-hover:border-amber-500'}`}
            >
                {/* Background Tech Detail: Diagonal Stripes */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                     style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px' }} />
                
                {/* Dynamic Glow Orb */}
                <div 
                    className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[100px] opacity-0 group-hover:opacity-20 transition-opacity duration-700"
                    style={{ backgroundColor: banner.baseColor || primaryColor }}
                />
            </div>

            {/* Content Layer */}
            <div className="relative z-20 p-10 h-full flex flex-col justify-between items-start">
              <div className="space-y-6 w-full">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    <banner.icon className="w-3 h-3 text-amber-500" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-900 dark:text-white">
                      {banner.tag}
                    </span>
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-tighter px-2 py-0.5
                    ${banner.isSpecial ? 'bg-amber-500 text-zinc-900' : 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'}`}>
                    {banner.discount}
                  </span>
                </div>

                <div className={banner.isSpecial ? 'text-white' : 'text-zinc-900 dark:text-white'}>
                  <h3 className="text-4xl font-black leading-none tracking-tighter uppercase italic mb-3">
                    {banner.title}
                  </h3>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-l-2 border-amber-500 pl-3">
                    {banner.subtitle}
                  </p>
                </div>
              </div>

              <div className="w-full flex items-end justify-between">
                {banner.isSpecial ? (
                  <Link href="/hardwareecommerce/products" className="inline-block">
                    <motion.button 
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-4 px-6 py-4 bg-amber-500 text-zinc-900 text-[10px] font-black uppercase tracking-widest"
                    >
                      {banner.buttonText}
                      <ArrowRightIcon className="w-4 h-4" />
                    </motion.button>
                  </Link>
                ) : (
                  <div className="space-y-4">
                    {banner.price && (
                        <p className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white">
                            {banner.price}
                        </p>
                    )}
                    <Link href="/hardwareecommerce/products" className="group/link flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-amber-500 transition-colors">
                        Procurement Path
                        <ArrowRightIcon className="w-3 h-3 group-hover/link:translate-x-2 transition-transform" />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* The "Machine" Pop-Out Layer */}
            <motion.div 
              variants={{
                hover: { scale: 1.1, x: 10, y: -10, rotate: 2 }
              }}
              className="absolute -right-8 bottom-4 w-[70%] h-[60%] z-10 pointer-events-none"
            >
              <div className="relative h-full w-full">
                <Image decoding="async"
                  src={banner.image}
                  alt={banner.title}
                  fill
                  className="object-contain object-right-bottom grayscale group-hover:grayscale-0 transition-all duration-700 drop-shadow-2xl"
                />
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}