'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  TagIcon, 
  SparklesIcon, 
  FireIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/solid';

const promoBanners = [
  {
    title: 'KIDS SHOES',
    subtitle: 'Tiny steps, big style',
    price: '$30.00',
    discount: '15% OFF',
    image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782',
    baseColor: 'rose', // Will map to primary-ish
    icon: TagIcon,
    tag: 'Little Steps'
  },
  {
    title: 'FASHION',
    subtitle: 'Nursery essentials',
    price: '$20.00',
    discount: 'NEW ARRIVAL',
    image: 'https://images.unsplash.com/photo-1522771935876-249711cd40f2',
    baseColor: 'sky', // Will map to secondary-ish
    icon: SparklesIcon,
    tag: 'Trending'
  },
  {
    title: 'BIG SAVINGS',
    subtitle: 'Limited drop',
    buttonText: 'Shop Sale',
    discount: '50% OFF',
    image: 'https://images.unsplash.com/photo-1532330393533-443990a51d10',
    isSpecial: true,
    icon: FireIcon,
    tag: 'Mega Deal'
  },
];

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function PromoBannerGridSection() {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#FF8FA3';
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#70D6FF';

  return (
    <section className="max-w-[1800px] mx-auto px-6 md:px-12 py-24 bg-white dark:bg-zinc-950">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {promoBanners.map((banner, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            whileHover="hover"
            className="group relative h-[340px] rounded-[4rem] overflow-visible transition-all duration-500"
          >
            {/* Background Layer with Dynamic Gradient */}
            <div 
              className={`absolute inset-0 rounded-[4rem] transition-all duration-500 shadow-xl group-hover:shadow-2xl overflow-hidden
                ${banner.isSpecial ? 'bg-zinc-900 dark:bg-zinc-800' : 'bg-zinc-50 dark:bg-zinc-900'}`}
            >
                {/* Floating Glow Orbs */}
                <div 
                    className="absolute -top-10 -left-10 w-40 h-40 rounded-full blur-[60px] opacity-40 group-hover:opacity-60 transition-opacity"
                    style={{ backgroundColor: banner.isSpecial ? primaryColor : (index === 0 ? primaryColor : secondaryColor) }}
                />
            </div>

            {/* Content Layer */}
            <div className="relative z-20 p-12 h-full flex flex-col justify-between items-start">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-zinc-100 dark:border-zinc-700">
                  <banner.icon className="w-4 h-4" style={{ color: banner.isSpecial ? '#fb923c' : (index === 0 ? primaryColor : secondaryColor) }} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white">
                    {banner.tag}
                  </span>
                </div>

                <div className={banner.isSpecial ? 'text-white' : 'text-zinc-900 dark:text-white'}>
                  <h3 className="text-4xl font-black leading-[0.9] tracking-tighter mb-2">
                    {banner.title}
                  </h3>
                  <p className="text-sm font-bold opacity-60 italic uppercase tracking-wider">
                    {banner.subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                    <span className={`text-sm font-black px-4 py-1.5 rounded-xl border-2 transition-colors
                        ${banner.isSpecial 
                            ? 'border-white text-white' 
                            : 'border-zinc-200 dark:border-zinc-700 text-zinc-500'}`}
                    >
                        {banner.discount}
                    </span>
                    {banner.price && !banner.isSpecial && (
                        <p className="text-2xl font-black tracking-tighter" style={{ color: index === 0 ? primaryColor : secondaryColor }}>
                            {banner.price}
                        </p>
                    )}
                </div>
              </div>

              {banner.isSpecial ? (
                <Link href="/ecommerce/products">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-3 px-8 py-4 rounded-[2rem] bg-white text-zinc-900 text-xs font-black shadow-xl"
                  >
                    {banner.buttonText}
                    <ArrowRightIcon className="w-4 h-4" style={{ color: primaryColor }} />
                  </motion.button>
                </Link>
              ) : (
                <Link href="/ecommerce/products" className="group/link flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    Explore Now
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-md group-hover/link:translate-x-2 transition-all">
                        <ArrowRightIcon className="w-4 h-4" />
                    </div>
                </Link>
              )}
            </div>

            {/* Image Layer - The "Pop-Out" Effect */}
            <motion.div 
              variants={{
                hover: { scale: 1.15, rotate: -8, y: -30, x: 10 }
              }}
              className="absolute -right-6 -bottom-6 w-[65%] h-[85%] z-10 pointer-events-none"
            >
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                className="object-contain object-right-bottom drop-shadow-[0_30px_40px_rgba(0,0,0,0.15)] group-hover:drop-shadow-[0_40px_60px_rgba(0,0,0,0.3)] transition-all duration-500"
                loader={loader}
              />
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}