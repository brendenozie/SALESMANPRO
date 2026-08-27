'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { ArrowRightIcon, Squares2X2Icon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/solid';
import ProductCard from '../ProductShowcaseGrid/ProductCard';

interface AllProductsProps {
  id: string;
  marketplaceListings: any[];
  themeSettings: Record<string, any> | null;
}

export default function HardwareInventoryGrid({ id, marketplaceListings, themeSettings }: AllProductsProps) {
  const { cart } = useStateContext();
  const primary = themeSettings?.primaryColor || '#F59E0B'; // Safety Amber
  const secondary = themeSettings?.secondaryColor || '#3B82F6'; // Tech Blue

  // Animation: Sharp, fast staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        ease: "easeOut"
      }
    }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <section className="relative py-32 bg-white dark:bg-[#050505] overflow-hidden">
      {/* Structural "Grid Paper" Background */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none" 
           style={{ backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`, backgroundSize: '100px 100px' }} />

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header: Industrial Command Style */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8 border-l-8 border-zinc-900 dark:border-amber-500 pl-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">
                System Catalog / v1.0
              </span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase italic">
              Heavy Duty <span className="text-transparent" style={{ WebkitTextStroke: '1px currentColor' }}>Inventory</span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/hardwareecommerce/products">
              <motion.button 
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="group flex items-center gap-4 px-10 py-5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black text-[10px] uppercase tracking-widest transition-all shadow-[8px_8px_0px_0px_rgba(245,158,11,0.5)]"
              >
                <Squares2X2Icon className="w-5 h-5 text-amber-500" />
                Access Full Manifest
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Inventory Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-1 gap-y-1 bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800"
        >
          {marketplaceListings.map((product, idx) => (
            <motion.div 
              key={product.id || idx} 
              variants={itemVariants}
              className="bg-white dark:bg-zinc-950 p-4"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        {/* Status Bar / Bottom Metric */}
        <div className="mt-20 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-zinc-100 dark:border-zinc-900 pt-12">
            <div className="flex items-center gap-8">
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Total SKUs</p>
                <p className="text-2xl font-black dark:text-white">{marketplaceListings.length}</p>
              </div>
              <div className="w-px h-10 bg-zinc-200 dark:bg-zinc-800" />
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Region</p>
                <p className="text-2xl font-black dark:text-white">KE/Nairobi</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-zinc-400">
                <AdjustmentsHorizontalIcon className="w-4 h-4" />
                <p className="text-[10px] font-bold uppercase tracking-widest italic">
                  End of Live Feed
                </p>
            </div>
        </div>
      </div>
    </section>
  );
}