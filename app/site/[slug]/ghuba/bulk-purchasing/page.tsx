"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  BuildingOffice2Icon, 
  TruckIcon, 
  BanknotesIcon, 
  DocumentCheckIcon,
  ArrowUpRightIcon,
  ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline";

const wholesaleBenefits = [
  {
    title: "Tiered Pricing",
    desc: "The more you buy, the more you save. Access exclusive wholesale rates starting from just 10 units.",
    icon: BanknotesIcon,
  },
  {
    title: "Priority Logistics",
    desc: "Bulk orders receive dedicated shipping lanes and white-glove delivery handling across East Africa.",
    icon: TruckIcon,
  },
  {
    title: "Custom Sourcing",
    desc: "Can't find it on our site? Our procurement team will find the specific items your business needs.",
    icon: BuildingOffice2Icon,
  },
  {
    title: "Tax Compliance",
    desc: "Receive ETR-compliant invoices and simplified VAT documentation for your corporate accounting.",
    icon: DocumentCheckIcon,
  }
];

export default function GhubaBulkPurchasing() {
  return (
    <main className="bg-white dark:bg-[#0a0a0a] min-h-screen pt-32 pb-24 text-slate-900 dark:text-slate-100 transition-colors duration-500">
      
      {/* --- 1. CORPORATE HERO --- */}
      <section className="max-w-7xl mx-auto px-6 mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">B2B & Wholesale</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] mb-8">
              Scale your <br />
              <span className="text-indigo-500">Business.</span>
            </h1>
            
            <p className="text-xl text-slate-500 dark:text-slate-400 font-light leading-relaxed max-w-lg mb-10">
              Ghuba for Business provides streamlined procurement, volume discounts, and dedicated account management for professional buyers.
            </p>

            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold hover:scale-105 transition-transform flex items-center gap-2">
                Download Catalog
                <ArrowUpRightIcon className="w-4 h-4" />
              </button>
              <button className="px-8 py-4 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                Contact Sales
              </button>
            </div>
          </motion.div>

          <div className="relative group">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="aspect-square rounded-[4rem] overflow-hidden shadow-2xl relative"
            >
              <img 
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80" 
                alt="Warehouse Logistics" 
                className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-indigo-500/10 mix-blend-overlay" />
            </motion.div>
            
            {/* Floating Trust Badge */}
            <div className="absolute -bottom-10 -left-10 p-8 bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800">
              <p className="text-4xl font-black text-indigo-500">20%</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Avg. Savings</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- 2. THE B2B ADVANTAGE --- */}
      <section className="bg-slate-50 dark:bg-slate-900/50 py-32 mb-32 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Why source through Ghuba?</h2>
            <div className="w-20 h-1.5 bg-indigo-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {wholesaleBenefits.map((benefit, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-6">
                  <benefit.icon className="w-6 h-6 text-indigo-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                  {benefit.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 3. INQUIRY FORM SECTION --- */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-slate-900 dark:bg-slate-800 rounded-[4rem] p-12 lg:p-20 text-white flex flex-col lg:flex-row gap-16 items-center overflow-hidden relative">
          <div className="lg:w-1/2 relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to place a <br /> bulk order?</h2>
            <p className="text-slate-400 text-lg font-light mb-12">
              Fill out the form and our wholesale team will get back to you with a personalized quote within 4 business hours.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                   <ChatBubbleLeftRightIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Direct Support</p>
                  <p className="text-sm text-slate-400">b2b@ghuba.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 w-full bg-white rounded-[3rem] p-10 text-slate-900 shadow-2xl relative z-10">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" placeholder="Your Name" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                <input type="email" placeholder="Work Email" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 transition-all" />
              </div>
              <input type="text" placeholder="Company Name" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 transition-all" />
              <select className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-400">
                <option>Interested Category</option>
                <option>Electronics</option>
                <option>Office Supplies</option>
                <option>Textiles & Decor</option>
              </select>
              <textarea placeholder="Estimated Quantity & Details" rows={4} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 transition-all"></textarea>
              <button className="w-full py-5 bg-indigo-500 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20">
                Request Quote
              </button>
            </form>
          </div>
          
          {/* Decorative Circle */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        </div>
      </section>

    </main>
  );
}