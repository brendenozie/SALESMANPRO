'use client';

import React from 'react';
import { 
  TruckIcon, 
  WrenchScrewdriverIcon, 
  ShieldCheckIcon, 
  ArrowPathRoundedSquareIcon 
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';
import { motion } from 'framer-motion';

const features = [
  {
    title: 'Site Delivery',
    description: 'Direct to your project location',
    tag: 'LOGISTICS-01',
    Icon: TruckIcon,
  },
  {
    title: 'Technical Support',
    description: 'Expert guidance on every tool',
    tag: 'SUPPORT-02',
    Icon: WrenchScrewdriverIcon,
  },
  {
    title: 'Verified Warranty',
    description: '100% Genuine product cover',
    tag: 'SECURE-03',
    Icon: ShieldCheckIcon,
  },
  {
    title: 'Easy Exchange',
    description: 'Hassle-free hardware returns',
    tag: 'RETURN-04',
    Icon: ArrowPathRoundedSquareIcon,
  },
];

export default function FeaturesBarSection() {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#F59E0B'; // Default Safety Amber

  return (
    <section className="relative py-12 bg-white dark:bg-[#080808] overflow-hidden">
      {/* Structural Divider Lines */}
      <div className="absolute top-0 inset-x-0 h-px bg-zinc-200 dark:bg-zinc-800 opacity-50" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-zinc-200 dark:bg-zinc-800 opacity-50" />

      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-zinc-800 border-x border-zinc-200 dark:border-zinc-800">
          
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative p-8 md:p-10 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors duration-500"
            >
              {/* Technical Serial Tag */}
              <span className="absolute top-4 right-6 text-[8px] font-black tracking-[0.3em] text-zinc-300 dark:text-zinc-700 uppercase group-hover:text-amber-500 transition-colors">
                {feature.tag}
              </span>

              <div className="flex flex-col gap-6">
                {/* Industrial Icon Frame */}
                <div className="relative w-14 h-14 flex items-center justify-center">
                  {/* Square Outline Rotation Effect */}
                  <div className="absolute inset-0 border border-zinc-200 dark:border-zinc-800 rounded-xl group-hover:rotate-45 transition-transform duration-500" />
                  <div className="absolute inset-0 border border-transparent group-hover:border-amber-500/30 rounded-xl group-hover:-rotate-45 transition-transform duration-700" />
                  
                  <feature.Icon 
                    className="h-7 w-7 transition-all duration-500 group-hover:scale-110" 
                    style={{ color: primaryColor }}
                  />
                </div>

                {/* Text Content */}
                <div className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-tighter text-zinc-900 dark:text-white group-hover:translate-x-1 transition-transform">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 font-bold uppercase tracking-tight leading-relaxed max-w-[200px]">
                    {feature.description}
                  </p>
                </div>
              </div>

              {/* Bottom "Active" Indicator */}
              <div 
                className="absolute bottom-0 left-0 w-0 h-1 group-hover:w-full transition-all duration-700"
                style={{ backgroundColor: primaryColor }}
              />
            </motion.div>
          ))}

        </div>
      </div>
    </section>
  );
}