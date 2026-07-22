"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  ChatBubbleBottomCenterTextIcon,
  KeyIcon,
  DocumentCheckIcon,
  ArrowRightIcon,
  TruckIcon,
  SparklesIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

const stepVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState<"BUY" | "SELL">("BUY");

  const buyerSteps = [
    {
      step: "01",
      icon: MagnifyingGlassIcon,
      title: "Discover Assets",
      description:
        "Filter through verified commercial trucks, heavy machinery, and haulage equipment across the country.",
    },
    {
      step: "02",
      icon: ChatBubbleBottomCenterTextIcon,
      title: "Connect directly",
      description:
        "Engage verified sellers, review full vehicle telemetry, schedule inspections, and request formal quotations.",
    },
    {
      step: "03",
      icon: KeyIcon,
      title: "Close & Deploy",
      description:
        "Finalize payment terms or lease agreements securely and add high-performance fleet power to your operations.",
    },
  ];

  const sellerSteps = [
    {
      step: "01",
      icon: DocumentCheckIcon,
      title: "List Inventory",
      description:
        "Upload vehicle specifications, maintenance records, photos, and set custom pricing for sale or lease.",
    },
    {
      step: "02",
      icon: ShieldCheckIcon,
      title: "Get Verified",
      description:
        "Our team authenticates fleet assets to provide prospective commercial buyers total transparency.",
    },
    {
      step: "03",
      icon: TruckIcon,
      title: "Complete Deal",
      description:
        "Receive direct buyer leads, negotiate offers seamlessly, and scale your commercial dealership operations.",
    },
  ];

  const currentSteps = activeTab === "BUY" ? buyerSteps : sellerSteps;

  return (
    <section className="py-20 md:py-28 bg-slate-900 dark:bg-[#080B10] text-white relative overflow-hidden border-t border-slate-800">
      {/* Background Subtle Tech Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* HEADER & TOGGLE */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4"
          >
            <SparklesIcon className="h-4 w-4" />
            <span>Seamless Fleet Procurement</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-4"
          >
            How <span className="text-amber-500">SalesmanPro</span> Works
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-base md:text-lg font-medium mb-8"
          >
            Optimized commercial transactions whether you are scaling up your enterprise fleet or liquidating heavy assets.
          </motion.p>

          {/* Interactive Role Switcher */}
          <div className="flex items-center bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60 shadow-inner">
            <button
              onClick={() => setActiveTab("BUY")}
              className={`px-8 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-300 ${
                activeTab === "BUY"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Buying / Renting Fleet
            </button>
            <button
              onClick={() => setActiveTab("SELL")}
              className={`px-8 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-300 ${
                activeTab === "SELL"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Selling / Listing Inventory
            </button>
          </div>
        </div>

        {/* STEP CARDS GRID */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
          >
            {currentSteps.map((stepItem, index) => {
              const Icon = stepItem.icon;
              return (
                <motion.div
                  key={stepItem.step}
                  variants={stepVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: index * 0.15 }}
                  className="relative group p-8 rounded-3xl bg-slate-800/40 dark:bg-[#0F141C] border border-slate-800 hover:border-amber-500/40 transition-all duration-300 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    {/* Top Step Badge & Icon */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700/60 text-amber-400 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-300">
                        <Icon className="h-8 w-8" />
                      </div>
                      <span className="text-3xl font-black text-slate-700 dark:text-slate-800 group-hover:text-amber-500/30 transition-colors">
                        {stepItem.step}
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold text-white uppercase tracking-tight mb-3">
                      {stepItem.title}
                    </h3>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                      {stepItem.description}
                    </p>
                  </div>

                  {/* Accent Line */}
                  <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Step {stepItem.step} Workflow</span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* CALL TO ACTION BANNER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden p-8 md:p-12 rounded-3xl bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700/60 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="text-center md:text-left relative z-10 max-w-xl">
            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-3">
              Ready to Expand Your Fleet Operations?
            </h3>
            <p className="text-slate-300 text-sm md:text-base font-medium">
              List your commercial vehicles today or talk directly with our verified platform dealers across Kenya.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full md:w-auto">
            <Link
              href="/automotive/listings"
              className="inline-flex items-center justify-center px-8 py-4 text-xs font-extrabold uppercase tracking-wider rounded-xl text-slate-950 bg-amber-500 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 active:scale-95 text-center"
            >
              <span>Explore Fleet Inventory</span>
              <ArrowRightIcon className="ml-2.5 h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}