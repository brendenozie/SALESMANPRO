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
} from "@heroicons/react/24/outline";

/* -------------------------------------------------------------------------- */
/* Constants & Commercial Data */
/* -------------------------------------------------------------------------- */
const regions = [
  { name: "Nairobi Metro & Central", avgPrice: 6500000, trend: "+4.2%" },
  { name: "Mombasa & Coastal Corridor", avgPrice: 5800000, trend: "+2.8%" },
  { name: "Rift Valley & Western Yards", avgPrice: 5200000, trend: "+1.5%" },
  { name: "Northern Corridor Transit", avgPrice: 7100000, trend: "+5.0%" },
];

const blogPosts = [
  {
    id: 1,
    title: "Financing Heavy Machinery: Fixed vs Variable Commercial Rates",
    href: "/blog/machinery-financing-guide",
    category: "Finance",
  },
  {
    id: 2,
    title: "2026 Fleet Maintenance Costs: Howo vs Isuzu Box Trucks",
    href: "/blog/fleet-maintenance-analysis",
    category: "Insights",
  },
  {
    id: 3,
    title: "Navigating Import Duties & Excise Taxes on Tipper Trucks",
    href: "/blog/import-duties-guide",
    category: "Policy",
  },
  {
    id: 4,
    title: "Maximizing Resale Valuation on Pre-Owned Excavators",
    href: "/blog/excavator-resale-value",
    category: "Valuation",
  },
];

/* -------------------------------------------------------------------------- */
/* Animation Variants */
/* -------------------------------------------------------------------------- */
const sectionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 18 },
  },
};

/* -------------------------------------------------------------------------- */
/* Subcomponents */
/* -------------------------------------------------------------------------- */
const GridPattern = () => (
  <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
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

  // Monthly payment calculation formula
  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = termYears * 12;
  const monthlyPayment =
    (loanAmount * monthlyRate) /
    (1 - Math.pow(1 + monthlyRate, -totalMonths));

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={sectionVariants}
      className="relative py-20 md:py-28 bg-slate-900 dark:bg-[#080B10] text-white border-t border-slate-800 overflow-hidden"
    >
      <GridPattern />

      {/* Ambient Glow Effects */}
      <div className="absolute top-1/4 left-10 w-[500px] h-[500px] bg-amber-500/5 blur-[160px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-amber-500/5 blur-[160px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4"
          >
            <SparklesIcon className="w-4 h-4" />
            <span>Commercial Tools & Analytics</span>
          </motion.div>

          <motion.h2
            className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Market Insights & <span className="text-amber-500">Asset Financing</span>
          </motion.h2>

          <motion.p
            className="text-slate-400 text-sm md:text-base font-medium max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Calculate commercial vehicle financing options, evaluate regional yard pricing trends, and read active industry guides.
          </motion.p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Commercial Loan Calculator Card (7 Columns) */}
          <motion.div
            variants={cardVariants}
            className="lg:col-span-7 bg-slate-800/40 dark:bg-[#0F141C] border border-slate-700/60 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-700/60">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <CalculatorIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold uppercase tracking-tight text-white">
                      Asset Finance Calculator
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Estimate monthly financing schedules for trucks & machinery
                    </p>
                  </div>
                </div>
                <BanknotesIcon className="w-8 h-8 text-slate-700 hidden sm:block" />
              </div>

              {/* Sliders & Controls */}
              <div className="space-y-6">
                
                {/* Loan Amount */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                      Vehicle / Asset Cost
                    </label>
                    <span className="text-sm font-black text-amber-400">
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
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 mt-1">
                    <span>KES 500K</span>
                    <span>KES 20M</span>
                  </div>
                </div>

                {/* Interest Rate */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                      Annual Interest Rate (%)
                    </label>
                    <span className="text-sm font-black text-amber-400">
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
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 mt-1">
                    <span>5%</span>
                    <span>25%</span>
                  </div>
                </div>

                {/* Repayment Term */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                      Repayment Term
                    </label>
                    <span className="text-sm font-black text-amber-400">
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
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 mt-1">
                    <span>1 Year</span>
                    <span>7 Years</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Calculated Result Display */}
            <div className="mt-8 pt-6 border-t border-slate-700/60 bg-slate-900/60 rounded-2xl p-5 text-center">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">
                Estimated Monthly Repayment
              </span>
              <span className="text-2xl md:text-4xl font-black text-amber-400 tracking-tight">
                KES {isFinite(monthlyPayment) ? Math.round(monthlyPayment).toLocaleString() : "0"}
                <span className="text-xs text-slate-400 font-bold tracking-normal"> / month</span>
              </span>
            </div>
          </motion.div>

          {/* Regional Market Trends & Articles Column (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            
            {/* Regional Valuation Card */}
            <motion.div
              variants={cardVariants}
              className="bg-slate-800/40 dark:bg-[#0F141C] border border-slate-700/60 dark:border-slate-800 rounded-3xl p-6 shadow-xl flex-1"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <ChartBarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold uppercase tracking-tight text-white">
                    Regional Average Price
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Commercial inventory index across key hubs
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {regions.map((region) => (
                  <div
                    key={region.name}
                    className="flex justify-between items-center py-2.5 px-3.5 bg-slate-900/60 border border-slate-800/80 rounded-xl hover:border-slate-700 transition-colors"
                  >
                    <span className="text-xs font-bold text-slate-300">
                      {region.name}
                    </span>
                    <div className="text-right">
                      <span className="text-xs font-black text-amber-400 block">
                        KES {region.avgPrice.toLocaleString()}
                      </span>
                      <span className="text-[9px] font-extrabold text-emerald-400">
                        {region.trend} MoM
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Industry Guides / Articles Card */}
            <motion.div
              variants={cardVariants}
              className="bg-slate-800/40 dark:bg-[#0F141C] border border-slate-700/60 dark:border-slate-800 rounded-3xl p-6 shadow-xl flex-1"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <NewspaperIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold uppercase tracking-tight text-white">
                    Fleet Buying Guides
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Industry advisories & commercial reports
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {blogPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={post.href}
                    className="group flex items-start justify-between p-2.5 rounded-xl hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="pr-2">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-1">
                        {post.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors line-clamp-1">
                        {post.title}
                      </h4>
                    </div>
                    <ArrowRightIcon className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors shrink-0 mt-2" />
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