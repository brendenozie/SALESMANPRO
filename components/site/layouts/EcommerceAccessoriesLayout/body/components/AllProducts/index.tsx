'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { 
  ArrowRightIcon, 
  Squares2X2Icon, 
  AdjustmentsHorizontalIcon,
  WrenchScrewdriverIcon,
  MapPinIcon
} from '@heroicons/react/24/solid';
import ProductCard from '../ProductShowcaseGrid/ProductCard';

interface AllProductsProps {
  id: string;
  marketplaceListings: any[];
  themeSettings: Record<string, any> | null;
}

export default function AutomotiveInventoryGrid({ id, marketplaceListings, themeSettings }: AllProductsProps) {
  const { cart } = useStateContext();
  const primaryColor = themeSettings?.primaryColor || '#EF4444'; // Racing Red
  const secondaryColor = themeSettings?.secondaryColor || '#18181B'; // Carbon Black

  // Animation: Fast, aggressive staggered entrance like shifting gears
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        ease: "easeOut"
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.98 },
    visible: { 
      y: 0, 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <section className="relative py-32 bg-zinc-50 dark:bg-[#09090b] overflow-hidden">
      
      {/* Structural "Asphalt / Track" Background */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: `linear-gradient(to right, #808080 1px, transparent 1px), linear-gradient(to bottom, #808080 1px, transparent 1px)`, backgroundSize: '64px 64px' }} />
      
      {/* Ambient Lighting Flares */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[150px] opacity-[0.04] dark:opacity-[0.08] pointer-events-none" 
           style={{ backgroundColor: primaryColor }} />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] rounded-full blur-[200px] opacity-[0.03] dark:opacity-[0.06] pointer-events-none" 
           style={{ backgroundColor: primaryColor }} />

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header: High-Performance Command Style */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8 relative pl-6">
          {/* Racing Stripe Accent */}
          <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <WrenchScrewdriverIcon className="w-4 h-4" style={{ color: primaryColor }} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-400">
                Live Inventory Feed
              </span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase italic drop-shadow-sm">
              Performance <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-600 to-zinc-900 dark:from-zinc-400 dark:to-white">
                Parts Catalog
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <Link href="/automotiveecommerce/products" className="w-full md:w-auto">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative w-full flex items-center justify-center gap-4 px-10 py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-[11px] uppercase tracking-widest overflow-hidden rounded-xl shadow-xl transition-all"
              >
                {/* Hover Reveal Stripe */}
                <div className="absolute inset-0 w-full h-full -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" style={{ backgroundColor: primaryColor }} />
                
                <Squares2X2Icon className="relative z-10 w-5 h-5 group-hover:text-white transition-colors" style={{ color: primaryColor }} />
                <span className="relative z-10 group-hover:text-white transition-colors">Access Full Garage</span>
                <ArrowRightIcon className="relative z-10 w-4 h-4 group-hover:translate-x-2 group-hover:text-white transition-all" />
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Inventory Grid Layout */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
        >
          {marketplaceListings.map((product, idx) => (
            <motion.div 
              key={product.id || idx} 
              variants={itemVariants}
              className="group relative h-full"
            >
              {/* Sleek Auto Card Wrapper with Glowing Border Effect */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md" style={{ backgroundColor: primaryColor, opacity: 0.15 }} />
              
              <div className="relative h-full bg-white dark:bg-zinc-950 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800/60 shadow-sm group-hover:shadow-2xl group-hover:border-transparent transition-all duration-300 z-10 flex flex-col">
                <ProductCard product={product} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Telemetry Footer / Bottom Metric */}
        <div className="mt-24 flex flex-col md:flex-row items-center justify-between gap-6 bg-white dark:bg-zinc-900/50 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 md:gap-12 w-full md:w-auto">
              
              {/* Metric 1 */}
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <Squares2X2Icon className="w-6 h-6" style={{ color: primaryColor }} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Total Parts</p>
                  <p className="text-3xl font-black text-zinc-900 dark:text-white italic leading-none">{marketplaceListings.length}</p>
                </div>
              </div>

              <div className="hidden md:block w-px h-12 bg-zinc-200 dark:bg-zinc-800" />

              {/* Metric 2 */}
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <MapPinIcon className="w-6 h-6" style={{ color: primaryColor }} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Servicing Region</p>
                  <p className="text-3xl font-black text-zinc-900 dark:text-white italic leading-none">KE / Nairobi</p>
                </div>
              </div>

            </div>

            <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
                <AdjustmentsHorizontalIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <p className="text-[10px] font-bold uppercase tracking-widest italic text-zinc-500 dark:text-zinc-400">
                  Telemetry Active
                </p>
            </div>
        </div>
      </div>
    </section>
  );
}