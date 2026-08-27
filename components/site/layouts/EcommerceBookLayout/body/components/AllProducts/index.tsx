'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { 
  ArrowRightIcon, 
  PlusIcon 
} from '@heroicons/react/24/outline';
import ProductCard from '../ProductCard';

interface AllProductsProps {
  id: string;
  marketplaceListings: any[];
  themeSettings: Record<string, any> | null;
}

export default function AllProducts({ marketplaceListings, themeSettings }: AllProductsProps) {
  const primary = themeSettings?.primaryColor || '#0D9488';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section className="relative py-32 bg-[#FDFDFB] dark:bg-zinc-950 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Section Header: Minimalist Studio Style */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-24 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-[1px] bg-zinc-300 dark:bg-zinc-800" />
              <span className="font-mono text-[9px] uppercase tracking-[0.5em] text-zinc-400">
                Studio Catalog
              </span>
            </div>
            
            <h2 className="text-6xl md:text-8xl font-serif text-zinc-900 dark:text-white leading-[0.8] tracking-tighter">
              The Full <br />
              <span className="italic font-serif text-zinc-400 dark:text-zinc-600">Archive</span>
            </h2>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-6">
            <Link href="/bookecommerce/products" className="group">
              <motion.div 
                whileHover={{ gap: '2rem' }}
                className="flex items-center gap-6 pb-2 border-b border-zinc-200 dark:border-zinc-800 transition-all"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-900 dark:text-white">
                  Enter Collection
                </span>
                <ArrowRightIcon className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
              </motion.div>
            </Link>
            <p className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest">
              Available Units: {marketplaceListings.length}
            </p>
          </div>
        </div>

        {/* Products Grid: Editorial Spacing */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-20 md:gap-y-32"
        >
          {marketplaceListings.map((product, idx) => (
            <motion.div key={product.id || idx} variants={itemVariants}>
              <div className="relative group">
                {/* Index Number Overlay */}
                <div className="absolute -top-4 -left-2 z-20 pointer-events-none">
                  <span className="font-mono text-[8px] text-zinc-300 dark:text-zinc-800 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                    REF. {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                  </span>
                </div>
                <ProductCard product={product} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Callout: Architectural Line */}
        <div className="mt-32 pt-16 border-t border-zinc-100 dark:border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primary }} />
             <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-400">
               End of Catalog 2026
             </p>
          </div>
          
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="font-mono text-[9px] uppercase tracking-[0.4em] text-zinc-900 dark:text-white hover:opacity-50 transition-opacity"
          >
            Back to Top ↑
          </button>
        </div>
      </div>
    </section>
  );
}