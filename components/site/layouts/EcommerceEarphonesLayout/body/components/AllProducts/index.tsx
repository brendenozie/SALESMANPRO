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

  // Container animation variants for the staggered grid effect
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
    <section className="relative py-24 bg-[#050505]">
      {/* Decorative Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(${primary} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header: Brutalist Alignment */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primary }} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Full Inventory</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic uppercase leading-none">
              Explore <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/50 to-white/10">
                All Gear.
              </span>
            </h2>
          </div>

          <div className="flex flex-col items-start md:items-end gap-4">
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
              Showing {marketplaceListings.length} Premium Units
            </p>
            <button 
              onClick={() => window.location.href = `/earphonesecommerce/products`}
              className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-4 rounded-2xl transition-all"
            >
              <Squares2X2Icon className="w-5 h-5 text-white" />
              <span className="text-xs font-black uppercase tracking-widest text-white">Advanced Filter</span>
              <ArrowRightIcon className="w-4 h-4 text-white/50 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Products Grid: Framer Motion Staggered Entry */}
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

        {/* Bottom Call to Action: Minimalist Navigation */}
        <div className="mt-24 pt-12 border-t border-white/5 flex justify-center">
          <button 
            onClick={() => window.location.href = `/earphonesecommerce/products`}
            className="group relative overflow-hidden px-12 py-6 rounded-full border border-white/10 hover:border-white/40 transition-all"
          >
            <span className="relative z-10 text-white font-black uppercase tracking-[0.3em] text-sm">
              View Extended Catalog
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-color/0 via-primary-color/5 to-primary-color/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          </button>
        </div>
      </div>
    </section>
  );
}