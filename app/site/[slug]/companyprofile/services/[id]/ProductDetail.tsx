"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheckIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  FingerPrintIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import { StoreForm, MarketListingForm } from '@/types/typings';
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

  // Global capabilities tags (fallback to specialized Gold Assaying methods)
  const testingCapabilities = product.tags?.length ? product.tags : [
    "Fire Assay",
    "XRF Analysis",
    "Atomic Absorption Spectroscopy",
    "Specific Gravity Testing",
    "Purity Determination",
    "Composition Analysis"
  ];

  return (
    <div className="bg-zinc-950 text-white min-h-screen font-sans selection:bg-amber-500/30">
      
      {/* High-Tech Premium Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-50">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-zinc-800/10 blur-[150px] rounded-full" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        
        {/* --- HEADER BLOCK (Now acts as a master spec sheet) --- */}
        <div className="mb-12 lg:mb-16">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/5 text-amber-400 text-[10px] font-bold tracking-[0.25em] uppercase mb-4 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
              {product.subCategoryName || product.category || 'Company Services'}
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-zinc-100 tracking-tight leading-tight uppercase">
              {product.name}
            </h1>
            <p className="mt-4 text-lg text-zinc-400 font-light leading-relaxed max-w-2xl">
              {product.description || 'Enterprise-grade services and procurement structuring integrated with verified operational frameworks.'}
            </p>

            {/* Dynamic System Meta (SKU, Model, ID) -> Functional & Clean */}
            <div className="mt-6 inline-flex flex-wrap items-center gap-6 px-5 py-3 bg-zinc-900/60 backdrop-blur-md border border-zinc-800 rounded-xl text-xs text-zinc-500 font-mono uppercase tracking-widest shadow-inner">
              <div className="flex items-center gap-2">
                <FingerPrintIcon className="w-4 h-4 text-amber-500/70" />
                <span><strong className="text-zinc-300">ID:</strong> {product.id?.slice(-8) || 'N/A'}</span>
              </div>
              
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(product as any).sku && (
                <>
                  <span className="w-1 h-1 rounded-full bg-zinc-700" />
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <span><strong className="text-zinc-300">SKU:</strong> {(product as any).sku}</span>
                </>
              )}
              
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(product as any).model && (
                <>
                  <span className="w-1 h-1 rounded-full bg-zinc-700" />
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <span><strong className="text-zinc-300">MOD:</strong> {(product as any).model}</span>
                </>
              )}
            </div>
          </div>

          {/* Testing Capabilities Global Grid */}
          <div className="mt-10 pt-8 border-t border-zinc-900 max-w-4xl">
            <div className="flex items-center gap-2 mb-4">
              <BeakerIcon className="w-5 h-5 text-amber-500" />
              <h4 className="text-xs uppercase tracking-[0.2em] text-zinc-300 font-mono font-semibold">
                Core Assaying & Testing Capabilities
              </h4>
            </div>
            <div className="flex flex-wrap gap-3">
              {testingCapabilities.map((tag: string, i: number) => (
                <span 
                  key={i} 
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-amber-500/40 text-zinc-300 hover:text-amber-400 text-[11px] font-bold uppercase tracking-wider transition-colors duration-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* --- MAIN INTERACTIVE CONTAINER --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* LEFT SIDE: Tier Selection Index */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6 lg:space-y-8">
            
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <span className="w-8 h-[1px] bg-zinc-700"></span> Select Service Tier
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
                        ? 'bg-gradient-to-r from-zinc-900 to-zinc-900/60 border-zinc-700 text-white shadow-xl shadow-black/40' 
                        : 'border-zinc-900/50 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30 hover:border-zinc-800'
                    }`}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="activeBar"
                        className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-amber-500 rounded-r-md shadow-[0_0_10px_rgba(245,158,11,0.5)]"
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
                          Unlocks {tier.features.length} tier-specific operational protocols.
                        </motion.p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Mobile Horizontal Carousel Slider */}
            <div className="block lg:hidden w-full overflow-x-auto snap-x snap-mandatory no-scrollbar flex gap-4 pb-4">
              {tiers.map((tier, idx) => (
                <div 
                  key={idx}
                  onClick={() => setActiveTierIndex(idx)}
                  className={`snap-center shrink-0 w-[85vw] sm:w-[380px] p-5 rounded-2xl border transition-all cursor-pointer ${
                    activeTierIndex === idx 
                      ? 'bg-zinc-900 border-zinc-700 text-white' 
                      : 'bg-zinc-900/40 border-zinc-900 text-zinc-500'
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
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/50 flex gap-4 items-center backdrop-blur-sm">
              <ShieldCheckIcon className="w-5 h-5 text-amber-500/70 shrink-0" />
              <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
                <span className="text-zinc-200 font-medium">Verified Vendor Status:</span> Operations bound by strict platform AML policies and structural compliance terms.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE: Cinematic Viewer & Details */}
          <div className="lg:col-span-7 h-auto min-h-[500px] lg:min-h-full flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTierIndex}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full flex flex-col justify-between bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800/80 rounded-3xl overflow-hidden shadow-2xl relative flex-1"
              >
                {/* Media Presentation Layer */}
                <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-zinc-950 flex items-center justify-center">
                  <Image
                    src={currentImage}
                    alt={product.name}
                    loader={({ src }) => src}
                    fill
                    className="object-cover scale-105 transition-transform duration-1000 ease-out opacity-70"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                  
                  {/* Image Navigation */}
                  {images.length > 1 && (
                     <div className="absolute top-4 right-4 flex gap-2 z-20">
                       <button onClick={() => setMainImageIndex(prev => (prev - 1 + images.length) % images.length)} className="p-2 bg-black/40 hover:bg-amber-500 rounded-full text-white backdrop-blur-md transition-colors border border-white/10">
                         <ChevronLeftIcon className="w-4 h-4" />
                       </button>
                       <button onClick={() => setMainImageIndex(prev => (prev + 1) % images.length)} className="p-2 bg-black/40 hover:bg-amber-500 rounded-full text-white backdrop-blur-md transition-colors border border-white/10">
                         <ChevronRightIcon className="w-4 h-4" />
                       </button>
                     </div>
                  )}

                  {/* Dynamic Floating Valuation Badge */}
                  <div className="absolute bottom-6 right-6 backdrop-blur-xl bg-black/60 border border-zinc-700 p-4 rounded-2xl text-right min-w-[130px] shadow-2xl">
                    <div className="text-lg font-mono font-bold tracking-tight text-amber-400">
                      {activeTier.price > 0 ? `$${activeTier.price.toLocaleString()}` : 'QUOTE'}
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 mt-1">Tier Valuation</div>
                  </div>
                </div>

                {/* Specific Tier Details Block */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                      {activeTier.name}
                    </h3>
                    <p className="mt-3 text-zinc-400 text-sm font-light leading-relaxed">
                      This tier activates specific operational protocols tailored for targeted integration. Review the granular features below included in this structural bracket.
                    </p>
                  </div>

                  {/* Embedded Tier Features Array */}
                  <div className="space-y-4 pt-4">
                    <h4 className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Integrated Tier Specifications</h4>
                    <div className="flex flex-col gap-3">
                      {activeTier.features?.map((feature: string, i: number) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] shrink-0" />
                          <span className="text-zinc-300 text-sm font-light leading-relaxed">
                            {feature}
                          </span>
                        </div>
                      ))}
                      {(!activeTier.features || activeTier.features.length === 0) && (
                         <span className="text-sm text-zinc-600 italic font-light">Awaiting specific feature breakdown for this tier.</span>
                      )}
                    </div>
                  </div>

                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Hidden/Visually integrated WhatsApp component */}
      <div className="hidden">
        <WhatsAppInquiry 
          productName={`${product.name} - ${activeTier.name} Tier`}
          productPrice={activeTier.price || product.finalPrice || 0}
          productUrl={typeof window !== 'undefined' ? window.location.href : ''}
          phoneNumber="254712345678"
        />
      </div>

    </div>
  );
}