"use client";

import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import {
  CalculatorIcon,
  ChartBarIcon,
  NewspaperIcon,
  ArrowRightIcon,
  SparklesIcon,
  BanknotesIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

/* -------------------------------------------------------------------------- */
/* Constants & Commercial Data */
/* -------------------------------------------------------------------------- */
const regions = [
  { name: "Nairobi Metro & Central", avgPrice: 6500000, trend: "+4.2%", positive: true },
  { name: "Mombasa & Coastal Corridor", avgPrice: 5800000, trend: "+2.8%", positive: true },
  { name: "Rift Valley & Western Yards", avgPrice: 5200000, trend: "+1.5%", positive: true },
  { name: "Northern Corridor Transit", avgPrice: 7100000, trend: "+5.0%", positive: true },
];

const blogPosts = [
  {
    id: 1,
    title: "Financing Heavy Machinery: Fixed vs Variable Commercial Rates",
    href: "/blog/machinery-financing-guide",
    category: "Finance",
    readTime: "4 min read",
  },
  {
    id: 2,
    title: "2026 Fleet Maintenance Costs: Howo vs Isuzu Box Trucks",
    href: "/blog/fleet-maintenance-analysis",
    category: "Insights",
    readTime: "6 min read",
  },
  {
    id: 3,
    title: "Navigating Import Duties & Excise Taxes on Tipper Trucks",
    href: "/blog/import-duties-guide",
    category: "Policy",
    readTime: "5 min read",
  },
  {
    id: 4,
    title: "Maximizing Resale Valuation on Pre-Owned Excavators",
    href: "/blog/excavator-resale-value",
    category: "Valuation",
    readTime: "3 min read",
  },
];

const termPresets = [1, 3, 5, 7];

/* -------------------------------------------------------------------------- */
/* Animation Variants */
/* -------------------------------------------------------------------------- */
const sectionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 20 },
  },
};

/* -------------------------------------------------------------------------- */
/* Subcomponents */
/* -------------------------------------------------------------------------- */
const GridPattern = () => (
  <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none text-slate-900 dark:text-amber-400">
    <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="insights-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M0 32L32 0H16L0 16M32 32V16L16 32" stroke="currentColor" strokeWidth="1" fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#insights-grid)" />
    </svg>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Main Component */
/* -------------------------------------------------------------------------- */
export default function MarketInsightsSection() {
  const [loanAmount, setLoanAmount] = useState(4500000);
  const [interestRate, setInterestRate] = useState(13.5);
  const [termYears, setTermYears] = useState(4);

  // Monthly payment calculation
  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = termYears * 12;
  const monthlyPayment =
    (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths));

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={sectionVariants}
      className="relative py-20 md:py-28 bg-slate-50 dark:bg-[#080B10] text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800/80 transition-colors duration-300 overflow-hidden"
    >
      <GridPattern />

      {/* Ambient Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 md:left-10 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-amber-500/10 dark:bg-amber-500/5 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[400px] md:w-[500px] h-[400px] md:h-[500px] bg-amber-500/10 dark:bg-amber-500/5 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm"
          >
            <SparklesIcon className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>Commercial Tools & Analytics</span>
          </motion.div>

          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-4"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Market Insights & <span className="text-amber-500 dark:text-amber-400">Asset Financing</span>
          </motion.h2>

          <motion.p
            className="text-slate-600 dark:text-slate-400 text-sm md:text-base font-medium max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Calculate commercial vehicle financing options, evaluate regional yard pricing trends, and access active industry guides.
          </motion.p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Commercial Loan Calculator Card (7 Columns) */}
          <motion.div
            variants={cardVariants}
            className="lg:col-span-7 bg-white/90 dark:bg-[#0F141C]/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col justify-between transition-colors duration-300"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-inner">
                    <CalculatorIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">
                      Asset Finance Calculator
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Estimate monthly financing schedules for trucks & heavy equipment
                    </p>
                  </div>
                </div>
                <BanknotesIcon className="w-8 h-8 text-slate-300 dark:text-slate-700 hidden sm:block" />
              </div>

              {/* Controls */}
              <div className="space-y-6">
                
                {/* Loan Amount Input */}
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Vehicle / Asset Cost
                    </label>
                    <span className="text-base font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
                      KES {loanAmount.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="500000"
                    max="20000000"
                    step="250000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] font-extrabold text-slate-400 dark:text-slate-500 mt-1.5">
                    <span>KES 500K</span>
                    <span>KES 20M</span>
                  </div>
                </div>

                {/* Interest Rate Input */}
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Annual Interest Rate
                    </label>
                    <span className="text-base font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
                      {interestRate}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="25"
                    step="0.5"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] font-extrabold text-slate-400 dark:text-slate-500 mt-1.5">
                    <span>5%</span>
                    <span>25%</span>
                  </div>
                </div>

                {/* Repayment Term & Quick Select Buttons */}
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Repayment Term
                    </label>
                    <span className="text-base font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
                      {termYears} {termYears === 1 ? "Year" : "Years"} ({termYears * 12} Mos)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="7"
                    step="1"
                    value={termYears}
                    onChange={(e) => setTermYears(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 mb-3"
                  />
                  
                  {/* Preset Pills */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Quick Select:</span>
                    {termPresets.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setTermYears(preset)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-md transition-all ${
                          termYears === preset
                            ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {preset} {preset === 1 ? "Yr" : "Yrs"}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Calculated Output Banner */}
            <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-amber-500/5 dark:from-amber-500/10 dark:via-amber-500/5 dark:to-amber-500/10 rounded-2xl p-5 text-center border border-amber-500/20">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1">
                Estimated Monthly Repayment
              </span>
              <div className="flex items-baseline justify-center gap-1.5">
                <span className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
                  KES {isFinite(monthlyPayment) ? Math.round(monthlyPayment).toLocaleString() : "0"}
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">/ month</span>
              </div>
            </div>
          </motion.div>

          {/* Regional Market Trends & Articles Column (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            
            {/* Regional Pricing Index Card */}
            <motion.div
              variants={cardVariants}
              className="bg-white/90 dark:bg-[#0F141C]/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none flex-1 transition-colors duration-300"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                  <ChartBarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">
                    Regional Yard Index
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Average commercial inventory benchmark
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {regions.map((region) => (
                  <div
                    key={region.name}
                    className="flex justify-between items-center py-2.5 px-3.5 bg-slate-50 dark:bg-[#080B10]/80 border border-slate-200/60 dark:border-slate-800/80 rounded-xl hover:border-amber-500/40 dark:hover:border-amber-500/30 transition-all group"
                  >
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      {region.name}
                    </span>
                    <div className="text-right">
                      <span className="text-xs font-black text-amber-600 dark:text-amber-400 block">
                        KES {region.avgPrice.toLocaleString()}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
                        {region.trend} MoM
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Articles / Fleet Guides Card */}
            <motion.div
              variants={cardVariants}
              className="bg-white/90 dark:bg-[#0F141C]/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none flex-1 transition-colors duration-300"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                  <NewspaperIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">
                    Fleet Buying Guides
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Industry advisories & market updates
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {blogPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={post.href}
                    className="group flex items-center justify-between p-2.5 rounded-xl bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200 dark:hover:border-slate-700/50 transition-all"
                  >
                    <div className="pr-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9px] font-black uppercase tracking-wider">
                          {post.category}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                          {post.readTime}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                        {post.title}
                      </h4>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </motion.div>

          </div>

        </div>

      </div>
    </motion.section>
  );
}