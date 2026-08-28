"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRightIcon, 
  CheckCircleIcon, 
  SparklesIcon,
  BoltIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

export default function Join() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    // Simulate API submission delay
    setTimeout(() => {
      setStatus("success");
      setEmail("");
    }, 1200);
  };

  return (
    <section id="join" className="relative py-24 sm:py-32 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden transition-colors duration-300">
      
      {/* Background Radial Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center opacity-70 dark:opacity-30">
        <div className="w-[600px] h-[600px] bg-gradient-to-tr from-orange-500 via-amber-400 to-yellow-300 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
        <div className="relative p-8 sm:p-14 lg:p-16 rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl backdrop-blur-xl overflow-hidden">
          
          {/* Top Edge Gradient Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400" />

          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-4">
            
            {/* Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="inline-block"
            >
              <span className="text-xs font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/60 px-4 py-1.5 rounded-full border border-orange-200 dark:border-orange-800/40 inline-flex items-center gap-1.5 shadow-sm">
                <SparklesIcon className="w-3.5 h-3.5" />
                Start Growing Today
              </span>
            </motion.div>

            {/* Main Title */}
            <motion.h2
              className="text-3xl sm:text-5xl font-black tracking-tight leading-tight"
              initial={{ opacity: 0, y: -15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Ready to Accelerate <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500">
                Your Business Sales?
              </span>
            </motion.h2>

            {/* Description */}
            <motion.p
              className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed"
              initial={{ opacity: 0, y: -15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Join hundreds of businesses using SalesmanPro to automate M-PESA checkouts, inventory control, and AI-powered WhatsApp sales.
            </motion.p>
          </div>

          {/* Form & Dynamic Response Stage */}
          <motion.div
            className="mt-10 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div
                  key="success-box"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-center space-y-2 shadow-sm"
                >
                  <CheckCircleIcon className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  <h3 className="text-lg font-extrabold text-emerald-950 dark:text-emerald-100">
                    You&apos;re on the access list!
                  </h3>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 max-w-sm mx-auto">
                    Check your inbox shortly to complete setting up your SalesmanPro store.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form-box"
                  onSubmit={handleSubmit}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your work email address"
                    required
                    className="flex-1 px-5 py-4 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="flex-shrink-0 flex items-center justify-center gap-2 px-8 py-4 text-xs font-black uppercase tracking-wider text-slate-950 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:hover:scale-100"
                  >
                    {status === "loading" ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <>
                        <span>Get Started Free</span>
                        <ArrowRightIcon className="h-4 w-4 stroke-[3]" />
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Feature Trust Badges */}
            <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircleIcon className="w-4 h-4 text-orange-500 flex-shrink-0" />
                Free 14-day trial
              </span>
              <span className="flex items-center gap-1.5">
                <BoltIcon className="w-4 h-4 text-orange-500 flex-shrink-0" />
                Instant M-PESA setup
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheckIcon className="w-4 h-4 text-orange-500 flex-shrink-0" />
                No credit card required
              </span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}