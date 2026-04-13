"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  TruckIcon,
  ArrowPathIcon,
  CreditCardIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

const categories = [
  {
    title: "Orders & Shipping",
    icon: TruckIcon,
    color: "bg-blue-500",
    articles: ["Track my parcel", "Shipping rates", "International delivery"]
  },
  {
    title: "Returns & Refunds",
    icon: ArrowPathIcon,
    color: "bg-rose-500",
    articles: ["Return policy", "How to request a refund", "Faulty items"]
  },
  {
    title: "Payments & Pricing",
    icon: CreditCardIcon,
    color: "bg-emerald-500",
    articles: ["M-Pesa payments", "Installment plans", "Vouchers & Promos"]
  },
  {
    title: "Account & Safety",
    icon: UserIcon,
    color: "bg-indigo-500",
    articles: ["Reset password", "Two-factor auth", "Delete account"]
  }
];

export default function GhubaHelpCenter() {
  return (
    <main className="bg-white dark:bg-[#080808] min-h-screen pt-32 pb-24 text-slate-900 dark:text-slate-100 transition-colors duration-500">
      
      {/* --- 1. SEARCH HERO --- */}
      <section className="max-w-7xl mx-auto px-6 mb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8">
            How can we <span className="text-indigo-500 text-outline-dark">help?</span>
          </h1>
          
          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="w-6 h-6 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input 
              type="text"
              placeholder="Search for articles (e.g. 'refunds', 'M-Pesa')"
              className="w-full pl-16 pr-8 py-6 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-lg shadow-sm"
            />
            <div className="absolute inset-y-2 right-2 hidden md:block">
               <button className="px-6 h-full bg-slate-900 dark:bg-white text-white dark:text-black rounded-[2rem] font-bold text-sm">
                 Search
               </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* --- 2. CATEGORY GRID --- */}
      <section className="max-w-7xl mx-auto px-6 mb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="p-8 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl ${cat.color} flex items-center justify-center mb-8 shadow-lg shadow-current/20`}>
                <cat.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-6">{cat.title}</h3>
              <ul className="space-y-4">
                {cat.articles.map((art) => (
                  <li key={art} className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 cursor-pointer transition-colors group/link">
                    {art}
                    <ChevronRightIcon className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-all" />
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- 3. QUICK LINKS & FAQ --- */}
      <section className="max-w-5xl mx-auto px-6 mb-32">
        <div className="bg-slate-900 dark:bg-indigo-600 rounded-[4rem] p-12 text-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold mb-2">Can't find what you're looking for?</h2>
              <p className="opacity-80 font-light">Our support team is online from 8:00 AM to 10:00 PM EAT.</p>
            </div>
            <div className="flex gap-4">
              <button className="px-8 py-4 bg-white text-black rounded-2xl font-bold hover:scale-105 transition-transform flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                Live Chat
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl font-bold hover:bg-white/20 transition-all">
                Email Us
              </button>
            </div>
          </div>
          {/* Decorative background circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </div>
      </section>

      {/* --- 4. POPULAR QUESTIONS --- */}
      <section className="max-w-3xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-10">
          <QuestionMarkCircleIcon className="w-6 h-6 text-indigo-500" />
          <h2 className="text-2xl font-bold">Popular Questions</h2>
        </div>
        
        <div className="space-y-2">
          {["How long does delivery to Mombasa take?", "Do you offer cash on delivery?", "Can I change my order after it's placed?"].map((q, i) => (
            <div key={i} className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-all flex justify-between items-center group">
              <span className="font-medium">{q}</span>
              <ChevronRightIcon className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}