'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  SparklesIcon, 
  ShoppingBagIcon, 
  GiftIcon, 
  RocketLaunchIcon,
  HeartIcon,
  ArrowRightIcon
} from '@heroicons/react/24/solid';

const promoItems = [
  {
    id: 1,
    title: 'GIVEAWAY',
    label: 'LEGO Movie',
    bgColor: 'bg-rose-50 dark:bg-rose-950/20',
    iconColor: 'text-rose-400',
    icon: GiftIcon,
    image: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60', 
    gridClass: 'md:col-span-1 md:row-span-1',
  },
  {
    id: 2,
    title: 'HAPPY KIDS',
    price: '$30.00',
    discount: '15% OFF',
    bgColor: 'bg-sky-50 dark:bg-sky-950/20',
    iconColor: 'text-sky-400',
    icon: HeartIcon,
    image: 'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01',
    gridClass: 'md:col-span-1 md:row-span-1',
  },
  {
    id: 3,
    title: 'Summer Sale',
    highlight: 'BIG SALE',
    subtitle: 'Limited Time Only',
    bgColor: 'bg-pink-50 dark:bg-pink-900/10',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4',
    gridClass: 'md:col-span-2 md:row-span-2', 
    isCenter: true,
  },
  {
    id: 4,
    title: 'STROLLERS',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
    iconColor: 'text-amber-400',
    icon: RocketLaunchIcon,
    image: 'https://images.unsplash.com/photo-1591339102716-4bc24f7c41bc',
    gridClass: 'md:col-span-1 md:row-span-1',
  },
  {
    id: 5,
    title: 'PLAY TIME',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
    iconColor: 'text-emerald-400',
    icon: SparklesIcon,
    image: 'https://images.unsplash.com/photo-1566438480900-0609be27a4be',
    gridClass: 'md:col-span-1 md:row-span-1',
  },
];

export default function NewsletterPromoGrid() {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#F472B6';
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#3B82F6';

  return (
    <section className="max-w-[1800px] mx-auto px-6 py-24 bg-white dark:bg-zinc-950 transition-colors duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-8 auto-rows-[280px]">
        {promoItems.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
            viewport={{ once: true }}
            className={`group relative rounded-[4rem] overflow-hidden ${item.gridClass} ${item.bgColor} border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-3xl hover:-translate-y-2 transition-all duration-700`}
          >
            {/* Image Layer with Parallax-ready Scale */}
            <div className="absolute inset-0">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover opacity-30 dark:opacity-20 mix-blend-multiply dark:mix-blend-overlay group-hover:scale-110 transition-transform duration-[1.5s]"
                loader={({ src }) => `${src}?auto=format&fit=crop&w=800&q=80`}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-white/60 dark:from-zinc-900/60 to-transparent" />
            </div>

            {/* Content Layer */}
            <div className={`relative z-10 p-10 h-full flex flex-col ${item.isCenter ? 'items-center justify-center text-center' : 'justify-between'}`}>
              
              {item.isCenter ? (
                <div className="space-y-6">
                  <motion.div 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="inline-block px-6 py-2 rounded-full bg-white dark:bg-zinc-800 shadow-xl border border-pink-100 dark:border-zinc-700"
                  >
                    <span className="text-[11px] font-black tracking-[0.4em] text-pink-500 uppercase">{item.title}</span>
                  </motion.div>
                  
                  <h3 className="text-7xl md:text-8xl font-black tracking-tighter leading-[0.8] dark:text-white" style={{ color: secondaryColor }}>
                    {item.highlight}
                  </h3>
                  
                  <p className="text-zinc-500 dark:text-zinc-400 font-bold text-lg italic">{item.subtitle}</p>
                  
                  <Link href="/ecommerce/products" className="block pt-4">
                    <motion.button 
                      whileHover={{ scale: 1.05, boxShadow: `0 20px 40px ${primaryColor}44` }}
                      whileTap={{ scale: 0.95 }}
                      className="px-12 py-5 rounded-[2.5rem] text-white font-black text-xl shadow-2xl flex items-center gap-3 mx-auto transition-all"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <ShoppingBagIcon className="w-6 h-6" />
                      Grab the Deal
                    </motion.button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                      {item.icon && <item.icon className={`w-7 h-7 ${item.iconColor}`} />}
                    </div>
                    {item.discount && (
                      <span className="bg-white dark:bg-zinc-800 px-4 py-1.5 rounded-full text-[11px] font-black text-sky-500 shadow-md border border-sky-50 dark:border-zinc-700 uppercase tracking-widest">
                        {item.discount}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-2xl font-black text-zinc-900 dark:text-white leading-tight">{item.title}</h4>
                    {item.price && (
                      <p className="text-sky-500 dark:text-sky-400 font-black text-3xl">{item.price}</p>
                    )}
                    <Link href="/ecommerce/products">
                      <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                        View Details 
                        <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-md group-hover:translate-x-2 transition-all">
                          <ArrowRightIcon className="w-4 h-4" />
                        </div>
                      </button>
                    </Link>
                  </div>
                </>
              )}
            </div>
            
            {/* Subtle Gradient Glow on Hover */}
            <div 
              className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none" 
              style={{ backgroundColor: primaryColor }}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}