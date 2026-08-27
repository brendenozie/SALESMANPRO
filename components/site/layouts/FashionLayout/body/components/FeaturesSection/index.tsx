'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TruckIcon, 
  ShieldCheckIcon, 
  TagIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

const FeaturesSection = () => {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#ef4444';

  const features = [
    { 
      icon: TruckIcon, 
      title: "Express Logistics", 
      desc: "Priority shipping on all elite orders over $200",
      tag: "Fast"
    },
    { 
      icon: ShieldCheckIcon, 
      title: "Authenticated", 
      desc: "Every pair is verified by our specialist lab",
      tag: "Secure"
    },
    { 
      icon: ArrowPathIcon, 
      title: "Infinite Returns", 
      desc: "30-day hassle-free exchange for members",
      tag: "Flexible"
    },
    { 
      icon: TagIcon, 
      title: "Price Match", 
      desc: "The best rates on the market, guaranteed",
      tag: "Value"
    },
  ];

  return (
    <section className="py-20 bg-white dark:bg-zinc-950 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-white dark:bg-zinc-950 p-8 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all duration-300"
            >
              {/* Subtle Tag */}
              <span className="absolute top-6 right-8 text-[8px] font-black uppercase tracking-[0.2em] text-gray-300 dark:text-zinc-700 group-hover:text-primary transition-colors">
                {f.tag}
              </span>

              {/* Icon Container */}
              <div className="mb-6 relative">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-[10deg]"
                  style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
                >
                  <f.icon className="w-6 h-6 stroke-[1.5]" />
                </div>
                {/* Decorative background glow */}
                <div 
                  className="absolute inset-0 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity"
                  style={{ backgroundColor: primaryColor }}
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">
                  {f.title}
                </h4>
                <p className="text-xs font-medium text-gray-500 dark:text-zinc-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>

              {/* Bottom Accent Line */}
              <div 
                className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500"
                style={{ backgroundColor: primaryColor }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;