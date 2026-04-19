'use client';

import { useStateContext } from '@/contexts/ContextProvider';
import { ArrowRightIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import React from 'react';
import ProductCard from '../ProductCard';
import { motion } from 'framer-motion';

interface AllProductsProps {
  id: string;
  marketplaceListings: any[];
  themeSettings: Record<string, any> | null;
}

export default function AllProducts({ id, marketplaceListings, themeSettings }: AllProductsProps) {
  const { cart } = useStateContext();
  const primary = themeSettings?.primaryColor || '#f97316';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (!marketplaceListings?.length) return null;

  return (
    <section className="relative py-24 bg-white dark:bg-[#050505] transition-colors duration-300">
      {/* Decorative Grid Pattern Overlay - Adjusted opacity for light mode */}
      <div 
        className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: `radial-gradient(${primary} 1px, transparent 1px)`, 
          backgroundSize: '40px 40px' 
        }} 
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primary }} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/40 dark:text-white/40">
                Full Inventory
              </span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-black dark:text-white tracking-tighter italic uppercase leading-none">
              Explore <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-black via-black/50 to-black/10 dark:from-white dark:via-white/50 dark:to-white/10">
                All Gear.
              </span>
            </h2>
          </div>

          <div className="flex flex-col items-start md:items-end gap-4">
            <p className="text-black/40 dark:text-white/40 text-xs font-bold uppercase tracking-widest">
              Showing {marketplaceListings.length} Premium Units
            </p>
            <button 
              onClick={() => window.location.href = `/earphonesecommerce/products`}
              className="group flex items-center gap-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 px-8 py-4 rounded-2xl transition-all"
            >
              <Squares2X2Icon className="w-5 h-5 text-black dark:text-white" />
              <span className="text-xs font-black uppercase tracking-widest text-black dark:text-white">Advanced Filter</span>
              <ArrowRightIcon className="w-4 h-4 text-black/30 dark:text-white/50 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-8"
        >
          {marketplaceListings.map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Call to Action */}
        <div className="mt-24 pt-12 border-t border-black/5 dark:border-white/5 flex justify-center">
          <button 
            onClick={() => window.location.href = `/earphonesecommerce/products`}
            className="group relative overflow-hidden px-12 py-6 rounded-full border border-black/10 dark:border-white/10 hover:border-black/40 dark:hover:border-white/40 transition-all bg-transparent"
          >
            <span className="relative z-10 text-black dark:text-white font-black uppercase tracking-[0.3em] text-sm">
              View Extended Catalog
            </span>
            {/* The primary color shimmer is preserved for both modes */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"
              style={{ color: primary }}
            />
          </button>
        </div>
      </div>
    </section>
  );
}