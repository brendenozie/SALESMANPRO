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
  
  return (
    <section className="relative py-24 bg-zinc-50 dark:bg-black overflow-hidden transition-colors duration-500">
      {/* Background HUD Decorations */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-900/10 dark:via-white/10 to-transparent" />
      <div className="absolute top-10 right-10 opacity-[0.03] dark:opacity-10 pointer-events-none">
        <Squares2X2Icon className="w-40 h-40 text-zinc-900 dark:text-white" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header: The Armory Manifest */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="relative">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: '3rem' }}
              className="h-1 bg-red-600 mb-4"
            />
            <h2 className="text-5xl md:text-7xl font-black italic text-zinc-900 dark:text-white uppercase tracking-tighter leading-none transition-colors">
              ALL_<span className="text-red-600">ASSETS</span>
            </h2>
            <div className="flex items-center gap-4 mt-4 font-mono text-[10px] tracking-[0.3em] text-zinc-500 dark:text-zinc-500 uppercase font-bold">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(255,0,60,0.4)]" /> 
                Inventory_Online
              </span>
              <span>|</span>
              <span>Total_Units: {marketplaceListings.length}</span>
            </div>
          </div>

          <button 
            onClick={() => window.location.href = `/gamingecommerce/products`}
            className="group relative flex items-center gap-3 px-8 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 overflow-hidden transition-all hover:border-red-600/50 shadow-md dark:shadow-none"
          >
            <span className="relative z-10 font-black uppercase italic tracking-tighter text-sm text-zinc-900 dark:text-white group-hover:text-red-500 transition-colors">
              Access Full Archive
            </span>
            <ArrowRightIcon className="relative z-10 w-5 h-5 text-red-600 group-hover:translate-x-2 transition-transform" />
            <div className="absolute inset-0 bg-red-600/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
        </div>

        {/* Products Grid: The Deployment Slots */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12">
          {marketplaceListings.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: (index % 4) * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              {/* Tactical Corner Brackets for each card */}
              <div className="absolute -top-2 -left-2 w-4 h-4 border-t border-l border-zinc-300 dark:border-white/10 group-hover:border-red-600/50 transition-colors" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b border-r border-zinc-300 dark:border-white/10 group-hover:border-red-600/50 transition-colors" />
              
              <ProductCard product={product} />
              
              {/* Slot ID readout */}
              <div className="mt-4 font-mono text-[8px] text-zinc-400 dark:text-zinc-800 uppercase tracking-widest flex justify-between font-bold">
                <span>Ref_Node: {id.slice(0, 5)}</span>
                <span>Unit_ID: 00{index + 1}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Decoration: Data Stream */}
        <div className="mt-24 pt-8 border-t border-zinc-200 dark:border-white/5 flex justify-center">
           <div className="flex gap-8 overflow-hidden opacity-30 dark:opacity-20">
             {[...Array(5)].map((_, i) => (
               <span key={i} className="font-mono text-[9px] text-zinc-900 dark:text-white whitespace-nowrap uppercase tracking-[0.5em] animate-pulse">
                 Deploying_System_Gems_Node_0{i} // Protocol_Active
               </span>
             ))}
           </div>
        </div>
      </div>
    </section>
  );
}