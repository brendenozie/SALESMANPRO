'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon, AdjustmentsHorizontalIcon, CubeIcon } from '@heroicons/react/24/outline';
import ProductCard from '../ProductCard';
import Link from 'next/link';

interface AllProductsProps {
  id: string;
  marketplaceListings: any[];
  themeSettings: Record<string, any> | null;
}

export default function AllProducts({ marketplaceListings, id }: AllProductsProps) {
  return (
    <section className="py-32 bg-white dark:bg-[#080808] relative overflow-hidden transition-colors duration-500">
      {/* Subtle Heritage Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header: The Registry Style */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 text-red-600 dark:text-red-500 mb-6"
            >
              <CubeIcon className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">The Full Selection</span>
            </motion.div>
            
            <h2 className="text-5xl md:text-8xl font-black text-stone-950 dark:text-white leading-[0.8] tracking-tighter">
              Heritage <br />
              <span className="italic font-serif font-light text-stone-400 dark:text-stone-600">Stock.</span>
            </h2>
          </div>

          <div className="flex flex-col items-start md:items-end gap-6">
            <div className="flex items-center gap-2 text-stone-400 dark:text-stone-600">
                <span className="text-xs font-bold font-mono uppercase tracking-widest">{marketplaceListings.length} Items Listed</span>
            </div>
            
            <Link 
              href={`/meatecommerce/products?companyId=${id}`}
              className="group flex items-center gap-4 px-10 py-5 bg-stone-950 dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 transition-all"
            >
              View Full Catalog 
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Products Grid: Spacious & Clean */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-20">
          {marketplaceListings.map((product, i) => (
            <div key={product.id} className="relative">
                {/* Visual marker for the "Registry" look */}
                <div className="absolute -top-6 left-0 w-full h-px bg-stone-100 dark:bg-stone-900" />
                <ProductCard product={product} index={i} />
            </div>
          ))}
        </div>

        {/* Footer Accent */}
        <div className="mt-32 pt-12 border-t border-stone-100 dark:border-stone-900 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                    <span className="text-[10px] font-black text-stone-900 dark:text-white uppercase tracking-widest">Restocking Daily</span>
                </div>
                <div className="h-4 w-px bg-stone-200 dark:bg-stone-800" />
                <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Direct Farm Sourcing</div>
            </div>
            
            <div className="flex items-center gap-2 text-stone-400 dark:text-stone-600">
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase">Filter Results</span>
            </div>
        </div>
      </div>
    </section>
  );
}