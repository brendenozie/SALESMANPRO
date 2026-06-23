'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  WrenchScrewdriverIcon, 
  CpuChipIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  ShoppingCartIcon,
  LifebuoyIcon
} from '@heroicons/react/24/solid';

const promoItems = [
  // CENTER PIECE (Order 1 in mobile, perfectly centered on desktop)
  {
    id: 3,
    title: 'The Annual Auto Duka Festival',
    highlight: 'GRAND AUTO-FEST\nSALE',
    subtitle: 'Equip Your Next Drive',
    bgColor: 'bg-zinc-950 dark:bg-[#0a0a0a]',
    image: 'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=1200&auto=format&fit=crop', // Aggressive sports car
    gridClass: 'md:col-start-2 md:col-span-2 md:row-start-1 md:row-span-2', 
    isCenter: true,
  },
  // LEFT COLUMN
  {
    id: 1,
    title: 'PERFORMANCE PARTS',
    bgColor: 'bg-white dark:bg-zinc-900',
    iconColor: 'text-amber-500',
    icon: WrenchScrewdriverIcon,
    image: 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?q=80&w=600&auto=format&fit=crop', // Engine block
    gridClass: 'md:col-start-1 md:row-start-1',
  },
  {
    id: 4,
    title: 'CAR ACCESSORIES & ELECTRONICS',
    bgColor: 'bg-white dark:bg-zinc-900',
    iconColor: 'text-blue-500',
    icon: CpuChipIcon,
    image: 'https://images.unsplash.com/photo-1605348325605-77987df1076b?q=80&w=600&auto=format&fit=crop', // Dashboard / Electronics
    gridClass: 'md:col-start-1 md:row-start-2',
  },
  // RIGHT COLUMN
  {
    id: 2,
    title: 'PREMIUM TIRES & WHEELS',
    price: 'KSH 12,000',
    discount: 'FREE ALIGNMENT',
    bgColor: 'bg-white dark:bg-zinc-900',
    iconColor: 'text-orange-500',
    icon: LifebuoyIcon, // Used as a wheel/tire placeholder
    image: 'https://images.unsplash.com/photo-1620882194639-6512e022739a?q=80&w=600&auto=format&fit=crop', // Alloy wheels / Tires
    gridClass: 'md:col-start-4 md:row-start-1',
  },
  {
    id: 5,
    title: 'BRAKE SYSTEMS & SAFETY',
    bgColor: 'bg-white dark:bg-zinc-900',
    iconColor: 'text-emerald-500',
    icon: ShieldCheckIcon,
    image: 'https://images.unsplash.com/photo-1486262715619-670810a070e1?q=80&w=600&auto=format&fit=crop', // Rotors / Safety
    gridClass: 'md:col-start-4 md:row-start-2',
  },
];

export default function AutomotivePromoGrid() {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#F59E0B';

  return (
    <section 
      style={{ '--primary-color': primaryColor } as React.CSSProperties}
      className="max-w-[1800px] mx-auto px-6 py-24 bg-zinc-100 dark:bg-[#050505] transition-colors duration-500 border-t border-zinc-200 dark:border-zinc-900"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 md:gap-6 auto-rows-[380px]">
        {promoItems.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className={`group relative rounded-sm border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-[var(--primary-color)]/50 overflow-hidden ${item.gridClass} ${item.bgColor} transition-all duration-500 flex flex-col`}
          >
            {/* Structural Detail: Corner Rivets */}
            <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full shadow-inner z-20" />
            <div className="absolute top-3 left-3 w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full shadow-inner z-20" />
            <div className="absolute bottom-3 right-3 w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full shadow-inner z-20" />
            <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full shadow-inner z-20" />

            {item.isCenter ? (
              // --- CENTER CARD STYLING ---
              <>
                <div className="absolute inset-0 z-0">
                  <Image
                    src={item.image}
                    alt={item.highlight || item.title}
                    fill
                    className="object-cover filter brightness-[0.4] group-hover:brightness-[0.6] group-hover:scale-105 transition-all duration-[2s] ease-out"
                    loader={({ src }) => `${src}`}
                  />
                  {/* Engineered Grid Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
                  <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                </div>

                <div className="relative z-10 p-10 md:p-14 h-full flex flex-col items-center justify-center text-center">
                  <div className="space-y-6 w-full">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      className="inline-block px-4 py-1.5 border-b-2 border-[var(--primary-color)] text-[var(--primary-color)] text-[11px] font-black tracking-[0.3em] uppercase bg-black/50 backdrop-blur-sm"
                    >
                      {item.title}
                    </motion.div>
                    
                    <h3 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.85] text-white uppercase italic drop-shadow-2xl whitespace-pre-line">
                      {item.highlight}
                    </h3>
                    
                    <div className="flex items-center gap-4 justify-center py-2">
                       <div className="h-px w-12 bg-zinc-600" />
                       <p className="text-zinc-300 font-bold text-sm md:text-base uppercase tracking-widest">{item.subtitle}</p>
                       <div className="h-px w-12 bg-zinc-600" />
                    </div>
                    
                    <Link href="/automotiveecommerce/products" className="block pt-6">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-10 py-5 bg-[var(--primary-color)] text-zinc-950 hover:bg-white font-black text-xs md:text-sm uppercase tracking-[0.2em] shadow-[0_0_40px_rgba(245,158,11,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] flex items-center gap-4 mx-auto transition-all duration-300 rounded-sm"
                      >
                        Secure Your Gear
                        <ShoppingCartIcon className="w-5 h-5" />
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              // --- SIDE CARDS STYLING ---
              <div className="relative z-10 p-6 md:p-8 h-full flex flex-col justify-between group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900/50 transition-colors duration-500">
                <div className="flex justify-between items-start gap-4 z-10">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center group-hover:bg-[var(--primary-color)] group-hover:border-[var(--primary-color)] transition-colors duration-500 rounded-sm shadow-sm flex-shrink-0">
                      {item.icon && <item.icon className={`w-6 h-6 ${item.iconColor} group-hover:text-zinc-950 transition-colors`} />}
                    </div>
                    <div>
                      <h4 className="text-lg md:text-xl font-black text-zinc-900 dark:text-white leading-[1.1] uppercase tracking-tighter italic">
                        {item.title}
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Central Image Showcase */}
                <div className="relative flex-1 my-6 w-full rounded-sm overflow-hidden bg-zinc-200 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 shadow-inner group-hover:border-[var(--primary-color)]/30 transition-colors">
                   <Image
                     src={item.image}
                     alt={item.title}
                     fill
                     className="object-cover scale-100 group-hover:scale-110 transition-transform duration-700 ease-in-out"
                     loader={({ src }) => `${src}`}
                   />
                   {item.discount && (
                     <div className="absolute bottom-3 left-3 bg-[var(--primary-color)] text-zinc-950 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest shadow-md">
                       {item.discount}
                     </div>
                   )}
                </div>
                
                <div className="flex justify-between items-end z-10">
                  {item.price ? (
                    <div className="leading-tight">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">Starting At</span>
                      <p className="text-zinc-900 dark:text-white font-black text-xl tracking-tighter">{item.price}</p>
                    </div>
                  ) : (
                    <div /> // Spacer
                  )}
                  <Link href="/automotiveecommerce/products" className="inline-block relative">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-[var(--primary-color)] transition-colors">
                      Catalog Access 
                      <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                    </div>
                    {/* Hover line effect */}
                    <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-[var(--primary-color)] transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}