'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRightIcon, 
  ShieldCheckIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';

export interface SecondPromoSectionProps {
  promotions: IPromotion[];
}

export default function SecondPromoSection({ promotions }: SecondPromoSectionProps) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#0D9488';

  const promo = promotions?.[1] || {
    title: 'Archive Selection',
    description: 'A curated dialogue between comfort and modern utility. Our organic cotton series is redefined for the new season.',
    ctaText: 'Explore the Series',
    ctaLink: '#',
    bannerUrl: 'https://images.unsplash.com/photo-1522771917743-28b90c0db61b',
  };

  return (
    <section className="relative min-h-[90vh] flex items-center bg-[#FDFDFB] dark:bg-zinc-950 overflow-hidden">
      
      {/* Background Brand Watermark */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/4 pointer-events-none select-none hidden lg:block">
        <h2 className="text-[20vw] font-serif italic text-zinc-100 dark:text-zinc-900/40 leading-none">
          Archive
        </h2>
      </div>

      <div className="max-w-[1600px] mx-auto w-full px-6 md:px-12 relative z-10 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0 items-center">
          
          {/* --- Left: Editorial Content --- */}
          <div className="lg:col-span-5 z-20">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div className="flex items-center gap-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-zinc-400">Limited Release</span>
                <div className="h-[1px] w-12 bg-zinc-200 dark:bg-zinc-800" />
              </div>

              <h2 className="text-7xl md:text-9xl font-serif text-zinc-900 dark:text-white leading-[0.8] tracking-tighter">
                {promo.title.split(' ')[0]} <br />
                <span className="italic font-serif text-zinc-400 dark:text-zinc-600">
                  {promo.title.split(' ').slice(1).join(' ')}
                </span>
              </h2>

              <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 font-light leading-relaxed max-w-md">
                {promo.description}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-10 pt-6">
                <motion.a
                  href={promo.ctaLink || '/bookecommerce/products'}
                  whileHover={{ x: 10 }}
                  className="group flex items-center gap-6"
                >
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white transition-all duration-500 shadow-xl group-hover:shadow-2xl"
                    style={{ backgroundColor: primary }}
                  >
                    <ShoppingBagIcon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-400">Action</span>
                    <span className="block font-serif italic text-xl text-zinc-900 dark:text-white group-hover:underline underline-offset-8 decoration-zinc-300">
                      {promo.ctaText}
                    </span>
                  </div>
                </motion.a>

                <div className="flex items-center gap-3">
                  <ShieldCheckIcon className="w-5 h-5 text-zinc-300" />
                  <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400">Ethically Sourced</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* --- Right: The Visual Composition --- */}
          <div className="lg:col-span-7 relative h-[600px] md:h-[800px] w-full lg:pl-12">
            <motion.div 
              initial={{ clipPath: 'inset(0 100% 0 0)' }}
              whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="relative w-full h-full overflow-hidden bg-zinc-100"
            >
              <motion.img
                initial={{ scale: 1.2 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 2 }}
                src={promo.bannerUrl}
                alt={promo.title}
                className="w-full h-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-1000"
              />
              
              {/* Floating Overlay Detail */}
              <div className="absolute bottom-12 right-12 hidden md:block">
                <div className="bg-white/10 backdrop-blur-2xl p-8 border border-white/20">
                  <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-white/60 mb-2">Inventory Status</p>
                  <p className="text-white text-2xl font-serif italic">Limited Stock Available</p>
                </div>
              </div>
            </motion.div>
            
            {/* Geometric Accents */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 border-l border-b border-zinc-200 dark:border-zinc-800 hidden lg:block" />
          </div>

        </div>
      </div>
    </section>
  );
}