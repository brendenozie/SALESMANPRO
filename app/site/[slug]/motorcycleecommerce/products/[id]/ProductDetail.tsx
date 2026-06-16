/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import React, { useMemo, useState, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  StarIcon, 
  PlusIcon, 
  MinusIcon, 
  ChevronRightIcon, 
  ChevronLeftIcon,
  ShieldCheckIcon,
  MapPinIcon
} from '@heroicons/react/24/solid';
import { 
  CpuChipIcon, 
  BeakerIcon, 
  FireIcon, 
  WrenchIcon 
} from '@heroicons/react/24/outline';
import { useStateContext } from '@/contexts/ContextProvider';
// import ProductCard from '@/components/site/layouts/EcommerceMotorcycleLayout/body/components/ProductCard';
import { MarketListingForm } from '@/types/typings';
import WhatsAppInquiry from '@/components/site/layouts/EcommerceLayout/body/components/WhatsAppInquiry';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export function ProductDetail({ product, related }: { product: MarketListingForm; related: MarketListingForm[] }) {
  const { addToCart, decreaseQuantity, cart } = useStateContext();
  const [mainIndex, setMainIndex] = useState(0);
  const [isSpecsOpen, setIsSpecsOpen] = useState(true);

  const accentColor = '#F97316'; // Heavy Hazard Orange
  const quantity = useMemo(() => cart.find((c: any) => c.id === product.id)?.quantity || 0, [cart, product.id]);
    const currentImages = product.images?.length ? product.images : ['https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80'];

    const currentImage = currentImages[mainIndex]?.url || currentImages[mainIndex] || 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80';


  const [deposit, setDeposit] = useState((product.finalPrice || 0) * 0.3);
  const [months, setMonths] = useState(18);

  const monthlyPayment = useMemo(() => {
    const principal = (product.finalPrice || 0) - deposit;
    const interest = 1.15; // 15% flat interest for example
    return (principal * interest) / months;
  }, [deposit, months, product.finalPrice]);

  return (
    <div className="bg-[#0A0A0A] text-zinc-100 min-h-screen font-sans selection:bg-orange-500">
      <Head>
        <title>{product.name} | Motorcycle Duka</title>
      </Head>

      {/* HERO SECTION */}
      <div className="relative pt-20 pb-12 overflow-hidden">
        {/* Background "Speed" Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* LEFT: CINEMATIC SHOWCASE */}
          <div className="lg:col-span-7 space-y-8">
            <div className="relative aspect-[16/10] group rounded-[2.5rem] bg-gradient-to-b from-zinc-900 to-black border border-zinc-800 p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mainIndex}
                  initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 1.1, rotateY: -10 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={currentImage}
                    alt={product.name}
                    loader={loader}
                    fill
                    className="object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.8)]"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows */}
              <button 
                onClick={() => setMainIndex(prev => Math.max(0, prev - 1))}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setMainIndex(prev => Math.min(currentImages.length - 1, prev + 1))}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRightIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Thumbnail Strip */}
            <div className="flex gap-4 overflow-x-auto pb-4 px-2">
              {currentImages.map((img: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setMainIndex(idx)}
                  className={`relative min-w-[100px] h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                    idx === mainIndex ? 'border-orange-500 scale-105 shadow-[0_0_20px_rgba(249,115,22,0.3)]' : 'border-zinc-800 opacity-40'
                  }`}
                >
                  <Image src={img.url} alt="thumbnail" fill className="object-cover" loader={loader} />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: THE SPECS SHEET */}
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-500 text-[10px] font-bold uppercase tracking-widest">
                <FireIcon className="w-3 h-3" /> In Stock & Ready to Ride
              </div>
              <h1 className="text-6xl font-black italic tracking-tighter leading-none uppercase italic">
                {product.name}
              </h1>
              <div className="flex items-center gap-6">
                <div className="text-5xl font-black text-white">
                  KSh {product.finalPrice?.toLocaleString()}
                </div>
                {product.sellingPrice > product.finalPrice && (
                  <div className="text-xl text-zinc-500 line-through">KSh {product.sellingPrice}</div>
                )}
              </div>
            </div>

            {/* Tech Specs Bento Grid */}
            <div className="grid grid-cols-2 gap-px bg-zinc-800 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
              {[
                { label: 'Engine', val: '150cc Air-Cooled', icon: <CpuChipIcon className="w-4 h-4" /> },
                { label: 'Fuel Tank', val: '12.5 Liters', icon: <BeakerIcon className="w-4 h-4" /> },
                { label: 'Max Torque', val: '11.5 Nm', icon: <FireIcon className="w-4 h-4" /> },
                { label: 'Service', val: 'Free 1st Service', icon: <WrenchIcon className="w-4 h-4" /> },
              ].map((s, i) => (
                <div key={i} className="bg-[#0F0F0F] p-5 space-y-1">
                  <div className="flex items-center gap-2 text-zinc-500 font-bold uppercase text-[10px] tracking-widest">
                    {s.icon} {s.label}
                  </div>
                  <div className="text-lg font-black italic">{s.val}</div>
                </div>
              ))}
            </div>

            {/* Main Action Area */}
            <div className="p-8 bg-gradient-to-br from-zinc-900 to-black rounded-[2.5rem] border border-zinc-800 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-zinc-400">Monthly Installments from</span>
                <span className="text-xl font-black text-orange-500 underline decoration-2 underline-offset-4 cursor-pointer">KSh 4,500/mo</span>
              </div>

              <div className="flex gap-4">
                {quantity > 0 ? (
                  <div className="flex-1 flex items-center justify-between bg-zinc-800 p-2 rounded-2xl h-16">
                    <button onClick={() => decreaseQuantity(product.id)} className="w-12 h-12 bg-zinc-700 rounded-xl flex items-center justify-center hover:bg-zinc-600">
                      <MinusIcon className="w-5 h-5" />
                    </button>
                    <span className="text-2xl font-black italic">{quantity}</span>
                    <button onClick={() => addToCart(product)} className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center hover:bg-orange-500">
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addToCart(product)}
                    className="flex-1 h-16 bg-white text-black rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-colors hover:bg-orange-500 hover:text-white"
                  >
                    Take it Home
                    <ChevronRightIcon className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
            </div>

            {/* Confidence Badges */}
            <div className="flex items-center justify-center gap-8 text-[10px] font-black uppercase text-zinc-500 tracking-widest">
              <div className="flex items-center gap-2"><ShieldCheckIcon className="w-4 h-4 text-orange-500" /> Genuine Parts</div>
              <div className="flex items-center gap-2"><MapPinIcon className="w-4 h-4 text-orange-500" /> Delivery Across Kenya</div>
            </div>
          </div>
        </div>
      </div>

                {/* INTERACTIVE SALES ENGINE */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* LOAN CALCULATOR */}
        <div className="p-10 bg-gradient-to-br from-zinc-900 to-black rounded-[3rem] border border-zinc-800 relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative space-y-8">
            <div className="space-y-2">
              <h3 className="text-3xl font-black italic uppercase tracking-tighter">Finance Your Machine</h3>
              <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest leading-none">Own it today, pay as you ride</p>
            </div>

            <div className="space-y-6">
              {/* Deposit Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-black uppercase text-zinc-400">Initial Deposit</span>
                  <span className="text-xl font-black text-orange-500 italic">KSh {deposit.toLocaleString()} <span className="text-[10px] text-zinc-500 opacity-50">(30%)</span></span>
                </div>
                <input type="range" className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500" onChange={(e) => setDeposit(parseFloat(e.target.value))} />
              </div>

              {/* Duration Selection */}
              <div className="space-y-4">
                <span className="text-xs font-black uppercase text-zinc-400">Repayment Period</span>
                <div className="grid grid-cols-3 gap-3">
                  {[ '12 Months', '18 Months', '24 Months' ].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMonths(parseInt(m))}
                      className={`py-2 rounded-2xl border transition-colors ${
                        months === parseInt(m) ? 'bg-orange-500 text-white border-orange-500' : 'bg-zinc-800 text-zinc-400 border-zinc-800 hover:bg-zinc-700'
                      }`}
                    >
                      {m}
                    </button>
                    
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-zinc-500">Estimated Monthly</p>
                <p className="text-4xl font-black italic text-white">KSh {monthlyPayment.toLocaleString()}</p>
              </div>
              <button className="h-14 px-8 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-colors">
                Get Pre-Approved
              </button>
            </div>
          </div>
        </div>

        {/* TEST RIDE BOOKING */}
        <div className="p-10 bg-orange-600 rounded-[3rem] text-white flex flex-col justify-between relative overflow-hidden">
          {/* Decorative Tyre Mark */}
          <div className="absolute top-0 right-0 w-64 h-full opacity-10 pointer-events-none rotate-12 translate-x-12 scale-150">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
              <path d="M10,0 L20,0 L20,100 L10,100 Z M40,0 L50,0 L50,100 L40,100 Z M70,0 L80,0 L80,100 L70,100 Z" />
            </svg>
          </div>

          <div className="relative space-y-6">
            <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Feel the <br />Power Firsthand.</h3>
            <p className="text-orange-100 font-bold text-sm max-w-[280px]">Book a complimentary test ride at our Nairobi or Mombasa showroom.</p>
          </div>

          <form className="relative mt-12 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Preferred Date" 
                className="bg-orange-700/50 border border-orange-400/30 rounded-2xl p-4 text-sm font-bold placeholder:text-orange-200 focus:outline-none focus:ring-2 ring-white/20"
              />
              <select className="bg-orange-700/50 border border-orange-400/30 rounded-2xl p-4 text-sm font-bold text-white focus:outline-none focus:ring-2 ring-white/20 appearance-none">
                <option>Nairobi Showroom</option>
                <option>Mombasa Branch</option>
              </select>
            </div>
            <input 
              type="tel" 
              placeholder="WhatsApp Number" 
              className="w-full bg-white text-black rounded-2xl p-4 text-sm font-black placeholder:text-zinc-400 focus:outline-none"
            />
            <button className="w-full h-16 bg-black text-white rounded-2xl font-black uppercase tracking-widest hover:bg-zinc-900 transition-transform active:scale-95">
              Secure My Slot
            </button>
          </form>
        </div>
      </section>

      {/* TECHNICAL BLUEPRINT (ACCORDION) */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="max-w-3xl">
          <button 
            onClick={() => setIsSpecsOpen(!isSpecsOpen)}
            className="group flex items-center gap-6 mb-10 w-full"
          >
            <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
              The Blueprint
            </h2>
            <div className="flex-1 h-px bg-zinc-800 group-hover:bg-orange-500/50 transition-colors" />
            <div className={`p-2 rounded-full border border-zinc-800 transition-transform ${isSpecsOpen ? 'rotate-45' : ''}`}>
              <PlusIcon className="w-6 h-6" />
            </div>
          </button>

          <AnimatePresence>
            {isSpecsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-12"
              >
                <div className="space-y-6">
                  <h3 className="text-orange-500 font-black italic uppercase tracking-widest text-xs">Performance</h3>
                  <div className="space-y-4">
                    {[
                      ['Cooling System', 'Natural Air Cooling'],
                      ['Transmission', '5-Speed Constant Mesh'],
                      ['Starter', 'Self & Kick Start'],
                    ].map(([l, v]) => (
                      <div key={l} className="flex justify-between border-b border-zinc-800 pb-2">
                        <span className="text-zinc-500 text-sm font-bold">{l}</span>
                        <span className="font-black text-sm">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <h3 className="text-orange-500 font-black italic uppercase tracking-widest text-xs">Chassis & Safety</h3>
                  <div className="space-y-4">
                    {[
                      ['Front Brake', '240mm Petal Disc'],
                      ['Rear Brake', '130mm Drum'],
                      ['Frame Type', 'Single Cradle Tubular'],
                    ].map(([l, v]) => (
                      <div key={l} className="flex justify-between border-b border-zinc-800 pb-2">
                        <span className="text-zinc-500 text-sm font-bold">{l}</span>
                        <span className="font-black text-sm">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* RELATED MOTORCYCLES */}
      {related.length > 0 && (
        <section className="bg-zinc-900/50 py-24 border-t border-zinc-800">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-12">More Machines</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {related.map(r => (
                <div key={r.id} className="group cursor-pointer">
                  <div className="relative aspect-square bg-black rounded-[2rem] border border-zinc-800 overflow-hidden mb-4 p-6">
                    <Image src={r.images[0]?.url || r.images[0]} alt={r.name} fill className="object-contain p-4 group-hover:scale-110 transition-transform duration-500" loader={loader} />
                  </div>
                  <h4 className="font-black uppercase italic text-sm group-hover:text-orange-500 transition-colors">{r.name}</h4>
                  <p className="text-zinc-500 font-bold text-xs mt-1">KSh {r.finalPrice?.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <WhatsAppInquiry 
        productName={product.name}
        productPrice={product.finalPrice || product.sellingPrice || 0}
        productUrl={window.location.href}
        phoneNumber = "254712345678"
      />
    </div>
  );
}