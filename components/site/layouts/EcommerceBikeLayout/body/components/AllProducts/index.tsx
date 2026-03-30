'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRightIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import ProductCard from '../ProductCard';
import { useStateContext } from '@/contexts/ContextProvider';

interface AllProductsProps {
  id: string;
  marketplaceListings: any[];
  themeSettings: Record<string, any> | null;
}

export default function AllProducts({ id, marketplaceListings, themeSettings }: AllProductsProps) {
  const primary = themeSettings?.primaryColor || '#FF6B00';

  if (!marketplaceListings?.length) return null;

  return (
    <section className="relative py-24 bg-[#0a0a0a] overflow-hidden">
      {/* BACKGROUND DECORATION: Blueprint Grid Effect */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
           style={{ 
             backgroundImage: `linear-gradient(${primary} 1px, transparent 1px), linear-gradient(90deg, ${primary} 1px, transparent 1px)`,
             backgroundSize: '100px 100px' 
           }} 
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* SECTION HEADER: High-Contrast & Bold */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-white/10 pb-10 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-[2px]" style={{ backgroundColor: primary }} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">
                Full Inventory
              </span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white">
              The <span className="text-outline" style={{ WebkitTextStroke: '1px #fff', color: 'transparent' }}>Showroom</span>
            </h2>
          </div>

          <motion.button 
            whileHover={{ x: 5 }}
            onClick={() => window.location.href = `/bikeecommerce/products`}
            className="flex items-center gap-4 group"
          >
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">View All</p>
              <p className="text-sm font-bold text-white uppercase tracking-tighter">Browse catalog</p>
            </div>
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white transition-all duration-300">
              <ArrowUpRightIcon className="w-5 h-5 text-white group-hover:text-black transition-colors" />
            </div>
          </motion.button>
        </div>

        {/* PRODUCTS GRID: Dark-Mode Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-white/5 border border-white/5">
          {marketplaceListings.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              viewport={{ once: true }}
              className="bg-[#0a0a0a]"
            >
              {/* Note: ProductCard should be updated to support a dark-mode prop or have internal dark-mode styles */}
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        {/* BOTTOM STATS / TRUST BAR */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-t border-white/10">
          {[
            { label: 'Precision', value: 'Aerodynamics' },
            { label: 'Battery', value: 'High Capacity' },
            { label: 'Weight', value: 'Ultra Light' },
            { label: 'Shipping', value: 'Worldwide' },
          ].map((stat, i) => (
            <div key={i} className="space-y-1">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{stat.label}</p>
              <p className="text-sm font-bold text-white uppercase italic">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}