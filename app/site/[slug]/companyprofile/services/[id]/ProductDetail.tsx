"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheckIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ArrowUpRightIcon
} from '@heroicons/react/24/outline';
import { StoreForm, MarketListingForm } from '@/types/typings';
import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection';
import ProductCard from '@/components/site/layouts/EcommerceLayout/body/components/ProductCard';
import WhatsAppInquiry from '@/components/site/layouts/EcommerceLayout/body/components/WhatsAppInquiry';

export default function ProductDetail({ 
  product, 
  related, 
  storeData 
}: {
  product: MarketListingForm;
  related: MarketListingForm[];
  storeData: StoreForm;
}) {
  const router = useRouter();
  const [activeTierIndex, setActiveTierIndex] = useState<number>(0);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);

  // Fallback if no tiers exist
  const tiers = product.pricingTiers && product.pricingTiers.length > 0 
    ? product.pricingTiers 
    : [{ name: "Standard Service", price: product.finalPrice || 0, features: ["Standard Allocation", "Baseline Compliance"] }];
    
  const activeTier = tiers[activeTierIndex];
  const images = product.images?.length ? product.images : [{ url: 'https://images.unsplash.com/photo-1610375228911-c4ab455981ca?q=80&w=2070&auto=format&fit=crop' }];
  const currentImage = images[mainImageIndex]?.url || images[mainImageIndex] || 'https://images.unsplash.com/photo-1610375228911-c4ab455981ca?q=80&w=2070&auto=format&fit=crop';

  return (
    <div className="bg-zinc-950 text-white min-h-screen font-sans selection:bg-amber-500/30">
      
      {/* High-Tech Premium Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-50">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-zinc-800/10 blur-[150px] rounded-full" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        
        {/* Header Block */}
        <div className="mb-12 lg:mb-20 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/5 text-amber-400 text-[10px] font-bold tracking-[0.25em] uppercase mb-4">
            {product.subCategoryName || product.category || 'Company Services'}
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-zinc-100 tracking-tight leading-tight uppercase">
            {product.name}
          </h1>
          <p className="mt-4 text-lg text-zinc-400 font-light leading-relaxed max-w-2xl">
            {product.description || 'Enterprise-grade services and procurement structuring integrated with verified operational frameworks.'}
          </p>
        </div>

        {/* MAIN CONTAINER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* LEFT SIDE: CONTROL INDEX (Desktop) & Touch Swiper Controls (Mobile) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6 lg:space-y-8">
            
            <div className="text-sm font-mono text-zinc-500 uppercase tracking-widest mb-[-1rem]">
              Select Service Tier
            </div>

            {/* Desktop Dynamic Sidebar Menu */}
            <div className="hidden lg:flex flex-col gap-3">
              {tiers.map((tier, idx) => {
                const isActive = activeTierIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveTierIndex(idx)}
                    className={`group w-full relative flex items-start gap-4 p-5 rounded-2xl text-left transition-all duration-300 border ${
                      isActive 
                        ? 'bg-gradient-to-r from-zinc-900 to-zinc-900/60 border-zinc-800 text-white shadow-lg shadow-black/40' 
                        : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/20'
                    }`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="activeBar"
                        className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-amber-500 rounded-r-md"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}

                    <span className={`font-mono text-xs font-bold mt-0.5 ${isActive ? 'text-amber-400' : 'text-zinc-700'}`}>
                      0{idx + 1}
                    </span>
                    <div className="space-y-1 w-full">
                      <div className="flex justify-between items-center">
                        <h3 className="text-base font-semibold tracking-wide transition-colors">
                          {tier.name}
                        </h3>
                        {tier.price > 0 && (
                          <span className={`font-mono text-sm ${isActive ? 'text-white' : 'text-zinc-500'}`}>
                            ${tier.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {isActive && tier.features && (
                        <motion.p 
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-zinc-400 font-light leading-relaxed pr-4"
                        >
                          Includes {tier.features.length} standardized operational features and protocols.
                        </motion.p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Mobile Horizontal Carousel Slider (Visible only on < lg screens) */}
            <div className="block lg:hidden w-full overflow-x-auto snap-x snap-mandatory no-scrollbar flex gap-4 pb-4">
              {tiers.map((tier, idx) => (
                <div 
                  key={idx}
                  onClick={() => setActiveTierIndex(idx)}
                  className={`snap-center shrink-0 w-[85vw] sm:w-[380px] p-5 rounded-2xl border transition-all cursor-pointer ${
                    activeTierIndex === idx 
                      ? 'bg-zinc-900 border-zinc-700 text-white' 
                      : 'bg-zinc-900/40 border-zinc-900 text-zinc-400'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-xs text-amber-500 font-bold">0{idx + 1}</span>
                    {tier.price > 0 && (
                      <span className="text-[10px] uppercase font-mono tracking-wider bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">
                        ${tier.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold truncate mb-1 text-zinc-100">{tier.name}</h3>
                  <p className="text-xs text-zinc-400 font-light line-clamp-2">
                    {tier.features?.length || 0} embedded capabilities
                  </p>
                </div>
              ))}
            </div>

            {/* Micro Compliance Banner */}
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-900 flex gap-4 items-center backdrop-blur-sm">
              <ShieldCheckIcon className="w-5 h-5 text-amber-500/70 shrink-0" />
              <p className="text-[11px] text-zinc-500 leading-normal font-light">
                <span className="text-zinc-300 font-medium">Verified Vendor Status:</span> Operations bound by platform AML policies and standardized structural terms.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE: CINEMATIC SHOWCASE THEATER */}
          <div className="lg:col-span-7 h-auto min-h-[500px] lg:min-h-full flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTierIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full flex flex-col justify-between bg-gradient-to-b from-zinc-900/80 to-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative flex-1"
              >
                {/* Media Presentation Layer */}
                <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-zinc-900 flex items-center justify-center">
                  <Image
                    src={currentImage}
                    alt={product.name}
                    loader={({ src }) => src}
                    fill
                    className="object-cover scale-105 transition-transform duration-700 ease-out opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                  
                  {/* Image Navigation (if multiple) */}
                  {images.length > 1 && (
                     <div className="absolute top-4 right-4 flex gap-2 z-20">
                       <button onClick={() => setMainImageIndex(prev => (prev - 1 + images.length) % images.length)} className="p-2 bg-black/50 hover:bg-amber-500/80 rounded-full text-white backdrop-blur-md transition-colors">
                         <ChevronLeftIcon className="w-4 h-4" />
                       </button>
                       <button onClick={() => setMainImageIndex(prev => (prev + 1) % images.length)} className="p-2 bg-black/50 hover:bg-amber-500/80 rounded-full text-white backdrop-blur-md transition-colors">
                         <ChevronRightIcon className="w-4 h-4" />
                       </button>
                     </div>
                  )}

                  {/* Dynamic Floating Glass Badge */}
                  <div className="absolute bottom-4 right-4 backdrop-blur-lg bg-zinc-900/80 border border-zinc-700/60 p-3 rounded-xl text-right min-w-[110px]">
                    <div className="text-sm font-mono font-bold tracking-tight text-amber-400">
                      {activeTier.price > 0 ? `$${activeTier.price.toLocaleString()}` : 'QUOTE'}
                    </div>
                    <div className="text-[9px] uppercase tracking-widest text-zinc-400 mt-0.5">Valuation</div>
                  </div>
                </div>

                {/* Content Details Block */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-8">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      {activeTier.name}
                    </h3>
                    <p className="mt-2 text-zinc-400 text-sm font-light leading-relaxed">
                      Select this tier to unlock the specific operational parameters and features listed below. Designed for immediate structural integration.
                    </p>
                  </div>

                  {/* Technical Tags Grid (Features) */}
                  <div className="space-y-5">
                    <div className="h-[1px] bg-gradient-to-r from-zinc-800 via-transparent to-transparent" />
                    <h4 className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Inclusions & Capabilities</h4>
                    <div className="flex flex-wrap gap-2.5">
                      {activeTier.features?.map((feature: string, i: number) => (
                        <span 
                          key={i} 
                          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300 text-xs font-light shadow-sm"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                          {feature}
                        </span>
                      ))}
                      {(!activeTier.features || activeTier.features.length === 0) && (
                         <span className="text-xs text-zinc-600 italic">No specific features listed for this tier.</span>
                      )}
                    </div>
                  </div>

                  {/* Operational Interactive CTA Action Button */}
                  <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-between items-center border-t border-zinc-800/50">
                    {/* <button 
                      onClick={() => {
                        // Assuming you might want to handle this differently for services
                        // You could trigger the WhatsApp inquiry directly here
                        const whatsappBtn = document.getElementById('whatsapp-inquiry-btn');
                        if(whatsappBtn) whatsappBtn.click();
                      }}
                      className="w-full sm:w-auto group/btn inline-flex items-center justify-center gap-3 bg-amber-500 text-zinc-950 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)]"
                    >
                      Inquire / Initialize
                      <ArrowUpRightIcon className="w-4 h-4 transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </button> */}
                    
                    <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
                      ID: {product.id.slice(-8)}
                    </span>
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Related Products Section mapped to dark theme */}
      {/* {related.length > 0 && (
        <div className="relative z-10 border-t border-zinc-900 bg-zinc-950/50 py-16 mt-12 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-xl font-bold text-white mb-8 tracking-wide">Parallel Assets & Capabilities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {related.map((r) => (
                <div key={r.id} className="dark"> 
                  {/* Wrapping in 'dark' class if your ProductCard relies on tailwind dark mode, 
                      or it naturally inherits the dark backgrounds */}
                  {/* <ProductCard product={r} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )} */}

      {/* Hidden/Visually integrated WhatsApp component */}
      <div className="hidden">
        <WhatsAppInquiry 
          productName={`${product.name} - ${activeTier.name} Tier`}
          productPrice={activeTier.price || product.finalPrice || 0}
          productUrl={typeof window !== 'undefined' ? window.location.href : ''}
          phoneNumber="254712345678"
        />
      </div>

      {/* Newsletter */}
      <div className="relative z-10 border-t border-zinc-900">
        {/* <NewsletterSection /> */}
      </div>
    </div>
  );
}