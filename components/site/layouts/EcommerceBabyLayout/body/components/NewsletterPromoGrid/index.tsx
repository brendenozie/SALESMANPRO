'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
// Using Hero Icons as per your saved preference
import { 
  SparklesIcon, 
  ShoppingBagIcon, 
  GiftIcon, 
  RocketLaunchIcon,
  HeartIcon
} from '@heroicons/react/24/solid';

const promoItems = [
  {
    id: 1,
    title: 'GIVEAWAY',
    label: 'LEGO Movie',
    bgColor: 'bg-indigo-50',
    icon: <GiftIcon className="w-6 h-6 text-indigo-400" />,
    image: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60', 
    gridClass: 'md:col-span-1 md:row-span-1',
  },
  {
    id: 2,
    title: 'HAPPY KIDS',
    price: '$30.00',
    discount: '15% OFF',
    bgColor: 'bg-blue-50',
    icon: <HeartIcon className="w-6 h-6 text-blue-400" />,
    image: 'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01',
    gridClass: 'md:col-span-1 md:row-span-1',
  },
  {
    id: 3,
    title: 'Summer Sale',
    highlight: 'BIG SALE',
    subtitle: 'Limited Time Only',
    bgColor: 'bg-pink-50',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4',
    gridClass: 'md:col-span-2 md:row-span-2', 
    isCenter: true,
  },
  {
    id: 4,
    title: 'STROLLERS',
    bgColor: 'bg-amber-50',
    icon: <RocketLaunchIcon className="w-6 h-6 text-amber-400" />,
    image: 'https://images.unsplash.com/photo-1591339102716-4bc24f7c41bc',
    gridClass: 'md:col-span-1 md:row-span-1',
  },
  {
    id: 5,
    title: 'PLAY TIME',
    bgColor: 'bg-emerald-50',
    icon: <SparklesIcon className="w-6 h-6 text-emerald-400" />,
    image: 'https://images.unsplash.com/photo-1566438480900-0609be27a4be',
    gridClass: 'md:col-span-1 md:row-span-1',
  },
];

export default function NewsletterPromoGrid() {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#F472B6';
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#3B82F6';

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 auto-rows-[240px]">
        {promoItems.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className={`group relative rounded-[3rem] overflow-hidden flex flex-col ${item.gridClass} ${item.bgColor} border border-white shadow-sm hover:shadow-2xl transition-all duration-500`}
          >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover opacity-20 group-hover:scale-110 group-hover:rotate-2 transition-transform duration-700"
                loader={({ src }) => `${src}?auto=format&fit=crop&w=600&q=80`}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />
            </div>

            {/* Content Container */}
            <div className={`relative z-10 p-8 h-full flex flex-col ${item.isCenter ? 'items-center justify-center text-center' : 'justify-between'}`}>
              
              {item.isCenter ? (
                <div className="space-y-4">
                  <div className="inline-block px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-pink-100">
                    <span className="text-[10px] font-black tracking-[0.2em] text-pink-500 uppercase">{item.title}</span>
                  </div>
                  <h3 className="text-6xl md:text-7xl font-black tracking-tighter leading-none" style={{ color: secondaryColor }}>
                    {item.highlight}
                  </h3>
                  <p className="text-slate-500 font-bold italic">{item.subtitle}</p>
                  <Link href="/shop" className="block pt-4">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-10 py-4 rounded-[2rem] text-white font-black text-lg shadow-xl flex items-center gap-2 mx-auto"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <ShoppingBagIcon className="w-5 h-5" />
                      Grab the Deal
                    </motion.button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm">
                      {item.icon}
                    </div>
                    {item.discount && (
                      <span className="bg-white px-3 py-1 rounded-full text-[10px] font-black text-blue-500 shadow-sm border border-blue-50">
                        {item.discount}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-black text-slate-800 leading-tight mb-2">{item.title}</h4>
                    {item.price && (
                      <p className="text-blue-600 font-black text-2xl mb-3">{item.price}</p>
                    )}
                    <Link href="/shop">
                      <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">
                        View Details 
                        <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:translate-x-1 transition-transform">→</span>
                      </button>
                    </Link>
                  </div>
                </>
              )}
            </div>
            
            {/* Floating Decorative Glow */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}