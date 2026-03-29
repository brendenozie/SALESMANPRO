/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon, EyeIcon, CalendarDaysIcon, RocketLaunchIcon } from '@heroicons/react/24/solid';
import { 
  CheckBadgeIcon, 
  ClockIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  SparklesIcon, 
  HashtagIcon,
  CheckIcon,
  InformationCircleIcon,
  ArrowRightIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';
import { useStateContext } from '@/contexts/ContextProvider';
import ProductCard from '@/components/site/layouts/EcommerceLayout/body/components/ProductCard';
import { MarketListingForm } from '@/types/typings';

// Service-specific tiers (mapped from your LensOptions structure)
const SERVICE_TIERS = [
  { id: 'standard', name: 'Essential Care', price: 0, description: 'Complete diagnostic and standard maintenance.', icon: <CheckBadgeIcon className="w-5 h-5" /> },
  { id: 'priority', name: 'Priority Express', price: 2500, description: 'Same-day turnaround and premium reporting.', icon: <RocketLaunchIcon className="w-5 h-5" /> },
  { id: 'vip', name: 'White Glove', price: 5000, description: 'On-site concierge service and 1-year coverage.', icon: <SparklesIcon className="w-5 h-5" /> },
];

export function ServiceDetail({ product, related }: { product: MarketListingForm; related: MarketListingForm[] }) {
  const { addToCart } = useStateContext();
  const [selectedTier, setSelectedTier] = useState(SERVICE_TIERS[0]);
  const [showProcess, setShowProcess] = useState(false);

  const totalPrice = (product.finalPrice || 0) + selectedTier.price;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#050505] transition-colors duration-700">
      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row min-h-screen relative">
        
        {/* --- LEFT: SERVICE IMMERSION --- */}
        <div className="w-full lg:w-7/12 lg:sticky lg:top-0 h-[50vh] lg:h-screen flex items-center justify-center p-6 lg:p-20 overflow-hidden">
          {/* Ambient Background Element */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 dark:bg-white/5 blur-[120px] rounded-full" />
          
          <div className="relative w-full max-w-3xl aspect-[16/10] group">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full h-full rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <Image
                src={product.images[0]?.url || product.images[0] || 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80'}
                alt={product.name}
                loader={({src})  => src }
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent" />
              
              {/* Overlay Content */}
              <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                <div className="text-white">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">Service Identity</p>
                  <h2 className="text-3xl font-light italic tracking-tight">{product.name}</h2>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20">
                  <UserGroupIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>

            {/* Step-by-Step Methodology Overlay */}
            <AnimatePresence>
              {showProcess && (
                <motion.div 
                  initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                  animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/60 dark:bg-black/60 z-20 rounded-[3rem] p-10 flex flex-col justify-center"
                >
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 dark:text-white">Our Methodical Approach</h4>
                  <div className="space-y-6">
                    {['Initial Consultation', 'Expert Analysis', 'Precision Execution', 'Quality Assurance'].map((step, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={step} 
                        className="flex items-center gap-4 group"
                      >
                        <span className="text-2xl font-light text-zinc-300 dark:text-zinc-700">0{i+1}</span>
                        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800 group-hover:bg-blue-500 transition-colors" />
                        <p className="text-sm font-bold dark:text-white">{step}</p>
                      </motion.div>
                    ))}
                  </div>
                  <button onClick={() => setShowProcess(false)} className="mt-12 self-start flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:gap-4 transition-all dark:text-white">
                    Close Process <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* --- RIGHT: SERVICE CONFIGURATION --- */}
        <div className="w-full lg:w-5/12 bg-white dark:bg-[#0a0a0a] p-8 lg:p-20 border-l border-zinc-100 dark:border-zinc-900 shadow-[-30px_0_60px_rgba(0,0,0,0.02)]">
          <div className="max-w-md mx-auto">
            
            <header className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Available in Nairobi</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-light tracking-tighter text-zinc-900 dark:text-white mb-6">
                {product.name}
              </h1>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-medium dark:text-zinc-100">KSh {totalPrice.toLocaleString()}</p>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-50 dark:bg-zinc-900 rounded-full">
                  <StarIcon className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-[10px] font-black">4.97 (240+ Reviews)</span>
                </div>
              </div>
            </header>

            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed mb-12 font-light text-lg">
              {product.description || "A master-level service designed for professionals. We combine industry-leading techniques with precision tools to deliver results that exceed global standards."}
            </p>

            {/* SERVICE TIER SELECTION */}
            <section className="mb-12">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-6">01. Service Tier</h3>
              <div className="space-y-4">
                {SERVICE_TIERS.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier)}
                    className={`w-full text-left p-6 rounded-[2rem] border transition-all duration-500 ${
                      selectedTier.id === tier.id 
                      ? 'border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-black shadow-xl translate-x-2' 
                      : 'border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {tier.icon}
                        <span className="text-sm font-bold tracking-tight">{tier.name}</span>
                      </div>
                      <span className="text-xs font-black">{tier.price === 0 ? 'BASE' : `+${tier.price.toLocaleString()}`}</span>
                    </div>
                    <p className={`text-[10px] font-medium leading-relaxed ${selectedTier.id === tier.id ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      {tier.description}
                    </p>
                  </button>
                ))}
              </div>
            </section>

            {/* ACTION DOCK */}
            <footer className="space-y-6">
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addToCart({ ...product, selectedTier })}
                  className="flex-[4] h-18 py-6 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-[2.5rem] font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 shadow-2xl"
                >
                  <CalendarDaysIcon className="w-5 h-5" />
                  Secure Booking
                </motion.button>
                <button className="flex-1 h-18 bg-zinc-100 dark:bg-zinc-900 rounded-[2.5rem] flex items-center justify-center group hover:bg-blue-500 transition-colors">
                  <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-zinc-400 group-hover:text-white" />
                </button>
              </div>

              <div className="pt-8 grid grid-cols-2 gap-8 border-t border-zinc-100 dark:border-zinc-900">
                <div className="flex flex-col gap-2">
                  <ClockIcon className="w-5 h-5 text-blue-500" />
                  <p className="text-[10px] font-black uppercase tracking-widest dark:text-zinc-500">Fast Turnaround</p>
                  <p className="text-[10px] text-zinc-400">Usually 24-48 Hours</p>
                </div>
                <div className="flex flex-col gap-2">
                  <ShieldCheckIcon className="w-5 h-5 text-emerald-500" />
                  <p className="text-[10px] font-black uppercase tracking-widest dark:text-zinc-500">Service Guarantee</p>
                  <p className="text-[10px] text-zinc-400">100% Satisfaction</p>
                </div>
              </div>

              <button 
                onClick={() => setShowProcess(true)}
                className="w-full py-4 border border-zinc-100 dark:border-zinc-900 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Explore our Workflow
              </button>
            </footer>

          </div>
        </div>
      </div>

      {/* --- ADD-ON / RELATED SERVICES --- */}
      <section className="px-8 lg:px-20 py-32 bg-zinc-50 dark:bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-light italic tracking-tighter dark:text-white mb-16">Recommended Add-ons</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {related.slice(0, 4).map(r => (
              <ProductCard key={r.id} product={r as any} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}