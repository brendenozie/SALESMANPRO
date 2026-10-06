'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const promoBanners = [
  {
    title: 'Archive',
    italicTitle: 'Footwear',
    subtitle: 'Tiny steps, refined style.',
    discount: '15% OFF',
    image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782',
  },
  {
    title: 'The Mega',
    italicTitle: 'Drop',
    subtitle: 'Limited seasonal reductions.',
    discount: '50% OFF',
    image: 'https://images.unsplash.com/photo-1532330393533-443990a51d10',
    isSpecial: true,
  },
  {
    title: 'Essential',
    italicTitle: 'Objects',
    subtitle: 'Playtime, re-imagined.',
    discount: '20% OFF',
    image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f', 
  },
];

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function PromoBannerGridSection() {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0D9488';

  return (
    <section className="bg-[#FDFDFB] dark:bg-zinc-950 py-32 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
          {promoBanners.map((banner, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              className="group relative h-[650px] overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
            >
              {/* Image Layer with Zoom & Grayscale Logic */}
              <div className="absolute inset-0 z-0">
                <Image decoding="async"
                  src={banner.image}
                  alt={banner.title}
                  fill
                  className="object-cover grayscale-[0.6] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[2s] ease-out"
                />
                <div className="absolute inset-0 bg-zinc-900/10 group-hover:bg-transparent transition-colors duration-700" />
              </div>

              {/* Content Overlay */}
              <div className="relative z-10 h-full p-12 flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-white/70 drop-shadow-sm">
                      Collection No. 0{index + 1}
                    </span>
                    <div className="h-[1px] w-8 bg-white/30" />
                  </div>

                  <h3 className="text-5xl md:text-6xl font-serif text-white leading-none tracking-tighter drop-shadow-md">
                    {banner.title} <br />
                    <span className="italic font-serif opacity-80">{banner.italicTitle}</span>
                  </h3>
                </div>

                <div className="space-y-8 translate-y-8 group-hover:translate-y-0 transition-transform duration-700">
                  <div className="space-y-2">
                    <p className="text-white/70 font-mono text-[10px] uppercase tracking-widest leading-relaxed max-w-[200px]">
                      {banner.subtitle}
                    </p>
                    <div className="inline-block py-1 border-b border-white/40">
                      <span className="text-white text-xs font-mono tracking-tighter">{banner.discount}</span>
                    </div>
                  </div>

                  <Link 
                    href="/bookecommerce/products" 
                    className="flex items-center gap-4 text-white group/btn"
                  >
                    <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center group-hover/btn:bg-white group-hover/btn:text-zinc-900 transition-all duration-500">
                      <ArrowRightIcon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      Shop Now
                    </span>
                  </Link>
                </div>
              </div>

              {/* Special Indicator Tag */}
              {banner.isSpecial && (
                <div 
                  className="absolute top-0 right-0 p-6 z-20"
                >
                  <div className="w-3 h-3 rounded-full animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.8)]" style={{ backgroundColor: 'white' }} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}