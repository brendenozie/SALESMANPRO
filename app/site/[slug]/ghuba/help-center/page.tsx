"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  CursorArrowRaysIcon, 
  ShoppingBagIcon, 
  CreditCardIcon, 
  CheckBadgeIcon,
  LightBulbIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";

const steps = [
  {
    number: "01",
    title: "Discover & Select",
    desc: "Browse through our curated collections. Use our smart filters to find exactly what you need—from artisan crafts to global tech.",
    icon: CursorArrowRaysIcon,
    color: "from-blue-500 to-cyan-400",
    tip: "Add items to your 'Wishlist' to get notified about price drops!"
  },
  {
    number: "02",
    title: "Secure Checkout",
    desc: "Review your cart and proceed to our encrypted checkout. Enter your delivery details—we support precise pin-location drops across Kenya.",
    icon: ShoppingBagIcon,
    color: "from-indigo-600 to-purple-500",
    tip: "Double-check your phone number for M-Pesa prompts."
  },
  {
    number: "03",
    title: "Flexible Payment",
    desc: "Choose your preferred method. We support M-Pesa, Credit/Debit Cards, and Ghuba Wallet for instant transactions.",
    icon: CreditCardIcon,
    color: "from-emerald-500 to-teal-400",
    tip: "Ghuba Wallet users get 2% cashback on every purchase."
  },
  {
    number: "04",
    title: "Track & Receive",
    desc: "Sit back and relax. Follow your package in real-time via our 'Track Order' feature until it reaches your doorstep.",
    icon: CheckBadgeIcon,
    color: "from-rose-500 to-orange-400",
    tip: "Our riders will call you 10 minutes before arrival."
  }
];

export default function GhubaHowToBuy() {
  return (
    <main className="bg-white dark:bg-[#050505] min-h-screen pt-32 pb-24 text-slate-900 dark:text-slate-100 transition-colors duration-500 overflow-hidden">
      
      {/* --- 1. HERO: THE GUIDED JOURNEY --- */}
      <section className="max-w-7xl mx-auto px-6 mb-24 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] rounded-full -z-10" />
        
        <div className="text-center max-w-3xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]"
          >
            Shopping made <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-emerald-500 italic">Effortless.</span>
          </motion.h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 font-light">
            New to Ghuba? Follow our 4-step guide to get your favorite products delivered in record time.
          </p>
        </div>
      </section>

      {/* --- 2. THE STEPPER (VERTICAL/HORIZONTAL HYBRID) --- */}
      <section className="max-w-7xl mx-auto px-6 mb-40">
        <div className="space-y-12 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15 }}
              viewport={{ once: true }}
              className="relative group"
            >
              {/* Step Number Background */}
              <div className="absolute -top-10 -left-4 text-9xl font-black text-slate-100 dark:text-slate-900/50 -z-10 select-none group-hover:text-indigo-50 dark:group-hover:text-indigo-950/20 transition-colors">
                {step.number}
              </div>

              <div className="p-8 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm group-hover:shadow-2xl group-hover:shadow-indigo-500/5 transition-all h-full flex flex-col">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-8 shadow-lg`}>
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-light leading-relaxed mb-8 flex-grow">
                  {step.desc}
                </p>

                {/* Pro-Tip Box */}
                <div className="mt-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex gap-3 items-start border border-transparent group-hover:border-indigo-100 dark:group-hover:border-indigo-900 transition-colors">
                  <LightBulbIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-tight uppercase tracking-wider">
                    {step.tip}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- 3. THE "WHY SHOP WITH US" BENTO --- */}
      <section className="max-w-7xl mx-auto px-6 mb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-slate-900 dark:bg-indigo-600 rounded-[4rem] p-12 text-white overflow-hidden relative group">
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-6">Buyer Protection <br /> Guaranteed.</h2>
              <p className="max-w-md opacity-80 mb-8 font-light">
                Not what you expected? Our 7-day money-back guarantee ensures your funds are safe until you are 100% satisfied.
              </p>
              <button className="flex items-center gap-2 font-bold group">
                Read our Refund Policy 
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
            {/* Visual element */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 opacity-10 group-hover:opacity-20 transition-opacity">
              <CheckBadgeIcon className="w-96 h-96" />
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-[4rem] p-12 border border-emerald-100 dark:border-emerald-500/20">
            <h3 className="text-2xl font-bold text-emerald-900 dark:text-emerald-400 mb-4">Fastest in <br /> Kenya.</h3>
            <p className="text-emerald-800/60 dark:text-emerald-400/60 font-medium mb-8">
              Nairobi: Same Day <br />
              Upcountry: 24-48 Hours
            </p>
            <div className="w-full h-1 bg-emerald-200 dark:bg-emerald-500/30 rounded-full overflow-hidden">
               <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-emerald-500" 
               />
            </div>
          </div>
        </div>
      </section>

      {/* --- 4. CALL TO ACTION --- */}
      <section className="max-w-3xl mx-auto px-6 text-center">
        <div className="p-1 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 inline-block mb-8">
          <div className="px-8 py-3 bg-white dark:bg-black rounded-full">
            <span className="font-bold text-sm">Ready to start?</span>
          </div>
        </div>
        <h2 className="text-4xl font-bold mb-12">Your next favorite find is just a few clicks away.</h2>
        <button className="px-12 py-6 bg-slate-900 dark:bg-white text-white dark:text-black rounded-3xl font-black text-xl hover:scale-105 transition-transform active:scale-95 shadow-2xl">
          Start Shopping Now
        </button>
      </section>

    </main>
  );
}