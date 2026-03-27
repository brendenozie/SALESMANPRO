"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { 
  ShieldCheckIcon, 
  ClockIcon, 
  TruckIcon, 
  SparklesIcon,
  FingerPrintIcon,
  ArrowPathIcon
} from "@heroicons/react/24/solid";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default function PetWellnessAboutPage() {
  return (
    <main className="bg-[#f8fafc] min-h-screen pt-32 pb-24 text-slate-900 overflow-hidden">
      
      {/* 1. THE WELLNESS MISSION */}
      <section className="max-w-7xl mx-auto px-6 mb-32 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 mb-6">
              <ShieldCheckIcon className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Vet-Approved Standard</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
              More than a Shop. <br />
              <span className="text-orange-500 italic font-serif font-light">A Life Partner.</span>
            </h1>
            
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-md mb-8">
              At Pets Duka, we believe every wag, purr, and chirp is a sign of a life well-lived. Our mission is to bridge the gap between premium nutrition and daily joy.
            </p>

            <div className="flex gap-4">
               <div className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl text-sm shadow-lg shadow-indigo-100">Our Story</div>
               <div className="px-6 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-2xl text-sm">Meet the Vets</div>
            </div>
          </motion.div>

          <div className="relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl z-10 border-[12px] border-white"
            >
              <Image 
                src="https://images.unsplash.com/photo-1548191265-cc70d3d45ba1?auto=format&fit=crop&w=1200&q=80" 
                alt="Happy Dog Running" fill className="object-cover" loader={customLoader}
              />
            </motion.div>
            {/* Decorative Floating "Paw" */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-100 rounded-full blur-3xl opacity-50 -z-0" />
          </div>
        </div>
      </section>

      {/* 2. THE RECURRING "PAW-PLAN" (Subscription Section) */}
      <section className="max-w-7xl mx-auto px-6 mb-32">
        <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <ArrowPathIcon className="w-64 h-64 text-orange-400" />
          </div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                Never Run Out of <br /> <span className="text-orange-400 font-serif italic font-light">Happy Moments.</span>
              </h2>
              <p className="text-slate-400 mb-10 text-lg">
                Our **Duka-Repeat** subscription ensures your pet’s favorite meals and essentials arrive at your door every month. Save 15% on every order.
              </p>
              
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 font-bold text-sm">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">✓</div>
                  Customizable Delivery Cycles
                </li>
                <li className="flex items-center gap-3 font-bold text-sm">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">✓</div>
                  Swap or Cancel Anytime
                </li>
                <li className="flex items-center gap-3 font-bold text-sm">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">✓</div>
                  Surprise Monthly Toy Included
                </li>
              </ul>

              <button className="bg-orange-500 hover:bg-orange-600 text-white font-black px-10 py-4 rounded-2xl transition-all transform hover:scale-105">
                Start My Paw-Plan
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center">
                  <TruckIcon className="w-8 h-8 mx-auto mb-4 text-orange-400" />
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">Free Delivery</p>
               </div>
               <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center">
                  <ClockIcon className="w-8 h-8 mx-auto mb-4 text-orange-400" />
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">Priority Prep</p>
               </div>
               <div className="col-span-2 bg-gradient-to-r from-indigo-600 to-indigo-800 p-8 rounded-3xl text-center">
                  <p className="text-2xl font-black mb-1">15% Off</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-200">Lifetime Loyalty Discount</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WELLNESS PILLARS */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">The 4 Pillars of Pet Vitality</h2>
          <div className="w-20 h-1 bg-orange-500 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <WellnessCard 
            Icon={FingerPrintIcon} 
            title="Bio-Nutrition" 
            desc="Curated diets based on breed, age, and activity levels." 
            color="text-orange-500 bg-orange-50"
          />
          <WellnessCard 
            Icon={SparklesIcon} 
            title="Mental Play" 
            desc="Cognitive toys to prevent boredom and anxiety in pets." 
            color="text-indigo-500 bg-indigo-50"
          />
          <WellnessCard 
            Icon={ShieldCheckIcon} 
            title="Vet Support" 
            desc="On-call specialists to answer your urgent wellness queries." 
            color="text-emerald-500 bg-emerald-50"
          />
          <WellnessCard 
            Icon={ArrowPathIcon} 
            title="Full Circle" 
            desc="From puppy steps to senior care, we evolve with your pet." 
            color="text-rose-500 bg-rose-50"
          />
        </div>
      </section>
    </main>
  );
}

function WellnessCard({ Icon, title, desc, color }: { Icon: any, title: string, desc: string, color: string }) {
  return (
    <div className="p-10 rounded-[2.5rem] bg-white border border-slate-100 group transition-all hover:shadow-2xl hover:-translate-y-2">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:rotate-6 ${color}`}>
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-black text-slate-900 mb-3">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}