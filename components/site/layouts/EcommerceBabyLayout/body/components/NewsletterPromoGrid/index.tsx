'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';

const promoItems = [
  {
    id: 1,
    title: 'SPECIAL GIVEAWAY',
    label: 'LEGO Movie',
    bgColor: 'bg-[#EBF4FF]', // Soft Blue
    image: '/lego-promo.png',
    gridClass: 'col-span-1 row-span-1',
  },
  {
    id: 2,
    title: 'HAPPY CHILDREN',
    price: '$30.00',
    discount: '15%',
    bgColor: 'bg-[#EBF4FF]',
    image: '/children-promo.png',
    gridClass: 'col-span-1 row-span-1',
  },
  {
    id: 3,
    title: 'Summer',
    highlight: 'SALE',
    subtitle: 'Shop Now',
    bgColor: 'bg-[#FFF0F6]', // Soft Pink centerpiece
    image: '/summer-sale-icon.png',
    gridClass: 'col-span-2 row-span-2', // Center Large Banner
    isCenter: true,
  },
  {
    id: 4,
    title: 'BABY STROLLER',
    bgColor: 'bg-[#EBF4FF]',
    image: '/stroller-promo.png',
    gridClass: 'col-span-1 row-span-1',
  },
  {
    id: 5,
    title: 'PLAY TIME',
    bgColor: 'bg-[#EBF4FF]',
    image: '/play-promo.png',
    gridClass: 'col-span-1 row-span-1',
  },
];

export default function NewsletterPromoGrid() {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#F472B6';
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#3B82F6';

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-10 py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 h-auto md:h-[500px]">
        {promoItems.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.02 }}
            className={`relative rounded-[2.5rem] p-8 overflow-hidden flex flex-col ${item.gridClass} ${item.bgColor}`}
          >
            {/* Content Container */}
            <div className={`relative z-10 ${item.isCenter ? 'text-center flex flex-col items-center justify-center h-full' : ''}`}>
              {item.isCenter ? (
                <>
                  <h2 className="text-4xl font-bold text-pink-400 font-serif italic">
                    {item.title}
                  </h2>
                  <h3 className="text-7xl font-black tracking-tighter" style={{ color: secondaryColor }}>
                    {item.highlight}
                  </h3>
                  <Link href="/shop" className="mt-6">
                    <button 
                      className="px-8 py-3 rounded-2xl text-white font-black text-sm shadow-lg hover:brightness-95 transition-all"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {item.subtitle}
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  <h4 className="text-sm font-black text-gray-900 mb-1">{item.title}</h4>
                  {item.price && (
                    <div className="flex items-center gap-1">
                      <span className="text-blue-500 font-black">{item.price}</span>
                      <span className="text-[10px] text-blue-300 font-bold">/{item.discount}</span>
                    </div>
                  )}
                  <button 
                    className="mt-4 px-5 py-2 rounded-xl text-white text-[10px] font-black uppercase tracking-wider shadow-sm"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    Shop Now
                  </button>
                </>
              )}
            </div>

            {/* Image Layer */}
            <div className={`absolute bottom-0 right-0 ${item.isCenter ? 'w-full h-1/2 opacity-20' : 'w-1/2 h-full'}`}>
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-contain object-right-bottom p-4"
                loader={({ src }) => src}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}