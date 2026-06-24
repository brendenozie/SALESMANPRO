'use client';

import React from 'react';
import { 
  TruckIcon, 
  ChatBubbleLeftRightIcon, 
  ShieldCheckIcon, 
  ArrowPathIcon 
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';
import { motion } from 'framer-motion';

const features = [
  {
    title: 'Free Delivery',
    description: 'On all curated orders',
    Icon: TruckIcon,
  },
  {
    title: 'Expert Support',
    description: 'Available every hour',
    Icon: ChatBubbleLeftRightIcon,
  },
  {
    title: 'Secure Haven',
    description: '100% Protected payments',
    Icon: ShieldCheckIcon,
  },
  {
    title: 'Happy Returns',
    description: '30-Day peace of mind',
    Icon: ArrowPathIcon,
  },
];

export default function FeaturesBarSection({ coreValues, themeSettings }: { coreValues: any[]; themeSettings: any }) {
  
  const primaryColor = themeSettings?.primaryColor || '#FF8FA3';
  const valuesToShow = coreValues && coreValues.length > 0 ? coreValues : features;

  return (
    <section className="relative py-16 bg-white dark:bg-zinc-950 overflow-hidden">
      {/* Background soft accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-zinc-100 dark:via-zinc-800 to-transparent" />

      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {valuesToShow.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="relative group p-6 rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-900/50 border border-transparent hover:border-white dark:hover:border-zinc-800 hover:shadow-2xl hover:shadow-zinc-200/50 dark:hover:shadow-none transition-all duration-500"
            >
              <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-5">
                
                {/* Icon with Organic "Blob" Background */}
                <div className="relative flex-shrink-0">
                  <div 
                    className="absolute inset-0 scale-150 blur-xl opacity-20 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <div 
                    className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center bg-white dark:bg-zinc-800 shadow-sm transition-transform duration-500 group-hover:rotate-6"
                  >
                    <feature.Icon 
                      className="h-7 w-7 transition-colors duration-300" 
                      style={{ color: primaryColor }}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                    {feature.description}
                  </p>
                </div>

              </div>

              {/* Decorative Corner Accent */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-zinc-100 dark:via-zinc-800 to-transparent" />
    </section>
  );
}