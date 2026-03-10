'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
// import { CategorySectionProps } from '@/types/typings'; // Assuming interface is exported there
import Image from 'next/image';
import Link from 'next/link';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const dummyPromotionData = {
  title: 'Summer Collection',
  description: 'We have a lot of trendy shoes with wholesale prices in the summer collection.',
  bannerUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
  ctaText: 'Explore',
  ctaLink: '/shop/summer',
  featureImage1: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
  perks: [
    { label: 'TRENDY' },
    { label: 'POPULAR' },
    { label: 'LATEST' },
  ],
  trustLogos: [
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/1088px-Adidas_Logo.svg.png?20240107104015",
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/1200px-Logo_NIKE.svg.png",
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Vans-logo.svg/1187px-Vans-logo.svg.png?20150315211742",
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Puma-logo-%28text%29.svg/768px-Puma-logo-%28text%29.svg.png?20230824220146",
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/New_Balance_logo.svg/450px-New_Balance_logo.svg.png?20160801155106",
                  // "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Reebok_wordmark_%282008%E2%80%932014%29.svg/450px-Reebok_wordmark_%282008%E2%80%932014%29.svg.png?20090503203208"
                ],
};



export default function CategorySection({ promotions, themeSettings }: any) {
  const primary = themeSettings?.primaryColor || '#ef4444'; // default red-500

  const categoryData = promotions && promotions.length > 0
    ? { ...promotions[0], trustLogos: dummyPromotionData.trustLogos }
    : dummyPromotionData;

  return (
    <section className="py-20 bg-white dark:bg-slate-950 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16">
        
        {/* LEFT SIDE: Visuals */}
        <div className="w-full lg:w-3/5 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative w-full flex items-center justify-center"
          >
            {/* Background Glow for Dark Mode */}
            <div className="absolute inset-0 bg-red-500/10 dark:bg-red-500/5 blur-[120px] rounded-full" />
            
            <Image
              src={categoryData.bannerUrl || ''}
              alt={categoryData.title}
              width={600}
              height={600}
              loader={loader}
              className="object-contain -rotate-12 hover:rotate-0 transition-transform duration-700 ease-out z-10 drop-shadow-2xl"
            />
          </motion.div>

          {/* Perks Tags */}
          <div className="flex flex-wrap justify-center gap-3 mt-12">
            {categoryData.perks.map((perk: any, idx: number) => (
              <span
                key={idx}
                className="px-5 py-2 rounded-full border border-gray-200 dark:border-slate-800 text-xs font-bold tracking-widest text-gray-800 dark:text-slate-200 bg-white dark:bg-slate-900 shadow-sm"
              >
                {perk.label}
              </span>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE: Content */}
        <div className="w-full lg:w-2/5 flex flex-col gap-10">
          <div className="bg-pink-50 dark:bg-slate-900/50 p-10 rounded-[2rem] border border-pink-100/50 dark:border-slate-800 transition-colors">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-red-500 dark:text-red-400">
              Trendy Styles
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mt-4 leading-tight">
              {categoryData.title}
            </h2>
            <p className="mt-4 text-gray-600 dark:text-slate-400 text-lg leading-relaxed">
              {categoryData.description}
            </p>
          </div>

          <div className="flex items-center gap-8">
            <div className="relative flex-1 bg-gray-100 dark:bg-slate-900 rounded-[2rem] p-4 flex justify-center items-center overflow-hidden">
               <Image
                src={categoryData.featureImage1 || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80'}
                alt="Feature"
                width={200}
                height={200}
                loader={loader}
                className="object-contain -rotate-12 drop-shadow-lg"
              />
            </div>

            <Link href={categoryData.ctaLink || '/shop'} className="group">
              <div 
                style={{ backgroundColor: primary }}
                className="h-48 w-20 rounded-[2rem] text-white flex items-center justify-center cursor-pointer hover:brightness-110 transition-all shadow-xl shadow-red-500/20"
              >
                <span className="rotate-90 text-xl font-black whitespace-nowrap flex items-center gap-2">
                  {categoryData.ctaText} 
                  <ArrowUpRightIcon className="h-6 w-6 stroke-[3] -rotate-90 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </span>
              </div>
            </Link>
          </div>

          {/* Brand Trust Section */}
          <div className="pt-6">
            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6">
              Official Partners
            </p>
            <div className="flex flex-wrap items-center gap-8 grayscale opacity-50 dark:invert transition-all">
              {categoryData.trustLogos.map((logo: string, idx: number) => (
                <Image 
                  key={idx} 
                  src={logo || 'https://via.placeholder.com/100x50?text=Brand'} 
                  loader={loader}
                  alt="Brand" 
                  width={50} 
                  height={25} 
                  className="object-contain h-6 w-auto" 
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}