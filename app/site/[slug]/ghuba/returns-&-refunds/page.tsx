"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  ArrowPathIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ShieldCheckIcon,
  ExclamationCircleIcon,
  ArchiveBoxIcon,
  TruckIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/outline";

const returnSteps = [
  {
    id: 1,
    title: "Request Return",
    desc: "Go to your 'Orders' page and select the item you wish to return within 7 days of delivery.",
    icon: ArchiveBoxIcon,
  },
  {
    id: 2,
    title: "Packaging",
    desc: "Keep the item in its original packaging with all tags and accessories intact.",
    icon: ShieldCheckIcon,
  },
  {
    id: 3,
    title: "Free Pickup",
    desc: "Our courier will collect the item from your doorstep within 24-48 hours.",
    icon: TruckIcon,
  },
  {
    id: 4,
    title: "Instant Refund",
    desc: "Once inspected, funds are sent back to your original payment method or Ghuba Wallet.",
    icon: CurrencyDollarIcon,
  }
];

export default function GhubaReturnsPage() {
  return (
    <main className="bg-[#fffcfc] dark:bg-[#080808] min-h-screen pt-32 pb-24 text-slate-900 dark:text-slate-100 transition-colors duration-500">
      
      {/* --- 1. THE "NO-STRESS" HERO --- */}
      <section className="max-w-7xl mx-auto px-6 mb-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 mb-8">
            <ArrowPathIcon className="w-4 h-4 text-rose-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Easy Exchanges</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.85]">
            Shop with <br />
            <span className="text-slate-400">Total Confidence.</span>
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-light">
            Changed your mind? It happens. Our return process is designed to be as effortless as our checkout.
          </p>
        </motion.div>
      </section>

      {/* --- 2. THE RETURN PROCESS TIMELINE --- */}
      <section className="max-w-7xl mx-auto px-6 mb-40">
        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 -z-10" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {returnSteps.map((step, idx) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:bg-rose-500 transition-colors duration-500">
                  <step.icon className="w-8 h-8 text-rose-500 group-hover:text-white transition-colors duration-500" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-black text-rose-500/50">STEP {step.id}</span>
                  <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 3. RETURN POLICY DETAILS --- */}
      <section className="max-w-7xl mx-auto px-6 mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Eligibility Bento */}
          <div className="lg:col-span-7 bg-slate-900 dark:bg-white text-white dark:text-black rounded-[4rem] p-12 overflow-hidden relative">
            <h2 className="text-4xl font-bold mb-8">What can be returned?</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <CheckCircleIcon className="w-6 h-6 text-emerald-400 shrink-0" />
                <p className="font-light">Items in original condition with tags intact.</p>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircleIcon className="w-6 h-6 text-emerald-400 shrink-0" />
                <p className="font-light">Electronics with unbroken security seals.</p>
              </div>
              <div className="flex items-start gap-4">
                <ExclamationCircleIcon className="w-6 h-6 text-rose-400 shrink-0" />
                <p className="font-light text-slate-400 dark:text-slate-500 italic">Excluded: Underwear, earrings, and perishable goods.</p>
              </div>
            </div>
          </div>

          {/* Refund Timelines */}
          <div className="lg:col-span-5 bg-rose-50 dark:bg-rose-500/5 rounded-[4rem] p-12 border border-rose-100 dark:border-rose-500/20">
            <h3 className="text-2xl font-bold text-rose-900 dark:text-rose-400 mb-6">Refund Timelines</h3>
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <span className="font-medium text-rose-800/70 dark:text-rose-400/70">Ghuba Wallet</span>
                <span className="px-4 py-1 bg-rose-500 text-white text-xs font-bold rounded-full">Instant</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-rose-800/70 dark:text-rose-400/70">M-Pesa</span>
                <span className="font-bold">2-4 Hours</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-rose-800/70 dark:text-rose-400/70">Bank Transfer</span>
                <span className="font-bold">3-5 Days</span>
              </div>
            </div>
            
            <div className="mt-10 flex items-center gap-3 p-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-rose-200/50">
              <ClockIcon className="w-5 h-5 text-rose-500" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">Timelines are from date of approval</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- 4. CALL TO ACTION --- */}
      <section className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-8">Need to start a return right now?</h2>
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <button className="px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-3xl font-bold hover:scale-105 transition-all shadow-2xl">
            Go to My Orders
          </button>
          <button className="px-10 py-5 border border-slate-200 dark:border-slate-800 rounded-3xl font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
            Talk to a Human
          </button>
        </div>
      </section>

    </main>
  );
}