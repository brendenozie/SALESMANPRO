'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  BoltIcon, 
  WrenchScrewdriverIcon, 
  TruckIcon, 
  CpuChipIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/solid';

const promoItems = [
  {
    id: 1,
    title: 'POWER TOOLS',
    label: 'Professional Grade',
    bgColor: 'bg-zinc-100 dark:bg-zinc-900',
    iconColor: 'text-amber-500',
    icon: BoltIcon,
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c', 
    gridClass: 'md:col-span-1 md:row-span-1',
  },
  {
    id: 2,
    title: 'HEAVY MACHINERY',
    price: 'KSH 45,000',
    discount: 'REBATE AVAILABLE',
    bgColor: 'bg-zinc-100 dark:bg-zinc-900',
    iconColor: 'text-orange-500',
    icon: TruckIcon,
    image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc',
    gridClass: 'md:col-span-1 md:row-span-1',
  },
  {
    id: 3,
    title: 'The Annual Builder Expo',
    highlight: 'SITE WIDE SALE',
    subtitle: 'Equip Your Next Project',
    bgColor: 'bg-zinc-900 dark:bg-zinc-800',
    image: 'https://images.unsplash.com/photo-1503387762-592dea58ef23',
    gridClass: 'md:col-span-2 md:row-span-2', 
    isCenter: true,
  },
  {
    id: 4,
    title: 'ELECTRICAL',
    bgColor: 'bg-zinc-100 dark:bg-zinc-900',
    iconColor: 'text-blue-500',
    icon: CpuChipIcon,
    image: 'https://images.unsplash.com/photo-1558434195-096860368d40',
    gridClass: 'md:col-span-1 md:row-span-1',
  },
  {
    id: 5,
    title: 'SITE SAFETY',
    bgColor: 'bg-zinc-100 dark:bg-zinc-900',
    iconColor: 'text-emerald-500',
    icon: ShieldCheckIcon,
    image: 'https://images.unsplash.com/photo-1516937941344-00b4e0337589',
    gridClass: 'md:col-span-1 md:row-span-1',
  },
];

export default function HardwarePromoGrid() {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#F59E0B'; // Safety Amber

  return (
    <section className="max-w-[1800px] mx-auto px-6 py-24 bg-white dark:bg-[#050505] transition-colors duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 auto-rows-[320px]">
        {promoItems.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
            viewport={{ once: true }}
            className={`group relative border border-zinc-200 dark:border-zinc-800 overflow-hidden ${item.gridClass} ${item.bgColor} transition-all duration-500`}
          >
            {/* Background Image Layer */}
            <div className="absolute inset-0">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover opacity-20 dark:opacity-10 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                loader={({ src }) => `${src}?auto=format&fit=crop&w=1200&q=80`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-zinc-950 via-transparent to-transparent opacity-80" />
            </div>

            {/* Content Layer */}
            <div className={`relative z-10 p-8 h-full flex flex-col ${item.isCenter ? 'items-center justify-center text-center' : 'justify-between'}`}>
              
              {item.isCenter ? (
                <div className="space-y-4">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="inline-block px-4 py-1 border border-amber-500 text-amber-500 text-[9px] font-black tracking-[0.4em] uppercase"
                  >
                    {item.title}
                  </motion.div>
                  
                  <h3 className="text-6xl md:text-8xl font-black tracking-[0.05em] leading-[0.8] text-zinc-900 dark:text-white uppercase italic">
                    {item.highlight}
                  </h3>
                  
                  <p className="text-zinc-500 dark:text-zinc-400 font-bold text-sm uppercase tracking-widest">{item.subtitle}</p>
                  
                  <Link href="/hardwareecommerce/products" className="block pt-8">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-10 py-5 bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-900 font-black text-xs uppercase tracking-[0.2em] shadow-2xl flex items-center gap-4 mx-auto"
                    >
                      <ShoppingCartIcon className="w-4 h-4" />
                      Secure Equipment
                    </motion.button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center group-hover:bg-amber-500 transition-colors duration-500">
                      {item.icon && <item.icon className={`w-6 h-6 ${item.iconColor} group-hover:text-zinc-900 transition-colors`} />}
                    </div>
                    {item.discount && (
                      <span className="bg-red-600 text-white px-3 py-1 text-[8px] font-black uppercase tracking-tighter">
                        {item.discount}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-xl font-black text-zinc-900 dark:text-white leading-none uppercase tracking-tighter italic">{item.title}</h4>
                    {item.price && (
                      <p className="text-zinc-900 dark:text-white font-black text-2xl tracking-tighter">{item.price}</p>
                    )}
                    <Link href="/hardwareecommerce/products" className="inline-block">
                      <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-amber-500 transition-colors">
                        Catalog Access 
                        <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Industrial Accent: Rivets */}
            <div className="absolute top-2 right-2 w-1 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
            <div className="absolute top-2 left-2 w-1 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
            <div className="absolute bottom-2 right-2 w-1 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
            <div className="absolute bottom-2 left-2 w-1 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}