// app/[slug]/products/[productId]/page.tsx
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckBadgeIcon, 
  CalendarIcon, 
  ChatBubbleBottomCenterTextIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  SparklesIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { StoreForm, MarketListingForm } from '@/types/typings';
import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection';

export default function productPage({ product, related }: {
  product: MarketListingForm;
  related: MarketListingForm[];
}) {
  const [selectedPlan, setSelectedPlan] = useState('standard');

  return (
    <div className="bg-[#050505] text-zinc-100 min-h-screen">
      {/* 1. product HERO SECTION */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-black uppercase tracking-widest text-orange-500">
              <SparklesIcon className="w-4 h-4" /> Premium Specialist product
            </div>
            
            <h1 className="text-6xl lg:text-8xl font-black italic uppercase tracking-tighter leading-[0.85]">
              {product?.name || "Ultimate Performance product"}
            </h1>
            
            <p className="text-zinc-400 text-xl leading-relaxed max-w-xl">
              {product?.description || "Expert-level solutions tailored to your machine's specific needs. Precision. Power. Perfection."}
            </p>

            <div className="flex items-center gap-6">
               <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center text-[10px] font-black">
                       PRO
                    </div>
                  ))}
               </div>
               <div className="space-y-1">
                  <div className="flex text-orange-500">
                    {[1,2,3,4,5].map(i => <StarIcon key={i} className="w-4 h-4" />)}
                  </div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Trusted by 500+ Riders</p>
               </div>
            </div>
          </div>

          {/* product VISUAL */}
          <div className="relative aspect-square rounded-[4rem] overflow-hidden border border-zinc-800 group">
             <Image 
                src={product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80'} 
                alt={product?.name || 'product image'} 
                loader={({ src }) => src}
                fill 
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
             <div className="absolute bottom-10 left-10 right-10 p-8 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10">
                <div className="flex justify-between items-end">
                   <div>
                      <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Starting Investment</p>
                      <p className="text-4xl font-black italic">KSh {product?.finalPrice?.toLocaleString()}</p>
                   </div>
                   <button className="h-14 px-8 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-500 hover:text-white transition-all">
                      Book Slot
                   </button>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 2. THE product FLOW (Intuitive Steps) */}
      <section className="py-24 border-y border-zinc-900 bg-zinc-900/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: <CalendarIcon />, title: "Digital Intake", desc: "Schedule your session and provide machine details through our secure portal." },
              { icon: <WrenchScrewdriverIcon />, title: "Precision Execution", desc: "Our certified specialists perform the product using industrial-grade diagnostics." },
              { icon: <CheckBadgeIcon />, title: "Quality Handover", desc: "Receive a full performance report and 30-day labor warranty on all work." }
            ].map((step, i) => (
              <div key={i} className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                  {React.cloneElement(step.icon as React.ReactElement, { className: "w-8 h-8" })}
                </div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter">{step?.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{step?.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. BOOKING & CONSULTATION FORM (Captivating UI) */}
      <section className="max-w-5xl mx-auto px-6 py-32">
        <div className="bg-gradient-to-br from-zinc-900 to-black rounded-[4rem] border border-zinc-800 p-12 lg:p-20 relative overflow-hidden">
           <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="space-y-8">
                 <h2 className="text-5xl font-black italic uppercase tracking-tighter">Ready to <br/>level up?</h2>
                 <p className="text-zinc-500 font-medium leading-relaxed">Fill out the brief below. Our technical lead will reach out via WhatsApp within 2 hours to confirm your appointment.</p>
                 
                 <ul className="space-y-4">
                    {['On-site & Workshop options', 'Genuine OEM Parts', 'WhatsApp Status Updates'].map(item => (
                      <li key={item} className="flex items-center gap-3 text-sm font-bold">
                        <CheckBadgeIcon className="w-5 h-5 text-orange-500" /> {item}
                      </li>
                    ))}
                 </ul>
              </div>

              <form className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Full Name" className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 ring-orange-500/50" />
                    <input type="tel" placeholder="Phone Number" className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 ring-orange-500/50" />
                 </div>
                 <select className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl p-4 text-sm focus:outline-none">
                    <option>Select product Package</option>
                    <option>Basic Maintenance</option>
                    <option>Performance Tuning</option>
                    <option>Custom Modification</option>
                 </select>
                 <textarea placeholder="Tell us about your machine..." rows={4} className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl p-4 text-sm focus:outline-none" />
                 <button className="w-full h-16 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-orange-500 transition-all active:scale-95">
                    Submit Booking Request
                 </button>
              </form>
           </div>
        </div>
      </section>

      <NewsletterSection />
    </div>
  );
}