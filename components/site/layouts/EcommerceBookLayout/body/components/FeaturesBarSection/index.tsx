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
    title: 'Nairobi Delivery',
    description: 'Pristine handling on all curated orders',
    Icon: TruckIcon,
    code: 'LOG-01'
  },
  {
    title: 'Expert Curation',
    description: 'Literary guidance available every hour',
    Icon: ChatBubbleLeftRightIcon,
    code: 'SPT-02'
  },
  {
    title: 'Secure Haven',
    description: 'Encrypted and protected transactions',
    Icon: ShieldCheckIcon,
    code: 'SEC-03'
  },
  {
    title: 'Happy Returns',
    description: '30-Day effortless exchange policy',
    Icon: ArrowPathIcon,
    code: 'RTN-04'
  },
];

export default function FeaturesBarSection() {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0D9488'; // Teal

  return (
    <section className="relative py-24 bg-[#FDFDFB] dark:bg-zinc-950 transition-colors duration-500 overflow-hidden">
      {/* Structural Accents */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent" />
      
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-100 dark:divide-zinc-800 border-x border-zinc-100 dark:border-zinc-800">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              className="group relative p-8 md:p-12 hover:bg-white dark:hover:bg-zinc-900 transition-all duration-700 cursor-default"
            >
              <div className="relative z-10 space-y-8">
                {/* Meta Header */}
                <div className="flex justify-between items-start">
                  <div 
                    className="p-3 bg-zinc-50 dark:bg-zinc-800 group-hover:rotate-[-12deg] transition-transform duration-500"
                    style={{ borderLeft: `2px solid ${primaryColor}` }}
                  >
                    <feature.Icon 
                      className="h-6 w-6 text-zinc-900 dark:text-white" 
                    />
                  </div>
                  <span className="font-mono text-[9px] text-zinc-300 dark:text-zinc-600 tracking-widest">
                    {feature.code}
                  </span>
                </div>

                {/* Main Content */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light leading-relaxed max-w-[200px]">
                    {feature.description}
                  </p>
                </div>

                {/* Decorative Bottom Line */}
                <div className="pt-4">
                  <div className="w-0 group-hover:w-full h-[1px] bg-zinc-900 dark:bg-white transition-all duration-700 opacity-20" />
                </div>
              </div>

              {/* Hover Background Detail */}
              <div className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden">
                <div 
                  className="absolute -right-4 -bottom-4 w-24 h-24 blur-3xl rounded-full opacity-10"
                  style={{ backgroundColor: primaryColor }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent" />
    </section>
  );
}