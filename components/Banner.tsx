"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  SparklesIcon, 
  CheckCircleIcon, 
  ShoppingBagIcon, 
  ChatBubbleLeftEllipsisIcon,
  ArrowRightIcon,
  PlayIcon,
  BoltIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

export default function HeroSection() {
  const [salesCount] = useState(248500);
  const [orderState, setOrderState] = useState<"processing" | "confirmed">("processing");

  useEffect(() => {
    const timer = setInterval(() => {
      setOrderState((prev) => (prev === "processing" ? "confirmed" : "processing"));
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const handleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", window.location.origin);
    window.location.href = authUrl.toString();
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-6 md:px-12 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden transition-colors duration-300">
      
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-orange-500/10 via-amber-400/10 to-transparent dark:from-orange-600/10 dark:via-amber-500/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute -bottom-10 left-0 w-full h-32 bg-gradient-to-t from-slate-100 dark:from-slate-950 to-transparent pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
        
        {/* Left Column: Headline, Description & CTAs */}
        <div className="lg:col-span-7 space-y-8 text-center lg:text-left">

          {/* Clean Solid Headline without Text Gradients */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.06]"
          >
            Run your business. <br />
            Sell everywhere. <br />
            <span className="text-orange-600 dark:text-orange-400">
              Automate with AI.
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl font-normal leading-relaxed mx-auto lg:mx-0"
          >
            Connect POS counter sales, live inventory, WhatsApp AI agents, custom storefronts, and automated M-PESA STK pushes into one intelligent operating system.
          </motion.p>

          {/* Call-to-Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
          >
            <button
              onClick={handleSignIn}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-orange-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>Start Free Trial</span>
              <ArrowRightIcon className="w-4 h-4 stroke-[3]" />
            </button>

            <a
              href="#interactive-demo"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white font-extrabold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2.5 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlayIcon className="w-4 h-4 fill-orange-500 text-orange-500" />
              <span>See How It Works</span>
            </a>
          </motion.div>

          {/* Micro-Trust Proof Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="pt-2 flex flex-wrap justify-center lg:justify-start gap-6 text-xs font-bold text-slate-500 dark:text-slate-400"
          >
            <span className="flex items-center gap-1.5">
              <BoltIcon className="w-4 h-4 text-orange-500 flex-shrink-0" /> Instant M-PESA STK Push
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheckIcon className="w-4 h-4 text-orange-500 flex-shrink-0" /> Zero Coding Required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircleIcon className="w-4 h-4 text-orange-500 flex-shrink-0" /> 14-Day Free Access
            </span>
          </motion.div>

        </div>

        {/* Right Column: Platform Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:col-span-5 relative"
        >
          {/* Main Dashboard Card */}
          <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
            
            {/* Top Bar Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono font-medium text-slate-400 dark:text-slate-500">SalesmanPro OS v4.2</span>
              </div>
              <span className="text-[11px] font-bold px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Active
              </span>
            </div>

            {/* Metrics Dashboard Grid */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="bg-slate-50 dark:bg-slate-950/80 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Today&apos;s Revenue</span>
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                  KES {salesCount.toLocaleString()}
                </p>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1 mt-0.5">
                  ↑ +18.4% vs yesterday
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/80 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Active POS Counters</span>
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">126</p>
                <span className="text-[10px] text-orange-600 dark:text-orange-400 font-extrabold mt-0.5 block">
                  7 low stock alerts
                </span>
              </div>
            </div>

            {/* Live Order Stream Bar */}
            <div className="bg-slate-50 dark:bg-slate-950/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 flex items-center justify-center flex-shrink-0 border border-orange-200 dark:border-orange-800/50">
                  <ShoppingBagIcon className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">Nike Air Max (Size 42)</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">Order #8921 • M-PESA KES 8,500</p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.span
                  key={orderState}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg flex-shrink-0 ${
                    orderState === "confirmed"
                      ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                      : "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse"
                  }`}
                >
                  {orderState === "confirmed" ? "Confirmed ✓" : "Verifying..."}
                </motion.span>
              </AnimatePresence>
            </div>

          </div>

          {/* Floating AI Assistant Card */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
            className="absolute -bottom-6 -left-6 z-20 w-72 bg-white/95 dark:bg-slate-900/95 border border-orange-200 dark:border-orange-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-md hidden sm:block"
          >
            <div className="flex items-center gap-2 mb-2 text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider">
              <ChatBubbleLeftEllipsisIcon className="w-4 h-4 text-orange-500" />
              <span>WhatsApp AI Sales Agent</span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-950/90 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 leading-relaxed">
              &quot;Yes! We have 3 pairs left in stock. I&apos;ve sent your M-PESA checkout link below.&quot;
            </p>
          </motion.div>

        </motion.div>

      </div>
    </section>
  );
}