'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
// Using Hero Icons as per your saved preference
import { 
  TagIcon, 
  SparklesIcon, 
  FireIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/solid';

const promoBanners = [
  {
    title: 'KIDS SHOES',
    subtitle: 'Step into Style',
    price: '$30.00',
    discount: '15%',
    image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782',
    bgColor: 'bg-[#FFF0F6]',
    textColor: 'text-pink-500',
    icon: <TagIcon className="w-5 h-5 text-pink-400" />,
    tag: 'Little Steps'
  },
  {
    title: 'FASHION',
    subtitle: 'New Season',
    price: '$20.00',
    discount: '25%',
    image: 'https://images.unsplash.com/photo-1522771935876-249711cd40f2',
    bgColor: 'bg-[#EBF4FF]',
    textColor: 'text-blue-500',
    icon: <SparklesIcon className="w-5 h-5 text-blue-400" />,
    tag: 'Trending'
  },
  {
    title: 'BLACK FRIDAY',
    subtitle: 'Biggest Drop',
    buttonText: 'Shop Sale',
    discount: '50% OFF',
    image: 'https://images.unsplash.com/photo-1532330393533-443990a51d10',
    bgColor: 'bg-slate-900',
    textColor: 'text-white',
    isSpecial: true,
    icon: <FireIcon className="w-5 h-5 text-orange-500" />,
    tag: 'Mega Deal'
  },
];

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function PromoBannerGridSection() {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#F472B6';

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {promoBanners.map((banner, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover="hover"
            className={`group relative overflow-hidden rounded-[3rem] p-10 min-h-[280px] flex flex-col justify-between shadow-sm transition-all duration-500 hover:shadow-2xl`}
            style={{ backgroundColor: banner.isSpecial ? undefined : '' }}
          >
            {/* Background Color/Gradient Logic */}
            <div className={`absolute inset-0 z-0 ${banner.bgColor}`} />
            
            {/* Floating Decorative Elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/30 rounded-full blur-2xl group-hover:bg-white/50 transition-colors" />

            {/* Content Layer */}
            <div className="relative z-20 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md shadow-sm">
                {banner.icon}
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                  {banner.tag}
                </span>
              </div>

              <div className={banner.isSpecial ? 'text-white' : 'text-slate-900'}>
                <h3 className="text-3xl font-black leading-none mb-2">
                  {banner.title}
                </h3>
                <p className={`text-sm font-bold opacity-70`}>
                  {banner.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {banner.price && (
                  <div className="flex flex-col">
                    <span className={`text-2xl font-black ${banner.textColor}`}>
                      {banner.price}
                    </span>
                    <span className="text-[10px] font-black text-slate-400">
                      Starts At
                    </span>
                  </div>
                )}
                
                {banner.discount && !banner.isSpecial && (
                   <div className="h-10 w-[1px] bg-slate-200 mx-1" />
                )}

                {banner.discount && (
                  <span className={`px-3 py-1 rounded-lg text-sm font-black bg-white shadow-sm ${banner.textColor}`}>
                    {banner.discount}
                  </span>
                )}
              </div>

              {banner.isSpecial && (
                <Link href="/shop" className="block pt-2">
                  <motion.button 
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-slate-900 text-xs font-black shadow-lg transition-transform"
                  >
                    {banner.buttonText}
                    <ArrowRightIcon className="w-4 h-4" style={{ color: primaryColor }} />
                  </motion.button>
                </Link>
              )}
            </div>

            {/* Image Layer - Floating and Scaling */}
            <motion.div 
              variants={{
                hover: { scale: 1.1, rotate: -5, y: -10 }
              }}
              className="absolute -right-4 -bottom-4 w-[60%] h-[80%] z-10"
            >
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                className="object-contain object-right-bottom drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)] group-hover:drop-shadow-[0_30px_50px_rgba(0,0,0,0.3)]"
                loader={loader}
              />
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}