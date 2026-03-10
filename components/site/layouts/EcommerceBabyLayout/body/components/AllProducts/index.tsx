'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { ArrowRightIcon, Squares2X2Icon } from '@heroicons/react/24/solid';
import ProductCard from '../ProductCard';

interface AllProductsProps {
  id: string;
  marketplaceListings: any[];
  themeSettings: Record<string, any> | null;
}

export default function AllProducts({ id, marketplaceListings, themeSettings }: AllProductsProps) {
  const { cart } = useStateContext();
  const primary = themeSettings?.primaryColor || '#F472B6';
  const secondary = themeSettings?.secondaryColor || '#3B82F6';

  // Animation variants for the grid container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <section className="relative py-24 bg-white dark:bg-zinc-950 overflow-hidden">
      {/* Soft Ambient Glows */}
      <div 
        className="absolute top-0 right-0 w-[500px] h-[500px] blur-[150px] opacity-[0.03] pointer-events-none rounded-full"
        style={{ backgroundColor: primary }}
      />
      <div 
        className="absolute bottom-0 left-0 w-[500px] h-[500px] blur-[150px] opacity-[0.03] pointer-events-none rounded-full"
        style={{ backgroundColor: secondary }}
      />

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Section Header: Boutique Style */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-1 rounded-full" style={{ backgroundColor: primary }} />
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-400">
                Our Collection
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-zinc-900 dark:text-white tracking-tighter">
              Explore Everything<span style={{ color: primary }}>.</span>
            </h2>
          </div>

          <Link href="/ecommerce/products">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group flex items-center gap-4 px-8 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-white font-black text-sm transition-all hover:shadow-xl hover:border-transparent"
            >
              <Squares2X2Icon className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
              View Full Catalog
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
        </div>

        {/* Products Grid with Framer Motion */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16"
        >
          {marketplaceListings.map((product, idx) => (
            <motion.div key={product.id || idx} variants={itemVariants}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Callout: Simple & Clean */}
        <div className="mt-24 text-center">
            <div className="inline-block p-[1px] rounded-full bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent w-full max-w-2xl mb-12" />
            <p className="text-zinc-400 font-medium italic">
              Showing {marketplaceListings.length} items from our nursery vault
            </p>
        </div>
      </div>
    </section>
  );
}