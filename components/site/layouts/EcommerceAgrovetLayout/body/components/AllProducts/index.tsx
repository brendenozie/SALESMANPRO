'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon, BeakerIcon } from '@heroicons/react/24/outline';
import ProductCard from '../ProductCard';

interface AllProductsProps {
  id: string;
  marketplaceListings: any[];
  themeSettings: Record<string, any> | null;
}

export default function AllProducts({ marketplaceListings }: AllProductsProps) {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Subtle Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-slate-100 pb-12">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-emerald-600 mb-4"
            >
              <BeakerIcon className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Scientific Grade Inputs</span>
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-none tracking-tighter">
              The <span className="italic font-serif font-light text-emerald-600">Premium</span> Inventory.
            </h2>
          </div>

          <motion.button 
            whileHover={{ x: 5 }}
            onClick={() => window.location.href = `/agrovetecommerce/products`}
            className="group flex items-center gap-3 text-slate-900 font-black uppercase text-xs tracking-widest border-b-2 border-emerald-500 pb-1 transition-all"
          >
            Explore Full Catalog 
            <ArrowRightIcon className="w-4 h-4 group-hover:text-emerald-600" />
          </motion.button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {marketplaceListings.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}