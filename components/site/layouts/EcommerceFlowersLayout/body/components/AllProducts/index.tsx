'use client';

import { useStateContext } from '@/contexts/ContextProvider';
import { ArrowRightIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import React from 'react';
import ProductCard from '../ProductCard';
import { motion } from 'framer-motion';

interface AllProductsProps {
  id: string;
  marketplaceListings: any[];
  themeSettings: Record<string, any> | null;
}

export default function AllProducts({ id, marketplaceListings, themeSettings }: AllProductsProps) {
  const primary = themeSettings?.primaryColor || '#10B981';

  return (
    <section className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header: The Library Feel */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-slate-400 text-[11px] uppercase tracking-[0.4em] font-bold block"
            >
              The Archive
            </motion.span>
            <h2 className="text-5xl md:text-6xl font-serif italic text-slate-900 leading-[0.8]">
              Botanical <span className="text-slate-300">Library</span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Minimal Filter Indicator / Category Pills */}
            <span className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-50/50">
              <AdjustmentsHorizontalIcon className="w-3 h-3" /> Filter Archive
            </span>
            <button 
              onClick={() => window.location.href = `/flowersecommerce/products`}
              className="flex items-center gap-3 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-[0.2em] px-8 py-4 rounded-full hover:bg-slate-800 transition-all shadow-xl hover:shadow-slate-200"
            >
              Explore Full Catalog <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Products Grid: Sophisticated Spacing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-20">
          {marketplaceListings.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: (index % 4) * 0.1 }}
              viewport={{ once: true }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        {/* Bottom Call to Action */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-24 pt-12 border-t border-slate-100 flex flex-col items-center text-center"
        >
          <p className="text-slate-400 font-serif italic text-lg mb-6">
            Couldn't find exactly what you were looking for?
          </p>
          <button 
             onClick={() => window.location.href = `/flowersecommerce/products`}
             className="group text-slate-900 font-bold uppercase tracking-[0.3em] text-[12px] flex items-center gap-3 border-b-2 border-slate-900 pb-1 hover:text-rose-500 hover:border-rose-500 transition-all"
          >
            Custom Arrangements <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}